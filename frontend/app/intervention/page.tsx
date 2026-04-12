"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Decision } from "@/types";
import { InterventionCard } from "@/components/intervention/InterventionCard";
import { useSessionStore } from "@/store/sessionStore";
import { recordDecision } from "@/lib/api";

export default function InterventionPage() {
  const router = useRouter();
  const {
    interventionResult,
    pendingPurchase,
    setDecision,
    setUpdatedGoalAmount,
    activeProfileId,
    setDashboardNeedsRefresh,
  } = useSessionStore();

  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hey! I flagged this purchase. Ask me anything — like 'can I afford this?' or 'what should I do instead?'" }
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)

  useEffect(() => {
    if (!interventionResult || !pendingPurchase) {
      router.replace("/purchase");
    }
  }, [interventionResult, pendingPurchase, router]);

  if (!interventionResult || !pendingPurchase) return null;

  async function handleDecision(decision: Decision) {
    if (!pendingPurchase) return;
    setDecision(decision);
    try {
      const res = await recordDecision({
        user_id: "demo",
        purchase_amount: pendingPurchase.amount,
        category: pendingPurchase.category,
        merchant: pendingPurchase.merchant,
        decision,
        profile_id: activeProfileId,
      });
      if (res.updated_goal_amount != null) {
        setUpdatedGoalAmount(res.updated_goal_amount);
      }
      if (decision === "proceed" || decision === "redirect") {
        setDashboardNeedsRefresh(true);
      }
    } catch {}
    router.push("/outcome");
  }

  async function handleChat() {
    if (!input.trim() || thinking) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setThinking(true)

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo',
          message: userMsg,
          context: {
            purchase_amount: pendingPurchase?.amount,
            category: pendingPurchase?.category,
            merchant: pendingPurchase?.merchant,
            severity: interventionResult?.severity,
            goal_impact_days: interventionResult?.goal_impact_days,
            redirect_value_6mo: interventionResult?.redirect_value_6mo,
            summary_line: interventionResult?.summary_line,
          }
        })
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'ai', text: data.response }])
      } else throw new Error()
    } catch {
      const fallbacks: Record<string, string> = {
        'afford': `Based on your spending, this $${pendingPurchase?.amount} purchase would delay your goal by ${interventionResult?.goal_impact_days} days.`,
        'instead': `Redirect this $${pendingPurchase?.amount} to savings. In 10 years at 10% returns, that's $${Math.round((pendingPurchase?.amount ?? 0) * Math.pow(1.1, 10))}.`,
        'save': `Saving this $${pendingPurchase?.amount} now means $${interventionResult?.redirect_value_6mo?.toFixed(2)} in 6 months.`,
      }
      const key = Object.keys(fallbacks).find(k => userMsg.toLowerCase().includes(k))
      const reply = key ? fallbacks[key] : `This is a ${interventionResult?.severity} risk purchase. It delays your goal by ${interventionResult?.goal_impact_days} days. My advice: redirect it.`
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    }
    setThinking(false)
  }

  const tenYearValue = Math.round(pendingPurchase.amount * Math.pow(1.1, 10))

  return (
    <main className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative px-8 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/purchase"
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors">
            ←
          </Link>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Purchase Analysis</h1>
            <p className="text-xs text-zinc-500">Here's what TerpSense found.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left - intervention card */}
          <div>
            <InterventionCard
              result={interventionResult}
              purchaseAmount={pendingPurchase.amount}
              merchant={pendingPurchase.merchant}
              onDecision={handleDecision}
            />
          </div>

          {/* Right - context + chatbot */}
          <div className="flex flex-col gap-4">

            {/* AI summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">TerpSense says</p>
              <p className="text-sm text-zinc-300 leading-relaxed">"{interventionResult.summary_line}"</p>
            </div>

            {/* The math */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-red-500/10 border border-yellow-500/20 rounded-2xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-3">The math</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">If you proceed</span>
                  <span className="text-red-400 font-bold">-${pendingPurchase.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Redirected (6mo at 5%)</span>
                  <span className="text-green-400 font-bold">${interventionResult.redirect_value_6mo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Invested (10yr at 10%)</span>
                  <span className="text-yellow-400 font-bold">${tenYearValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-zinc-700 pt-2 mt-2">
                  <span className="text-zinc-400">Goal delayed by</span>
                  <span className="text-red-400 font-bold">{interventionResult.goal_impact_days} days</span>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="text-sm font-black text-yellow-400">3 smart decisions this week</p>
                <p className="text-xs text-zinc-500">$284 protected from impulse spending</p>
              </div>
            </div>

            {/* Chatbot */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <span className="text-sm font-bold text-zinc-200">Ask TerpSense</span>
                </div>
                <span className="text-zinc-500 text-sm">{chatOpen ? '▲' : '▼'}</span>
              </button>

              {chatOpen && (
                <div className="flex flex-col border-t border-zinc-800">
                  <div className="px-4 py-3 space-y-3 max-h-48 overflow-y-auto">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {thinking && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-800 text-zinc-500 px-3 py-2 rounded-xl text-xs">Thinking...</div>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-zinc-800">
                    {['Can I afford this?', 'What should I do instead?', 'Help me save'].map(prompt => (
                      <button key={prompt} onClick={() => setInput(prompt)}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-2 py-1 rounded-lg transition">
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 px-4 py-3 border-t border-zinc-800">
                    <input value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleChat()}
                      placeholder="Ask anything..."
                      className="flex-1 bg-zinc-800 text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none placeholder-zinc-600" />
                    <button onClick={handleChat} disabled={thinking}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs px-3 py-2 rounded-lg transition">
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}