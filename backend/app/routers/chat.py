import logging
from typing import Optional
import httpx

from fastapi import APIRouter
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatContext(BaseModel):
    purchase_amount: Optional[float] = None
    category: Optional[str] = None
    merchant: Optional[str] = None
    severity: Optional[str] = None
    goal_impact_days: Optional[int] = None
    redirect_value_6mo: Optional[float] = None
    summary_line: Optional[str] = None


class ChatRequest(BaseModel):
    user_id: str = "demo"
    message: str
    context: ChatContext = ChatContext()


class ChatResponse(BaseModel):
    response: str


CRISIS_WORDS = ["die", "kill myself", "suicide", "self harm", "self-harm", "hurt myself", "worthless", "hopeless", "end it", "want to die"]
CRISIS_RESPONSE = "I hear you, and I'm really glad you said something. Whatever you're going through right now matters way more than any purchase. Please reach out to someone you trust, or text 988 — it's the Suicide & Crisis Lifeline, free and 24/7. You don't have to figure this out alone. 💙"


def _is_crisis(message: str) -> bool:
    msg = message.lower()
    return any(w in msg for w in CRISIS_WORDS)


def _build_chat_system(ctx: ChatContext) -> str:
    merchant = ctx.merchant or ctx.category or "this purchase"
    severity_desc = {
        "red": "high-risk — this purchase significantly conflicts with the user's goals",
        "orange": "moderate-risk — worth pausing to reconsider",
        "yellow": "low-risk — minor concern",
    }.get(ctx.severity or "yellow", "")

    return f"""You are TerpSense, a warm and emotionally intelligent financial coach. You genuinely care about the person you're talking to — not just their money, but their wellbeing.

Current purchase context (reference when relevant):
- Item: {merchant} (${ctx.purchase_amount:.2f} in {ctx.category})
- Risk level: {severity_desc}
- If they proceed: delays savings goal by {ctx.goal_impact_days} days
- If they redirect: grows to ${ctx.redirect_value_6mo:.2f} in 6 months

Guidelines:
- If someone shares something emotional or personal, respond with genuine empathy first. Don't force finances into every response.
- If someone asks about anything outside finance — relationships, stress, anxiety, addiction — respond like a caring friend would.
- For financial questions, be specific and cite the real numbers above.
- Sound like a smart, caring friend — not a bank chatbot.
- Keep responses to 3-4 sentences max. Never preachy."""


@router.post("/api/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    # Handle crisis messages locally before hitting Azure
    if _is_crisis(body.message):
        return ChatResponse(response=CRISIS_RESPONSE)

    endpoint = settings.azure_openai_endpoint.rstrip("/")
    deployment = settings.azure_openai_deployment
    api_version = settings.azure_openai_api_version
    api_key = settings.azure_openai_key

    url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version={api_version}"

    payload = {
        "messages": [
            {"role": "system", "content": _build_chat_system(body.context)},
            {"role": "user", "content": body.message},
        ],
        "temperature": 0.7,
        "max_tokens": 200,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(
                url,
                headers={"api-key": api_key, "Content-Type": "application/json"},
                json=payload,
            )
            print(f"AZURE STATUS: {res.status_code}")
            res.raise_for_status()
            data = res.json()
            reply = data["choices"][0]["message"]["content"].strip()
            return ChatResponse(response=reply)

    except Exception as e:
        print(f"CHAT ERROR: {e}")
        return ChatResponse(response=_local_fallback(body.message, body.context))


def _local_fallback(message: str, ctx: ChatContext) -> str:
    msg = message.lower()
    amount = ctx.purchase_amount or 0
    days = ctx.goal_impact_days or 0
    redirect = ctx.redirect_value_6mo or 0

    if any(w in msg for w in ["afford", "can i", "should i"]):
        return (
            f"Based on your spending, this ${amount:.2f} purchase would delay your goal by {days} days. "
            f"If you redirected it to savings instead, it could grow to ${redirect:.2f} in 6 months."
        )
    if any(w in msg for w in ["instead", "alternative", "cheaper"]):
        return (
            f"For a cheaper option, try searching secondhand sites like ThredUp or Facebook Marketplace. "
            f"Saving this ${amount:.2f} now means ${redirect:.2f} in 6 months at 5% APY."
        )
    if any(w in msg for w in ["save", "savings", "goal"]):
        return (
            f"Redirecting this ${amount:.2f} to your savings goal would bring you {days} days closer to hitting it. "
            f"At 10% annual returns, that becomes ${round(amount * (1.1 ** 10)):.0f} in 10 years."
        )
    return (
        f"I'm here for you. This is a {ctx.severity or 'yellow'}-risk purchase — "
        f"proceeding delays your goal by {days} days, but redirecting it grows to ${redirect:.2f} in 6 months. "
        f"What's on your mind?"
    )