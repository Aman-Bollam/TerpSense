"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getGoals,
  getProfiles,
  getSpendingSummary,
  getTransactions,
  resetDemo,
} from "@/lib/api";
import type { Goal, Profile, SpendingSummary, Transaction } from "@/types";
import { SpendingSummaryCard } from "@/components/dashboard/SpendingSummary";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { useSessionStore } from "@/store/sessionStore";

export default function DashboardPage() {
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");

  const { setActiveGoal, resetSession, activeProfileId, setActiveProfileId } =
    useSessionStore();

  async function loadData(profileId = activeProfileId) {
    try {
      setLoading(true);
      const [s, g, t, p] = await Promise.all([
        getSpendingSummary("demo", profileId),
        getGoals(),
        getTransactions("demo", profileId),
        getProfiles(),
      ]);
      setSummary(s);
      setGoals(g);
      setTransactions(t);
      setProfiles(p);
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
    await loadData(activeProfileId);
  }

  async function handleSwitchProfile() {
    if (profiles.length < 2) return;
    setSwitching(true);
    try {
      // Pick a random profile that's not the current one
      const others = profiles.filter((p) => p.id !== activeProfileId);
      const next = others[Math.floor(Math.random() * others.length)];
      setActiveProfileId(next.id);
      await loadData(next.id);
    } finally {
      setSwitching(false);
    }
  }

  useEffect(() => {
    loadData(activeProfileId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

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
            onClick={() => loadData(activeProfileId)}
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleSwitchProfile}
            disabled={switching || profiles.length < 2}
            className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Switch to a different spending persona"
          >
            {switching ? (
              <span className="w-3 h-3 border border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
            ) : (
              <span>⇄</span>
            )}
            Switch profile
          </button>
          <button
            onClick={handleReset}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            title="Reset demo state"
          >
            Reset demo
          </button>
        </div>
      </div>

      {/* Active profile pill */}
      {activeProfile && (
        <div className="flex items-center gap-2 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
          <span className="text-base">{activeProfile.avatar}</span>
          <div>
            <p className="text-xs font-semibold text-zinc-200">{activeProfile.name}</p>
            <p className="text-xs text-zinc-500">{activeProfile.description}</p>
          </div>
        </div>
      )}

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
