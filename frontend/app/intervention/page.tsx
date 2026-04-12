"use client";

import { useEffect, useState, useRef } from "react";
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
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, typing?: boolean }[]>([
    { role: 'ai', text: "Hey! I flagged this purchase. Ask me anything — like 'can I afford this?' or 'what should I do instead?'" }
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!interventionResult || !pendingPurchase) {
      router.replace("/purchase");
    }
  }, [interventionResult, pendingPurchase, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

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

  function typewriterEffect(fullText: string) {
    setMessages(prev => [...prev, { role: 'ai', text: '', typing: true }])
    let i = 0
    const interval = setInterval(() => {
      i++
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'ai', text: fullText.slice(0, i), typing: i < fullText.length }
        return updated
      })
      if (i >= fullText.length) clearInterval(interval)
    }, 8)
  }

  async function handleChat(overrideMsg?: string) {
    const userMsg = (overrideMsg ?? input).trim()
    if (!userMsg || thinking) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setThinking(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/api/chat`, {
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
        setThinking(false)
        typewriterEffect(data.response)
      } else throw new Error()
    } catch {
      const fallbacks: Record<string, string> = {
        'afford': `Based on your spending, this $${pendingPurchase?.amount} purchase would delay your goal by ${interventionResult?.goal_impact_days} days.`,
        'instead': `Redirect this $${pendingPurchase?.amount} to savings. In 10 years at 10% returns, that's $${Math.round((pendingPurchase?.amount ?? 0) * Math.pow(1.1, 10))}.`,
        'save': `Saving this $${pendingPurchase?.amount} now means $${interventionResult?.redirect_value_6mo?.toFixed(2)} in 6 months.`,
        'worth': `At ${interventionResult?.severity} risk, this delays your goal by ${interventionResult?.goal_impact_days} days. Only you can decide if that tradeoff is worth it.`,
      }
      const key = Object.keys(fallbacks).find(k => userMsg.toLowerCase().includes(k))
      const reply = key ? fallbacks[key] : `This is a ${interventionResult?.severity} risk purchase. It delays your goal by ${interventionResult?.goal_impact_days} days. My advice: redirect it.`
      setThinking(false)
      typewriterEffect(reply)
    }
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
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs font-bold text-white">T</div>
                  <span className="text-sm font-bold text-zinc-200">Ask TerpSense</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">AI</span>
                </div>
                <span className="text-zinc-500 text-sm transition-transform duration-200" style={{ display: 'inline-block', transform: chatOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </button>

              <div style={{
                maxHeight: chatOpen ? '500px' : '0px',
                opacity: chatOpen ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease, opacity 0.2s ease',
              }}>
                <div className="flex flex-col border-t border-zinc-800">

                  {/* Messages */}
                  <div className="px-4 py-3 space-y-3 max-h-48 overflow-y-auto">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'ai' && (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mb-0.5">T</div>
                        )}
                        <div className={`max-w-xs px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-br-sm'
                            : 'bg-gradient-to-br from-zinc-800 to-zinc-700 text-zinc-200 rounded-bl-sm border border-zinc-700/50'
                        }`}>
                          {m.text}
                          {m.typing && (
                            <span className="inline-block w-1 h-3 bg-emerald-400 ml-0.5 animate-pulse rounded-sm" />
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Bouncing dots */}
                    {thinking && (
                      <div className="flex items-end gap-2 justify-start">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">T</div>
                        <div className="bg-gradient-to-br from-zinc-800 to-zinc-700 border border-zinc-700/50 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick prompts — always show */}
                  <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-zinc-800">
                    {['Can I afford this?', 'What should I do instead?', 'Help me save', 'Is this worth it?'].map(prompt => (
                      <button key={prompt}
                        onClick={() => handleChat(prompt)}
                        disabled={thinking}
                        className="text-xs bg-zinc-800 hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/30 border border-zinc-700 text-zinc-400 px-2 py-1 rounded-lg transition-all duration-150 disabled:opacity-40">
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2 px-4 py-3 border-t border-zinc-800">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleChat()}
                      placeholder="Ask anything..."
                      className="flex-1 bg-zinc-800 text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none placeholder-zinc-600 border border-zinc-700 focus:border-emerald-500/50 transition-colors"
                    />
                    <button
                      onClick={() => handleChat()}
                      disabled={thinking || !input.trim()}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs px-3 py-2 rounded-lg transition-all duration-150 font-medium">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}