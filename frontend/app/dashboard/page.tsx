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
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#DC2626" />
        <ellipse cx="16" cy="16" rx="8" ry="6" fill="#FBBF24" />
        <ellipse cx="16" cy="16" rx="5" ry="4" fill="#D97706" />
        <line x1="16" y1="12" x2="16" y2="20" stroke="#FBBF24" strokeWidth="0.8" />
        <line x1="11" y1="16" x2="21" y2="16" stroke="#FBBF24" strokeWidth="0.8" />
        <line x1="12" y1="13" x2="20" y2="19" stroke="#FBBF24" strokeWidth="0.8" />
        <line x1="20" y1="13" x2="12" y2="19" stroke="#FBBF24" strokeWidth="0.8" />
        <ellipse cx="24" cy="14" rx="2.5" ry="2" fill="#FBBF24" />
        <ellipse cx="8.5" cy="17" rx="1.5" ry="1" fill="#FBBF24" />
        <ellipse cx="13" cy="22" rx="1.5" ry="1" fill="#FBBF24" />
        <ellipse cx="19" cy="22" rx="1.5" ry="1" fill="#FBBF24" />
        <ellipse cx="13" cy="10" rx="1.5" ry="1" fill="#FBBF24" />
        <ellipse cx="19" cy="10" rx="1.5" ry="1" fill="#FBBF24" />
      </svg>
      <span className="text-lg font-black tracking-tight">
        <span className="text-white">Terp</span>
        <span className="text-red-500">Sense</span>
      </span>
    </div>
  )
}

function SpendingGauge({ spent, budget }: { spent: number, budget: number }) {
  const [animated, setAnimated] = useState(0)
  const percent = Math.min(100, Math.round((spent / budget) * 100))
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animated / 100) * circumference
  const color = percent > 80 ? '#ef4444' : percent > 60 ? '#f97316' : '#22c55e'

  useEffect(() => {
    setTimeout(() => setAnimated(percent), 300)
  }, [percent])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 h-full">
      <div className="relative flex-shrink-0">
        <svg width="90" height="90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#27272a" strokeWidth="10" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.3s' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black text-white">{percent}%</span>
          <span className="text-xs text-zinc-500">used</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Biweekly Budget</p>
        <p className="text-sm font-bold text-white">${spent.toFixed(2)} <span className="text-zinc-500 font-normal">of ${budget}</span></p>
        <p className="text-xs text-zinc-500 mt-1">7 days until next paycheck</p>
        <div className="mt-2">
          {percent > 80 ? <span className="text-xs text-red-400 font-bold">🚨 Almost out</span>
            : percent > 60 ? <span className="text-xs text-orange-400 font-bold">⚠️ Slow down</span>
            : <span className="text-xs text-green-400 font-bold">✅ On track</span>}
        </div>
      </div>
    </div>
  )
}

