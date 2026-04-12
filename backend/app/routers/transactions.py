from fastapi import APIRouter, HTTPException

from app.models.schemas import SpendingSummary, TransactionsResponse
from app.services import aggregator, nessie

router = APIRouter()


@router.get("/transactions", response_model=TransactionsResponse)
async def get_transactions(user_id: str = "demo", days: int = 30):
    try:
        transactions = await nessie.get_transactions(user_id)
        return TransactionsResponse(user_id=user_id, transactions=transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/spending-summary", response_model=SpendingSummary)
async def get_spending_summary(user_id: str = "demo"):
    try:
        # Use pre-computed summary for instant load — matches demo data exactly
        return aggregator.load_precomputed_summary(user_id)
    except Exception as e:
        # Fallback: compute live from transactions
        try:
            transactions = await nessie.get_transactions(user_id)
            return aggregator.compute_summary(transactions, user_id)
        except Exception as e2:
            raise HTTPException(status_code=500, detail=str(e2))
