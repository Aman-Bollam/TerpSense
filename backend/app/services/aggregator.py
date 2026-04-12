import json
from datetime import date, timedelta
from pathlib import Path
from typing import List

from app.models.schemas import SpendingSummary, Transaction

DATA_DIR = Path(__file__).parent.parent / "data"

# Reference date for "this week" and "this month" — pinned to demo date
DEMO_TODAY = date(2026, 4, 11)

# Categories to track
TRACKED_CATEGORIES = ["Clothing", "Dining", "Entertainment", "Transport", "Subscriptions", "Health", "Shopping", "Other"]


def compute_summary(transactions: List[Transaction], user_id: str = "demo") -> SpendingSummary:
    week_start = DEMO_TODAY - timedelta(days=7)
    month_start = DEMO_TODAY.replace(day=1)

    week: dict[str, float] = {c: 0.0 for c in TRACKED_CATEGORIES}
    month: dict[str, float] = {c: 0.0 for c in TRACKED_CATEGORIES}
    week_counts: dict[str, int] = {c: 0 for c in TRACKED_CATEGORIES}

    for t in transactions:
        tx_date = date.fromisoformat(t.date)
        # Normalize "Food" → "Dining" for legacy data
        cat = t.category
        if cat == "Food":
            cat = "Dining"
        if cat not in TRACKED_CATEGORIES:
            cat = "Other"

        if tx_date >= week_start:
            week[cat] = round(week[cat] + t.amount, 2)
            week_counts[cat] += 1
        if tx_date >= month_start:
            month[cat] = round(month[cat] + t.amount, 2)

    week_clean = {k: v for k, v in week.items() if v > 0}
    month_clean = {k: v for k, v in month.items() if v > 0}
    counts_clean = {k: v for k, v in week_counts.items() if v > 0}

    total_week = round(sum(week_clean.values()), 2)
    total_month = round(sum(month_clean.values()), 2)
    avg_weekly_spend = round(total_month / 4.3, 2)

    category_weekly_averages = {
        cat: round(amt / 4.3, 2) for cat, amt in month_clean.items()
    }

    return SpendingSummary(
        user_id=user_id,
        week=week_clean,
        month=month_clean,
        total_week=total_week,
        total_month=total_month,
        avg_weekly_spend=avg_weekly_spend,
        category_weekly_averages=category_weekly_averages,
        category_weekly_counts=counts_clean,
    )


def load_precomputed_summary(user_id: str = "demo") -> SpendingSummary:
    """Returns the pre-computed mock summary for instant dashboard load."""
    with open(DATA_DIR / "mock_spending_summary.json") as f:
        data = json.load(f)
    return SpendingSummary(**data)