function XPBadge({ xp = 75 }: { xp?: number }) {
  const level = Math.floor(xp / 100) + 1
  const progress = xp % 100
  const [filled, setFilled] = useState(0)
  useEffect(() => { setTimeout(() => setFilled(progress), 400) }, [progress])

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Financial IQ</span>
        <span className="text-xs font-black text-yellow-400">Lvl {level}</span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${filled}%` }} />
      </div>
      <p className="text-xs text-zinc-600 mt-1">{progress}/100 XP to Level {level + 1}</p>
    </div>
  )
}

const CATEGORY_ICONS: Record<string, string> = {
  Clothing: "👕", Food: "🍔", Dining: "🍔", Entertainment: "🎬",
  Transport: "🚗", Subscriptions: "📱", Health: "💊", Shopping: "🛍️",
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
    setActiveGoal, resetSession, activeProfileId, setActiveProfileId,
    dashboardNeedsRefresh, setDashboardNeedsRefresh,
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
    if (dashboardNeedsRefresh) setDashboardNeedsRefresh(false);
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
    .filter(([cat]) => { const avg = summary.category_weekly_averages[cat] ?? 0; return summary.week[cat] > avg && avg > 0 })
    .sort(([, a], [, b]) => b - a)[0] : null
  const biggestRiskCategory = biggestRisk?.[0]
  const biggestRiskAvg = biggestRiskCategory ? (summary?.category_weekly_averages[biggestRiskCategory] ?? 0) : 0
  const overByPercent = biggestRiskAvg > 0 ? Math.round((((biggestRisk?.[1] ?? 0) - biggestRiskAvg) / biggestRiskAvg) * 100) : 0
  const totalProtected = 284
  const futureValue = Math.round(totalProtected * Math.pow(1.1, 10))
  const totalSpent = summary ? Object.values(summary.week).reduce((a, b) => a + b, 0) : 209
  const biweeklyBudget = 800

  return (
    <main className="min-h-screen bg-zinc-950 px-8 py-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <TerpSenseLogo />
          <p className="text-xs text-zinc-500 mt-1 pl-1">Your financial intervention agent</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSwitchProfile} disabled={switching || profiles.length < 2}
            className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed">
            {switching ? <span className="w-3 h-3 border border-zinc-600 border-t-zinc-300 rounded-full animate-spin" /> : <span>⇄</span>}
            Switch profile
          </button>
          <button onClick={handleReset} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">Reset demo</button>
        </div>
      </div>

      {/* Profile pill */}
      {activeProfile && (
        <div className="flex items-center gap-2 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 w-fit">
          <span className="text-base">{activeProfile.avatar}</span>
          <div>
            <p className="text-xs font-semibold text-zinc-200">{activeProfile.name}</p>
            <p className="text-xs text-zinc-500">{activeProfile.description}</p>
          </div>
        </div>
      )}

      {/* Top row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <SpendingGauge spent={totalSpent} budget={biweeklyBudget} />
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-3 text-center">
              <p className="text-xl font-black text-yellow-400">🔥 3</p>
              <p className="text-xs text-zinc-500 mt-1">streak</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center">
              <p className="text-sm font-black text-emerald-400">${<AnimatedNumber value={totalProtected} />}</p>
              <p className="text-xs text-zinc-500 mt-1">saved</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-3 text-center">
              <p className="text-sm font-black text-blue-400">${<AnimatedNumber value={futureValue} />}</p>
              <p className="text-xs text-zinc-500 mt-1">in 10yrs</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-3 text-center">
              <p className="text-xl font-black text-yellow-400">Lv1</p>
              <p className="text-xs text-zinc-500 mt-1">IQ</p>
            </div>
          </div>
          <XPBadge xp={75} />
        </div>
      </div>

      {/* Motivational banner */}
      <div className="mb-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 flex items-center justify-between">
        <p className="text-xs text-zinc-400 italic">"{message}"</p>
        {biggestRiskCategory ? (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5">
            <span className="text-xs font-bold text-orange-400">⚠️ {biggestRiskCategory}</span>
            <span className="text-xs text-zinc-500">{overByPercent}% over avg</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
            <span className="text-xs font-bold text-emerald-400">✅ On track this week</span>
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col gap-4 flex-1">
          {activeGoal && <GoalCard goal={activeGoal} />}
          {summary && <SpendingSummaryCard summary={summary} />}
        </div>
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-zinc-800 flex-shrink-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Recent Transactions</p>
          </div>
          <div className="overflow-y-auto px-2 py-2 flex-1">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 border-b border-zinc-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center">{CATEGORY_ICONS[tx.category] ?? '•'}</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{tx.merchant}</p>
                    <p className="text-xs text-zinc-500">{tx.category} · {tx.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${tx.category === 'Clothing' ? 'text-orange-400' : 'text-zinc-300'}`}>
                  -{tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link href="/purchase"
        className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-4 rounded-xl text-base shadow-lg shadow-emerald-500/20 transition-all duration-150">
        <span className="text-lg">+</span>
        Check a Purchase
      </Link>
    </main>
  );
}