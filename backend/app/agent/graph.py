import json
from langgraph.graph import StateGraph, END
from app.agent.state import AgentState
from app.agent.tools import (
    load_transactions,
    load_spending_summary,
    load_goal,
    compute_score,
    load_behavior_memory,
    build_final_response,
)
from app.agent.memory import get_behavior_indicators
from app.services import openai_client as openai_service


def call_llm_recommendation(state: AgentState) -> AgentState:
    purchase = state["purchase"]
    score = state.get("score_result", {})

    # Create a simple object that mimics the score_result interface
    class ScoreObj:
        def __init__(self, d):
            self.severity = d.get("severity", "yellow")
            self.score = d.get("score", 50)
            self.goal_impact_days = d.get("goal_impact_days", 0)
            self.redirect_value_6mo = d.get("redirect_value_6mo", 0)

    try:
        result = openai_service.call_openai(
            purchase_amount=purchase.get("price", 0),
            category=purchase.get("category", ""),
            merchant=purchase.get("name", ""),
            score_result=ScoreObj(score),
            goal=state.get("goal"),
            spending_summary=state.get("spending_summary", {}),
            recent_transactions=state.get("transactions", [])[:8],
        )
        state["llm_result"] = result
    except Exception:
        state["llm_result"] = {
            "recommended_action": "delay",
            "confidence": 0.6,
            "insights": [
                "You have spent a significant amount in this category this week.",
                "This purchase would delay your savings goal.",
            ],
            "alternative_suggestion": "",
            "summary_line": "Consider redirecting this purchase to your savings goal.",
        }

    return state


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("load_transactions", load_transactions)
    graph.add_node("load_spending_summary", load_spending_summary)
    graph.add_node("load_goal", load_goal)
    graph.add_node("compute_score", compute_score)
    graph.add_node("load_behavior_memory", load_behavior_memory)
    graph.add_node("call_llm_recommendation", call_llm_recommendation)
    graph.add_node("build_final_response", build_final_response)

    graph.set_entry_point("load_transactions")
    graph.add_edge("load_transactions", "load_spending_summary")
    graph.add_edge("load_spending_summary", "load_goal")
    graph.add_edge("load_goal", "compute_score")
    graph.add_edge("compute_score", "load_behavior_memory")
    graph.add_edge("load_behavior_memory", "call_llm_recommendation")
    graph.add_edge("call_llm_recommendation", "build_final_response")
    graph.add_edge("build_final_response", END)

    return graph.compile()


compiled_graph = build_graph()


def run_financial_agent(user_id: str, purchase: dict) -> dict:
    initial_state: AgentState = {
        "user_id": user_id,
        "purchase": purchase,
        "transactions": [],
        "spending_summary": {},
        "goal": None,
        "score_result": None,
        "behavior_memory": [],
        "llm_result": None,
        "final_response": None,
    }
    result = compiled_graph.invoke(initial_state)
    return result.get("final_response", {})