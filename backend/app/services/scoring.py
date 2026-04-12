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


def _clamp(value: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(max_val, value))


def compute_severity(
    purchase_amount: float,
    category: str,
    spending_summary: SpendingSummary,
    goal: Optional[Goal],
) -> ScoreResult:
    is_discretionary = category in DISCRETIONARY_CATEGORIES

    # --- Context values ---
    category_week_spend = spending_summary.week.get(category, 0.0)
    category_month_spend = spending_summary.month.get(category, 0.0)
    category_week_avg = spending_summary.category_weekly_averages.get(category, 50.0)
    avg_weekly_spend = max(spending_summary.avg_weekly_spend, 1.0)

    # Estimate purchase count this week
    avg_tx_size = max(purchase_amount, 20.0)
    category_purchase_count_week = max(1, round(category_week_spend / avg_tx_size))

    # --- Goal impact (computed first, used in scoring) ---
    goal_impact_days = 0
    if goal:
        remaining = goal.target_amount - goal.current_amount
        if remaining > 0 and goal.days_to_goal_at_current_pace > 0:
            days_per_dollar = goal.days_to_goal_at_current_pace / remaining
            goal_impact_days = round(purchase_amount * days_per_dollar)

    # -------------------------------------------------------
    # CONTINUOUS SCORING
    # Each factor produces a 0–100 contribution, then weights
    # are applied. Final score is 0–100.
    # -------------------------------------------------------

    # Factor 1: Category overspend this week (40% weight)
    # How much does adding this purchase exceed the weekly average?
    # ratio = 1.0 → no overspend → 0 contribution
    # ratio = 2.0 → 100% over avg → high contribution
    # ratio = 3.0+ → caps at max
    category_ratio = (category_week_spend + purchase_amount) / max(category_week_avg, 1.0)
    overspend_excess = max(0.0, category_ratio - 1.0)  # 0 if at or under avg
    factor_overspend = _clamp(overspend_excess / 2.0, 0.0, 1.0)  # normalized: 2x excess → 1.0

    # Factor 2: Purchase size relative to total weekly budget (20% weight)
    # A purchase equal to 50%+ of the weekly average is significant
    size_ratio = purchase_amount / avg_weekly_spend
    factor_size = _clamp(size_ratio / 0.5, 0.0, 1.0)  # 50% of weekly avg → 1.0

    # Factor 3: Goal delay (30% weight)
    # Scale by weeks of delay — each week delayed contributes linearly
    # 4+ weeks delay → maxes out
    goal_impact_weeks = goal_impact_days / 7.0
    factor_goal = _clamp(goal_impact_weeks / 4.0, 0.0, 1.0)  # 4 weeks delay → 1.0

    # Factor 4: Monthly category trend (10% weight)
    # If this category is also elevated month-over-month, compound the signal
    monthly_ratio = category_month_spend / max(category_week_avg * 4.3, 1.0)
    trend_excess = max(0.0, monthly_ratio - 1.0)
    factor_trend = _clamp(trend_excess / 1.5, 0.0, 1.0)  # 2.5x monthly avg → 1.0

    # --- Weighted composite score ---
    raw_score = (
        factor_overspend * 40
        + factor_size * 20
        + factor_goal * 30
        + factor_trend * 10
    )
    score = round(_clamp(raw_score, 0.0, 100.0))

    # --- Map score to severity ---
    # Small purchases are capped: a $5 coffee can't be "red" even if category is overspent
    if category in ESSENTIAL_CATEGORIES:
        severity = "yellow"
    elif purchase_amount < 5:
        severity = "yellow"
    elif purchase_amount < 15:
        severity = "yellow" if score < 70 else "orange"
    elif score >= 60:
        severity = "red"
    elif score >= 30:
        severity = "orange"
    else:
        severity = "yellow"

    # --- Redirect value: 5% APY, 6-month approximation ---
    redirect_value_6mo = round(purchase_amount * 1.025, 2)

    return ScoreResult(
        severity=severity,
        score=score,
        goal_impact_days=goal_impact_days,
        redirect_value_6mo=redirect_value_6mo,
        category_week_spend=category_week_spend,
        category_week_avg=category_week_avg,
        category_month_spend=category_month_spend,
        category_purchase_count_week=category_purchase_count_week,
        is_discretionary=is_discretionary,
    )
