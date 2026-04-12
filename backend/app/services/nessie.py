import json
from pathlib import Path
from typing import List

import httpx

from app.config import settings
from app.models.schemas import Goal, Transaction
from app.services.category_inference import infer_category

DATA_DIR = Path(__file__).parent.parent / "data"

# Default Nessie account ID (Alex Chen — demo user)
NESSIE_ACCOUNT_ID = "69daf1582395a9074d5a4b7b"


def _load_mock_transactions() -> List[Transaction]:
    with open(DATA_DIR / "mock_transactions.json") as f:
        return [Transaction(**t) for t in json.load(f)]


def _load_mock_goals() -> List[Goal]:
    with open(DATA_DIR / "mock_goals.json") as f:
        return [Goal(**g) for g in json.load(f)]


def _parse_nessie_purchase(p: dict) -> Transaction:
    """Convert a Nessie purchase object to our Transaction schema."""
    description = p.get("description") or p.get("merchant_id", "Unknown")
    return Transaction(
        id=p["_id"],
        amount=float(p.get("amount", 0)),
        category=infer_category(description),
        merchant=description,
        date=p.get("purchase_date", "2026-01-01"),
        type="purchase",
    )


async def get_transactions(user_id: str, account_id: str = NESSIE_ACCOUNT_ID) -> List[Transaction]:
    if settings.use_mock_data:
        return _load_mock_transactions()

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.nessie_base_url}/accounts/{account_id}/purchases",
            params={"key": settings.nessie_api_key},
            timeout=10,
        )
        response.raise_for_status()
        raw = response.json()

        if not isinstance(raw, list):
            # Nessie returns [] or error dict
            return _load_mock_transactions()

        transactions = [_parse_nessie_purchase(p) for p in raw]

        # Sort by date descending (most recent first)
        transactions.sort(key=lambda t: t.date, reverse=True)
        return transactions


async def create_purchase(
    amount: float,
    description: str,
    account_id: str = NESSIE_ACCOUNT_ID,
) -> bool:
    """POST a purchase to the active Nessie account. Returns True on success."""
    from datetime import date

    payload = {
        "merchant_id": "66efc6a99683f20dd518aaf6",
        "medium": "balance",
        "purchase_date": date.today().isoformat(),
        "amount": round(amount, 2),
        "description": description,
        "status": "completed",
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.nessie_base_url}/accounts/{account_id}/purchases",
            params={"key": settings.nessie_api_key},
            json=payload,
            timeout=10,
        )
        return response.status_code in (200, 201)


async def get_goals(user_id: str) -> List[Goal]:
    # Nessie's hackathon API has no savings goal concept —
    # goals are always served from mock data.
    return _load_mock_goals()
