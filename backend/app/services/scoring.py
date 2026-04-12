from dataclasses import dataclass
from typing import Optional

from app.models.schemas import Goal, SpendingSummary

# Categories where we do NOT intervene (essentials)
ESSENTIAL_CATEGORIES = {"Groceries", "Health", "Medical", "Rent", "Utilities", "Transport"}

# Categories where we suggest alternatives
DISCRETIONARY_CATEGORIES = {"Clothing", "Entertainment", "Shopping", "Subscriptions", "Food"}


@dataclass
class ScoreResult:
    severity: str  # "yellow" | "orange" | "red"
    score: int
    goal_impact_days: int
    redirect_value_6mo: float
    category_week_spend: float
    category_week_avg: float
    category_month_spend: float
    category_purchase_count_week: int
    is_discretionary: bool


def compute_severity(
    purchase_amount: float,
    category: str,
    spending_summary: SpendingSummary,
    goal: Optional[Goal],
) -> ScoreResult:
    score = 0
    is_discretionary = category in DISCRETIONARY_CATEGORIES

    # --- Context values ---
    category_week_spend = spending_summary.week.get(category, 0.0)
    category_month_spend = spending_summary.month.get(category, 0.0)
    category_week_avg = spending_summary.category_weekly_averages.get(category, 50.0)

    # Approximate weekly purchase count from mock transactions
    # We can't get exact count from summary alone, so estimate from month spend / avg transaction size
    avg_tx_size = max(purchase_amount, 20.0)
    category_purchase_count_week = max(1, round(category_week_spend / avg_tx_size))

    # --- Factor 1: Category overspend this week ---
    if category_week_avg > 0:
        category_ratio = (category_week_spend + purchase_amount) / category_week_avg
    else:
        category_ratio = 1.0

    if category_ratio > 2.5:
        score += 40
    elif category_ratio > 2.0:
        score += 30
    elif category_ratio > 1.5:
        score += 20
    elif category_ratio > 1.2:
        score += 10

    # --- Factor 2: Purchase frequency this week ---
    if category_purchase_count_week >= 4:
        score += 25
    elif category_purchase_count_week >= 3:
        score += 15
    elif category_purchase_count_week >= 2:
        score += 8

    # --- Factor 3: Goal conflict ---
    goal_impact_days = 0
    if goal:
        remaining = goal.target_amount - goal.current_amount
        if remaining > 0 and goal.days_to_goal_at_current_pace > 0:
            days_per_dollar = goal.days_to_goal_at_current_pace / remaining
            goal_impact_days = round(purchase_amount * days_per_dollar)

        if goal_impact_days > 20:
            score += 30
        elif goal_impact_days > 14:
            score += 20
        elif goal_impact_days > 7:
            score += 12

    # --- Factor 4: Purchase size relative to weekly average ---
    if spending_summary.avg_weekly_spend > 0:
        size_ratio = purchase_amount / spending_summary.avg_weekly_spend
        if size_ratio > 0.40:
            score += 10
        elif size_ratio > 0.25:
            score += 5

    # --- Map score to severity ---
    # Essential categories are capped at yellow
    if category in ESSENTIAL_CATEGORIES:
        severity = "yellow"
    elif score >= 65:
        severity = "red"
    elif score >= 35:
        severity = "orange"
    else:
        severity = "yellow"

    # --- Redirect value: simple 5% APY, 6-month approximation ---
    redirect_value_6mo = round(purchase_amount * 1.025, 2)

    return ScoreResult(
        severity=severity,
        score=min(score, 100),
        goal_impact_days=goal_impact_days,
        redirect_value_6mo=redirect_value_6mo,
        category_week_spend=category_week_spend,
        category_week_avg=category_week_avg,
        category_month_spend=category_month_spend,
        category_purchase_count_week=category_purchase_count_week,
        is_discretionary=is_discretionary,
    )
