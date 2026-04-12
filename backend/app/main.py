from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analyze, chat, goals, profiles, transactions

app = FastAPI(title="TerpSense API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, tags=["transactions"])
app.include_router(goals.router, tags=["goals"])
app.include_router(analyze.router, tags=["analyze"])
app.include_router(profiles.router, tags=["profiles"])
app.include_router(chat.router, tags=["chat"])


@app.get("/health")
async def health():
    return {"status": "ok"}
