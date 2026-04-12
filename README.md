# TerpSense

**Real-time AI financial intervention agent.**

> "We don't track your money. We change your behavior."

TerpSense intercepts purchase decisions *before* they happen. When you're about to buy something, it analyzes your spending history, savings goals, and behavioral patterns, then intervenes with personalized, number-grounded insights, better alternatives, and an interactive chatbot that helps users ask follow-up questions before deciding.

Built for **Bitcamp 2026** using Capital One Nessie mock data, Azure OpenAI, and **LangGraph** for the AI agent workflow.
---

## The Problem

Young adults don't struggle with money because they lack charts or dashboards. They struggle because of **impulse**. Most finance apps explain mistakes *after* the money is already gone. TerpSense changes behavior in real time — before the decision is finalized.

---

## Demo Flow

1. **Dashboard** — View your spending summary, savings goal, and recent transactions
2. **Check a Purchase** — Enter an amount, category, and merchant
3. **Intervention** — The LangGraph-powered AI agent analyzes the purchase against your patterns and goal
4. **Ask TerpSense** — Use the chatbot on the intervention page to ask follow-up questions like "Can I afford this?", "What should I do instead?", or "Help me save"
5. **Decide** — Redirect to savings / delay / find an alternative / proceed anyway
6. **Outcome** — See your goal update in real time if you redirect

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS v4 |
| Backend | FastAPI, Python |
| AI | Azure OpenAI (GPT-4o), TerpAI LangGraph |
| Mock Data | Capital One Nessie API |
| State | In-memory session state |

---

## Project Structure

```
terpsense/
├── backend/          # FastAPI API server
│   ├── app/
│   │   ├── agent/ # LangGraph workflow, memory, chatbot logic and tool orchestration
│   │   ├── routers/  # API route handlers
│   │   ├── services/ # Nessie, OpenAI, scoring logic
│   │   ├── models/   # Pydantic schemas
│   │   └── data/     # Mock JSON data files
│   └── requirements.txt
└── frontend/         # Next.js app
    ├── app/          # Pages (landing, dashboard, purchase, intervention, outcome)
    ├── components/   # UI components, intervention cards, chatbot panel
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
| POST | `/chat-purchase` | Chat with TerpSense about the current purchase decision |

---

## How the AI Works

The backend computes all numbers deterministically:
- **Severity score** — based on category overspend, purchase frequency, and goal conflict
- **Goal impact days** — math: `purchase_amount × (days_remaining / remaining_to_goal)`
- **Redirect value** — simple 5% APY approximation over 6 months

**LangGraph** is used to power the AI agent workflow. It orchestrates the intervention process by:
- loading spending and transaction context
- pulling savings goal information
- incorporating lightweight behavior memory
- calling Azure OpenAI to generate a recommendation
- returning a structured next-best action


Azure OpenAI only generates natural language and agent recommendations:
- `insights` — 2 personalized sentences citing real numbers
- `alternative_suggestion` — cheaper option for discretionary categories
- `summary_line` — one-sentence summary

The intervention page also includes an interactive chatbot powered by the same AI workflow. After the initial analysis, users can ask follow-up questions about the purchase, such as whether they can afford it, what a better option would be, or how the decision affects their financial goals. This makes the experience more conversational and action-oriented instead of stopping at a static recommendation.

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

## Bitcamp 2026 - Built By:
**Lead Developer: Aman Bollam**
**AI & Front Devoloper Engineer: Ediale Odia**
**Presentation/UI/UX Designer: Jared Josue**
