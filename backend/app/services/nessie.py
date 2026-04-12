import json
from pathlib import Path
from typing import List

import httpx

from app.config import settings
from app.models.schemas import Goal, Transaction

DATA_DIR = Path(__file__).parent.parent / "data"


def _load_mock_transactions() -> List[Transaction]:
    with open(DATA_DIR / "mock_transactions.json") as f:
        return [Transaction(**t) for t in json.load(f)]


def _load_mock_goals() -> List[Goal]:
    with open(DATA_DIR / "mock_goals.json") as f:
        return [Goal(**g) for g in json.load(f)]


async def get_transactions(user_id: str) -> List[Transaction]:
    if settings.use_mock_data:
        return _load_mock_transactions()

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.nessie_base_url}/accounts/{user_id}/purchases",
            params={"key": settings.nessie_api_key},
        )
        response.raise_for_status()
        raw = response.json()
        return [
            Transaction(
                id=t["_id"],
                amount=t["amount"],
                category=t.get("description", "Other"),
                merchant=t.get("merchant_id", "Unknown"),
                date=t["purchase_date"],
                type="purchase",
            )
            for t in raw
        ]


async def get_goals(user_id: str) -> List[Goal]:
    if settings.use_mock_data:
        return _load_mock_goals()

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.nessie_base_url}/accounts/{user_id}/savings",
            params={"key": settings.nessie_api_key},
        )
        response.raise_for_status()
        raw = response.json()
        return [
            Goal(
                id=g["_id"],
                name=g.get("nickname", "Savings Goal"),
                target_amount=g.get("target_amount", 1000.0),
                current_amount=g.get("balance", 0.0),
                monthly_contribution_needed=95.0,
                days_to_goal_at_current_pace=184,
                created_at=g.get("start_date", "2026-01-01"),
            )
            for g in raw
        ]
