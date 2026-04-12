"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGoals, getSpendingSummary, getTransactions, resetDemo } from "@/lib/api";
import type { Goal, SpendingSummary, Transaction } from "@/types";
import { SpendingSummaryCard } from "@/components/dashboard/SpendingSummary";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { useSessionStore } from "@/store/sessionStore";

export default function DashboardPage() {
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { setActiveGoal, resetSession } = useSessionStore();

  async function loadData() {
    try {
      setLoading(true);
      const [s, g, t] = await Promise.all([
        getSpendingSummary(),
        getGoals(),
        getTransactions(),
      ]);
      setSummary(s);
      setGoals(g);
      setTransactions(t);
      if (g.length > 0) setActiveGoal(g[0]);
    } catch {
      setError("Could not connect to TerpSense backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    resetSession();
    await resetDemo();
    await loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading your financial profile...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-6 max-w-sm text-center">
          <p className="text-red-400 text-sm mb-3">⚠️ {error}</p>
          <button
            onClick={loadData}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const activeGoal = goals[0] ?? null;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">TerpSense</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Your financial intervention agent</p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
          title="Reset demo state"
        >
          Reset demo
        </button>
      </div>

      {/* Streak Counter */}
      <div className="mb-4 bg-gradient-to-r from-yellow-500/10 to-red-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🔥</div>
          <div>
            <p className="text-sm font-black text-white">3 smart decisions this week</p>
            <p className="text-xs text-zinc-500">
              You've protected{" "}
              <span className="text-yellow-400 font-bold">$284</span>{" "}
              from impulse spending
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-yellow-400">3</p>
          <p className="text-xs text-zinc-500">streak</p>
        </div>
      </div>

      {/* Goal */}
      {activeGoal && <div className="mb-4"><GoalCard goal={activeGoal} /></div>}

      {/* Spending summary */}
      {summary && <div className="mb-4"><SpendingSummaryCard summary={summary} /></div>}

      {/* Transactions */}
      <div className="mb-6">
        <TransactionList transactions={transactions} />
      </div>

      {/* Primary CTA */}
      <Link
        href="/purchase"
        className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-4 rounded-xl text-base shadow-lg shadow-emerald-500/20 transition-all duration-150"
      >
        <span className="text-lg">+</span>
        Check a Purchase
      </Link>
    </main>
  );
}