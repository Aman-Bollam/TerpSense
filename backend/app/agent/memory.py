import json
import os
from datetime import datetime

MEMORY_FILE = "app/agent/behavior_memory.json"


def _load_all() -> dict:
    if not os.path.exists(MEMORY_FILE):
        return {}
    with open(MEMORY_FILE, "r") as f:
        return json.load(f)


def _save_all(data: dict):
    with open(MEMORY_FILE, "w") as f:
        json.dump(data, f, indent=2)


def get_user_memory(user_id: str) -> list:
    return _load_all().get(user_id, [])


def save_decision(user_id: str, purchase: dict, recommended_action: str, actual_decision: str):
    all_data = _load_all()
    if user_id not in all_data:
        all_data[user_id] = []
    all_data[user_id].append({
        "purchase_amount": purchase.get("price"),
        "category": purchase.get("category"),
        "recommended_action": recommended_action,
        "actual_decision": actual_decision,
        "timestamp": datetime.utcnow().isoformat(),
    })
    all_data[user_id] = all_data[user_id][-20:]
    _save_all(all_data)


def get_behavior_indicators(user_id: str) -> dict:
    memory = get_user_memory(user_id)
    if not memory:
        return {}
    total = len(memory)
    ignores_redirect = sum(
        1 for m in memory
        if m.get("recommended_action") == "redirect" and m.get("actual_decision") == "proceed"
    )
    accepts_delay = sum(1 for m in memory if m.get("actual_decision") == "delay")
    prefers_alternatives = sum(1 for m in memory if m.get("actual_decision") == "alternative")
    return {
        "often_ignores_redirect": ignores_redirect / total > 0.4,
        "accepts_delay_often": accepts_delay / total > 0.3,
        "prefers_alternatives": prefers_alternatives / total > 0.3,
        "total_decisions": total,
    }