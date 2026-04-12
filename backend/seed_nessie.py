"""
Seeds the Nessie account with realistic demo transactions.
Run once: python seed_nessie.py

This deletes existing purchases and creates fresh ones matching the demo scenario.
"""
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

KEY = os.getenv("NESSIE_API_KEY")
BASE = os.getenv("NESSIE_BASE_URL", "http://api.nessieisreal.com")
ACCOUNT_ID = "69daf1582395a9074d5a4b7b"

# Demo purchases — match the mock data scenario
# Description = merchant name (used for category inference)
PURCHASES = [
    # --- Clothing (this week — 4 purchases totaling $143) ---
    {"amount": 54.20, "description": "Zara",             "purchase_date": "2026-04-08"},
    {"amount": 38.50, "description": "H&M",              "purchase_date": "2026-04-09"},
    {"amount": 28.00, "description": "Urban Outfitters", "purchase_date": "2026-04-10"},
    {"amount": 22.30, "description": "SHEIN",            "purchase_date": "2026-04-10"},
    # --- Dining (this week) ---
    {"amount": 45.00, "description": "Whole Foods",      "purchase_date": "2026-04-07"},
    {"amount": 12.50, "description": "Chipotle",         "purchase_date": "2026-04-09"},
    # --- Transport (this week) ---
    {"amount": 8.75,  "description": "Uber",             "purchase_date": "2026-04-06"},
    # --- Subscriptions (monthly) ---
    {"amount": 14.99, "description": "Spotify",          "purchase_date": "2026-04-01"},
    {"amount": 15.99, "description": "Netflix",          "purchase_date": "2026-04-01"},
    {"amount": 9.99,  "description": "Hulu",             "purchase_date": "2026-04-01"},
    # --- Entertainment (this month) ---
    {"amount": 32.00, "description": "AMC Theatres",     "purchase_date": "2026-04-05"},
    {"amount": 46.00, "description": "Ticketmaster",     "purchase_date": "2026-04-02"},
    # --- Clothing (earlier this month) ---
    {"amount": 62.00, "description": "Nike",             "purchase_date": "2026-04-02"},
    {"amount": 33.00, "description": "Uniqlo",           "purchase_date": "2026-04-03"},
    # --- Dining (this month) ---
    {"amount": 89.00, "description": "Trader Joe's",     "purchase_date": "2026-04-01"},
    {"amount": 24.00, "description": "Sweetgreen",       "purchase_date": "2026-04-03"},
    {"amount": 18.50, "description": "Starbucks",        "purchase_date": "2026-04-04"},
    {"amount": 12.00, "description": "Lyft",             "purchase_date": "2026-04-03"},
    # --- Health ---
    {"amount": 35.00, "description": "CVS",              "purchase_date": "2026-03-29"},
    # --- Clothing (prior weeks) ---
    {"amount": 55.00, "description": "ASOS",             "purchase_date": "2026-03-28"},
    {"amount": 41.00, "description": "Gap",              "purchase_date": "2026-03-25"},
    {"amount": 110.00,"description": "Nordstrom",        "purchase_date": "2026-03-22"},
    # --- Dining (prior weeks) ---
    {"amount": 78.00, "description": "Whole Foods",      "purchase_date": "2026-03-28"},
    {"amount": 22.00, "description": "McDonald's",       "purchase_date": "2026-03-26"},
    # --- Transport (prior) ---
    {"amount": 15.00, "description": "Metro Card",       "purchase_date": "2026-03-25"},
]


def delete_existing_purchases():
    purchases = httpx.get(
        f"{BASE}/accounts/{ACCOUNT_ID}/purchases?key={KEY}", timeout=10
    ).json()

    if not isinstance(purchases, list):
        print("No existing purchases or error:", purchases)
        return

    print(f"Deleting {len(purchases)} existing purchases...")
    for p in purchases:
        r = httpx.delete(f"{BASE}/purchases/{p['_id']}?key={KEY}", timeout=10)
        status = "OK" if r.status_code in (200, 204) else f"FAILED ({r.status_code})"
        print(f"  Deleted {p['_id']} — {status}")


def create_purchases():
    print(f"\nCreating {len(PURCHASES)} purchases...")
    created = 0
    failed = 0

    for p in PURCHASES:
        payload = {
            "merchant_id": "66efc6a99683f20dd518aaf6",  # existing merchant from account
            "medium": "balance",
            "purchase_date": p["purchase_date"],
            "amount": p["amount"],
            "description": p["description"],
            "status": "completed",
        }
        r = httpx.post(
            f"{BASE}/accounts/{ACCOUNT_ID}/purchases?key={KEY}",
            json=payload,
            timeout=10,
        )
        if r.status_code in (200, 201):
            print(f"  Created: ${p['amount']:.2f} — {p['description']} ({p['purchase_date']})")
            created += 1
        else:
            print(f"  FAILED: {p['description']} — {r.status_code} {r.text[:80]}")
            failed += 1

    print(f"\nDone: {created} created, {failed} failed")


if __name__ == "__main__":
    if not KEY:
        print("ERROR: NESSIE_API_KEY not set in .env")
        exit(1)

    print(f"Seeding Nessie account {ACCOUNT_ID}...\n")
    delete_existing_purchases()
    create_purchases()
    print("\nAccount ID to use:", ACCOUNT_ID)
