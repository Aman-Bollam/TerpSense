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

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const steps = 40
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(current))
    }, 1000 / steps)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display.toLocaleString()}</span>
}

function TerpSenseLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="#DC2626" />
        <path d="M16 4L8 15h7l-3 9 11-13h-7l3-7z" fill="#FBBF24" strokeLinejoin="round" />
      </svg>
      <span className="text-lg font-black tracking-tight">
        <span className="text-white">Terp</span>
        <span className="text-red-500">Sense</span>
      </span>
    </div>
  )
}

const MOTIVATIONAL_MESSAGES = [
  "Your future self will thank you. 💪",
  "Every smart decision compounds.",
  "Top 20% of savers your age.",
  "Most people give in. You didn't.",
]

export default function DashboardPage() {
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");
  const [message] = useState(() => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)])

  const {
    setActiveGoal,
    resetSession,
    activeProfileId,
    setActiveProfileId,
    dashboardNeedsRefresh,
    setDashboardNeedsRefresh,
  } = useSessionStore();

  async function loadData(profileId = activeProfileId) {
    try {
      setLoading(true);
      const [s, g, t, p] = await Promise.all([
        getSpendingSummary("demo", profileId),
        getGoals(),
        getTransactions("demo", profileId),
        getProfiles(),
      ]);
      setSummary(s); setGoals(g); setTransactions(t); setProfiles(p);
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
      const others = profiles.filter((p) => p.id !== activeProfileId);
      const next = others[Math.floor(Math.random() * others.length)];
      setActiveProfileId(next.id);
      await loadData(next.id);
    } finally {
      setSwitching(false);
    }
  }

  useEffect(() => {
    if (dashboardNeedsRefresh) {
      setDashboardNeedsRefresh(false);
    }
    loadData(activeProfileId);
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
          <button onClick={() => loadData(activeProfileId)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">Retry</button>
        </div>
      </main>
    );
  }

  const activeGoal = goals[0] ?? null;

  const biggestRisk = summary ? Object.entries(summary.week)
    .filter(([cat]) => {
      const avg = summary.category_weekly_averages[cat] ?? 0
      return summary.week[cat] > avg && avg > 0
    })
    .sort(([, a], [, b]) => b - a)[0] : null

  const biggestRiskCategory = biggestRisk?.[0]
  const biggestRiskAmount = biggestRisk?.[1] ?? 0
  const biggestRiskAvg = biggestRiskCategory ? (summary?.category_weekly_averages[biggestRiskCategory] ?? 0) : 0
  const overByPercent = biggestRiskAvg > 0 ? Math.round(((biggestRiskAmount - biggestRiskAvg) / biggestRiskAvg) * 100) : 0
  const totalProtected = 284
  const futureValue = Math.round(totalProtected * Math.pow(1.1, 10))

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 max-w-lg mx-auto">

      {/* Header with Logo */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <TerpSenseLogo />
          <p className="text-xs text-zinc-500 mt-1 pl-1">Your financial intervention agent</p>
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
          <button onClick={handleReset} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">
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

      {/* Top stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-yellow-400">🔥 3</p>
          <p className="text-xs text-zinc-500 mt-1">streak</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center">
          <p className="text-lg font-black text-emerald-400">${<AnimatedNumber value={totalProtected} />}</p>
          <p className="text-xs text-zinc-500 mt-1">protected</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-3 text-center">
          <p className="text-lg font-black text-blue-400">${<AnimatedNumber value={futureValue} />}</p>
          <p className="text-xs text-zinc-500 mt-1">in 10yrs</p>
        </div>
      </div>

      {/* Motivational + risk in one row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <p className="text-xs text-zinc-400 italic leading-relaxed">"{message}"</p>
        </div>
        {biggestRiskCategory ? (
          <div className="bg-orange-500/5 border border-orange-500/30 rounded-2xl p-3">
            <p className="text-xs font-bold text-orange-400">⚠️ {biggestRiskCategory}</p>
            <p className="text-xs text-zinc-500 mt-1">{overByPercent}% over avg this week</p>
          </div>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3">
            <p className="text-xs font-bold text-emerald-400">✅ On track</p>
            <p className="text-xs text-zinc-500 mt-1">All categories in budget</p>
          </div>
        )}
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
