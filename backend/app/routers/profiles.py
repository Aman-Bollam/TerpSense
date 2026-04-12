from fastapi import APIRouter

from app.services.profiles import PROFILES

router = APIRouter()


@router.get("/profiles")
async def list_profiles():
    return {"profiles": PROFILES}
