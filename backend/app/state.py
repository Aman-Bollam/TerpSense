# In-memory session state — no database needed for hackathon MVP.
# goal_state maps goal_id -> current_amount override for this session.
goal_state: dict[str, float] = {}


def reset_demo_state() -> None:
    """Resets all session state to initial demo values."""
    goal_state.clear()
