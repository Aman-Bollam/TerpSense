import asyncio

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    DecisionRequest,
    DecisionResponse,
    InterventionResponse,
    PurchaseRequest,
)
from app.services import nessie, openai_client, scoring
from app.services.aggregator import load_precomputed_summary
from app.state import goal_state

router = APIRouter()

CONFIRMATION_MESSAGES = {
    "redirect": "Smart move. Your savings goal just got closer.",
    "delay": "Got it. Come back in 7 days if you still want it.",
    "proceed": "Noted. No judgment — just keeping you informed.",
    "alternative": "Good thinking. A cheaper option could save you real money.",
}


@router.post("/analyze-purchase", response_model=InterventionResponse)
async def analyze_purchase(body: PurchaseRequest):
    try:
        # 1. Fetch spending context + transactions in parallel
        spending_summary = load_precomputed_summary(body.user_id)
        goals, transactions = await asyncio.gather(
            nessie.get_goals(body.user_id),
            nessie.get_transactions(body.user_id),
        )
        goal = goals[0] if goals else None

        # Apply any in-session goal mutations
        if goal:
            override = goal_state.get(goal.id)
            if override is not None:
                goal = goal.model_copy(update={"current_amount": override})

        # 3. Compute severity + deterministic metrics
        score_result = scoring.compute_severity(
            purchase_amount=body.amount,
            category=body.category,
            spending_summary=spending_summary,
            goal=goal,
        )

        # 4. Call Azure OpenAI for natural language (insights, alternative, summary)
        ai_output = openai_client.call_openai(
            purchase_amount=body.amount,
            category=body.category,
            merchant=body.merchant,
            score_result=score_result,
            goal=goal,
            spending_summary=spending_summary,
            recent_transactions=transactions[:8],
        )

        # 5. Merge deterministic + AI output into final response
        return InterventionResponse(
            severity=score_result.severity,
            insights=ai_output["insights"],
            goal_impact_days=score_result.goal_impact_days,
            redirect_value_6mo=score_result.redirect_value_6mo,
            alternative_suggestion=ai_output.get("alternative_suggestion"),
            summary_line=ai_output["summary_line"],
            score=score_result.score,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/record-decision", response_model=DecisionResponse)
async def record_decision(body: DecisionRequest):
    try:
        updated_goal_amount = None

        if body.decision == "redirect":
            goals = await nessie.get_goals(body.user_id)
            if goals:
                goal = goals[0]
                current = goal_state.get(goal.id, goal.current_amount)
                new_amount = round(min(current + body.purchase_amount, goal.target_amount), 2)
                goal_state[goal.id] = new_amount
                updated_goal_amount = new_amount

        message = CONFIRMATION_MESSAGES.get(body.decision, "Decision recorded.")

        return DecisionResponse(
            acknowledged=True,
            decision=body.decision,
            updated_goal_amount=updated_goal_amount,
            confirmation_message=message,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset-demo")
async def reset_demo():
    """Resets session state for demo restarts. Dev convenience endpoint."""
    from app.state import reset_demo_state
    reset_demo_state()
    return {"reset": True}
