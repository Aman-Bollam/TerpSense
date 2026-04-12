# TerpSense

**Real-time AI financial intervention agent.**

> "We don't track your money. We change your behavior."

TerpSense intercepts purchase decisions *before* they happen. When you're about to buy something, it analyzes your spending history, savings goals, and behavioral patterns — then intervenes with personalized, number-grounded insights and better alternatives.

Built for **Bitcamp 2026** using Capital One Nessie mock data and Azure OpenAI.

---

## The Problem

Young adults don't struggle with money because they lack charts or dashboards. They struggle because of **impulse**. Most finance apps explain mistakes *after* the money is already gone. TerpSense changes behavior in real time — before the decision is finalized.

---

## Demo Flow

1. **Dashboard** — View your spending summary, savings goal, and recent transactions
2. **Check a Purchase** — Enter an amount, category, and merchant
3. **Intervention** — AI analyzes the purchase against your patterns and goal
4. **Decide** — Redirect to savings / delay / find an alternative / proceed anyway
5. **Outcome** — See your goal update in real time if you redirect

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS v4 |
| Backend | FastAPI, Python |
| AI | Azure OpenAI (GPT-4o) |
| Mock Data | Capital One Nessie API |
| State | In-memory (no database needed) |

---

## Project Structure

```
terpsense/
├── backend/          # FastAPI API server
│   ├── app/
│   │   ├── routers/  # API route handlers
│   │   ├── services/ # Nessie, OpenAI, scoring logic
│   │   ├── models/   # Pydantic schemas
│   │   └── data/     # Mock JSON data files
│   └── requirements.txt
└── frontend/         # Next.js app
    ├── app/          # Pages (landing, dashboard, purchase, intervention, outcome)
    ├── components/   # UI components
    ├── lib/          # API client, utilities
    ├── store/        # Zustand session store
    └── types/        # TypeScript interfaces
```

---

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Backend (`backend/.env`)

```
AZURE_OPENAI_KEY=your_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
AZURE_OPENAI_API_VERSION=2024-10-21
NESSIE_API_KEY=your_nessie_key
USE_MOCK_DATA=true
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Set `USE_MOCK_DATA=true` to use local JSON fixtures instead of live Nessie API. Recommended for demos.

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/transactions` | Fetch recent transactions |
| GET | `/spending-summary` | Aggregated category spending |
| GET | `/goals` | Active savings goals |
| POST | `/analyze-purchase` | Run AI intervention analysis |
| POST | `/record-decision` | Log user's decision, update goal |
| POST | `/reset-demo` | Reset session state for demo |

---

## How the AI Works

The backend computes all numbers deterministically:
- **Severity score** — based on category overspend, purchase frequency, and goal conflict
- **Goal impact days** — math: `purchase_amount × (days_remaining / remaining_to_goal)`
- **Redirect value** — simple 5% APY approximation over 6 months

Azure OpenAI only generates natural language:
- `insights` — 2 personalized sentences citing real numbers
- `alternative_suggestion` — cheaper option for discretionary categories
- `summary_line` — one-sentence summary

A hardcoded contextual fallback runs if the AI call fails, so the demo never breaks.

---

## Demo Scenario

| Field | Value |
|---|---|
| Purchase | $89.00 at ASOS |
| Category | Clothing |
| Clothing spend this week | $143 (already) |
| Savings goal | Emergency Fund — $430/$1000 |
| Result | Severity: red, delays goal 29 days |
| Best choice | Redirect → goal bar animates to $519 |

---

## Built By

**Aman Bollam** — Bitcamp 2026
