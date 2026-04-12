import type {
  DecisionPayload,
  DecisionResponse,
  Goal,
  InterventionResult,
  PurchasePayload,
  SpendingSummary,
  Transaction,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface GoalsResponse {
  user_id: string;
  goals: Goal[];
}

interface TransactionsResponse {
  user_id: string;
  transactions: Transaction[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function getSpendingSummary(userId = "demo"): Promise<SpendingSummary> {
  return get<SpendingSummary>(`/spending-summary?user_id=${userId}`);
}

export async function getGoals(userId = "demo"): Promise<Goal[]> {
  const res = await get<GoalsResponse>(`/goals?user_id=${userId}`);
  return res.goals;
}

export async function getTransactions(userId = "demo"): Promise<Transaction[]> {
  const res = await get<TransactionsResponse>(`/transactions?user_id=${userId}&days=30`);
  return res.transactions;
}

export async function analyzePurchase(payload: PurchasePayload): Promise<InterventionResult> {
  return post<InterventionResult>("/analyze-purchase", payload);
}

export async function recordDecision(payload: DecisionPayload): Promise<DecisionResponse> {
  return post<DecisionResponse>("/record-decision", payload);
}

export async function resetDemo(): Promise<void> {
  await post("/reset-demo", {});
}
