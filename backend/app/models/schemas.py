from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# --- Shared domain models ---

class Transaction(BaseModel):
    id: str
    amount: float
    category: str
    merchant: str
    date: str
    type: str = "purchase"


class Goal(BaseModel):
    id: str
    name: str
    target_amount: float
    current_amount: float
    monthly_contribution_needed: float
    days_to_goal_at_current_pace: int
    created_at: str


class SpendingSummary(BaseModel):
    user_id: str
    week: dict[str, float]
    month: dict[str, float]
    total_week: float
    total_month: float
    avg_weekly_spend: float
    category_weekly_averages: dict[str, float]


# --- Request models ---

class PurchaseRequest(BaseModel):
    user_id: str = "demo"
    amount: float = Field(gt=0, description="Purchase amount must be positive")
    category: str
    merchant: Optional[str] = None


class DecisionRequest(BaseModel):
    user_id: str = "demo"
    purchase_amount: float
    category: str
    decision: Literal["proceed", "delay", "redirect", "alternative"]


class UpdateGoalRequest(BaseModel):
    goal_id: str
    amount_to_add: float


# --- Response models ---

class TransactionsResponse(BaseModel):
    user_id: str
    transactions: List[Transaction]


class GoalsResponse(BaseModel):
    user_id: str
    goals: List[Goal]


class InterventionResponse(BaseModel):
    severity: Literal["yellow", "orange", "red"]
    insights: List[str]
    goal_impact_days: int
    redirect_value_6mo: float
    alternative_suggestion: Optional[str]
    summary_line: str
    score: int


class DecisionResponse(BaseModel):
    acknowledged: bool
    decision: str
    updated_goal_amount: Optional[float] = None
    confirmation_message: str


class UpdateGoalResponse(BaseModel):
    goal_id: str
    new_amount: float
    target: float
    percent_complete: float
