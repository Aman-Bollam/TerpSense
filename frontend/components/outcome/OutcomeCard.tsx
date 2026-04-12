"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { Decision, Goal, InterventionResult } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface OutcomeCardProps {
  decision: Decision;
  result: InterventionResult;
  purchaseAmount: number;
  activeGoal: Goal | null;
  updatedGoalAmount: number | null;
  confirmationMessage: string;
}

function Confetti() {
  const colors = ['#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#f97316']
  const pieces = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(${Math.random() * 720}deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function XPBar({ xp }: { xp: number }) {
  const [filled, setFilled] = useState(0)
  const level = Math.floor(xp / 100) + 1
  const progress = xp % 100

  useEffect(() => {
    setTimeout(() => setFilled(progress), 300)
  }, [progress])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Financial IQ</span>
        <span className="text-xs text-yellow-400 font-bold">Level {level}</span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${filled}%` }}
        />
      </div>
      <p className="text-xs text-zinc-600 mt-1">{progress}/100 XP to Level {level + 1}</p>
    </div>
  )
}

function BeforeAfterSplit({ purchaseAmount, savedAmount, goalName }: { purchaseAmount: number, savedAmount: number, goalName: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
        <p className="text-xs text-red-400 uppercase tracking-widest font-bold mb-2">If you bought it</p>
        <p className="text-2xl font-black text-red-400">-{formatCurrency(purchaseAmount)}</p>
        <p className="text-xs text-zinc-500 mt-1">Gone forever</p>
        <p className="text-xs text-red-400/60 mt-2">❌ Goal delayed</p>
      </div>
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
        <p className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-2">What you did</p>
        <p className="text-2xl font-black text-emerald-400">+{formatCurrency(savedAmount)}</p>
        <p className="text-xs text-zinc-500 mt-1">Working for you</p>
        <p className="text-xs text-emerald-400/60 mt-2">✅ {goalName} closer</p>
      </div>
    </div>
  )
}

export function OutcomeCard({
  decision,
  result,
  purchaseAmount,
  activeGoal,
  updatedGoalAmount,
  confirmationMessage,
}: OutcomeCardProps) {
  const goalTarget = activeGoal?.target_amount ?? 1000
  const newAmount = updatedGoalAmount ?? (activeGoal?.current_amount ?? 0)
  const newPercent = Math.round((newAmount / goalTarget) * 100)
  const oldPercent = activeGoal ? Math.round((activeGoal.current_amount / goalTarget) * 100) : 0
  const [showConfetti, setShowConfetti] = useState(false)
  const [xp, setXp] = useState(0)
  const audioRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (decision === 'redirect' || decision === 'alternative') {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      setXp(75)
      playWinSound()
    } else if (decision === 'delay') {
      setXp(40)
    } else {
      setXp(10)
    }
  }, [decision])

  function playWinSound() {
    try {
      const ctx = new AudioContext()
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3)
        osc.start(ctx.currentTime + i * 0.1)
        osc.stop(ctx.currentTime + i * 0.1 + 0.3)
      })
    } catch (e) {
      // Audio not available
    }
  }

  if (decision === "redirect") {
    return (
      <div className="space-y-5">
        {showConfetti && <Confetti />}

        <div className="text-center pt-2">
          <div className="text-5xl mb-3 animate-bounce">🎯</div>
          <h2 className="text-2xl font-bold text-emerald-400">Smart move.</h2>
          <p className="text-zinc-400 mt-1 text-sm">{confirmationMessage}</p>
        </div>

        <BeforeAfterSplit
          purchaseAmount={purchaseAmount}
          savedAmount={purchaseAmount}
          goalName={activeGoal?.name ?? 'your goal'}
        />

        {activeGoal && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium text-zinc-300">{activeGoal.name}</p>
              <p className="text-xs text-zinc-500">
                {formatCurrency(activeGoal.current_amount)} → {formatCurrency(newAmount)}
              </p>
            </div>
            <ProgressBar value={newPercent} animated color="emerald" />
            <div className="flex justify-between mt-2 text-xs text-zinc-500">
              <span>Was {oldPercent}%</span>
              <span className="text-emerald-400 font-semibold">Now {newPercent}%</span>
            </div>
          </div>
        )}

        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-sm text-zinc-400">
            In 6 months at 5% APY, this{" "}
            <span className="text-emerald-400 font-medium">{formatCurrency(purchaseAmount)}</span>{" "}
            becomes{" "}
            <span className="text-emerald-400 font-medium">
              {formatCurrency(result.redirect_value_6mo)}
            </span>
          </p>
        </div>

        <XPBar xp={xp} />
      </div>
    )
  }

  if (decision === "delay") {
    return (
      <div className="text-center space-y-4 pt-2">
        <div className="text-5xl">⏳</div>
        <h2 className="text-2xl font-bold text-blue-400">See you in 7 days.</h2>
        <p className="text-zinc-400 text-sm">{confirmationMessage}</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Pending</p>
          <p className="text-sm text-zinc-300">
            {formatCurrency(purchaseAmount)} purchase — check back in 7 days.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            If you still want it then, it was probably worth it.
          </p>
        </div>
        <XPBar xp={xp} />
      </div>
    )
  }

  if (decision === "alternative") {
    return (
      <div className="text-center space-y-4 pt-2">
        {showConfetti && <Confetti />}
        <div className="text-5xl animate-bounce">🔍</div>
        <h2 className="text-2xl font-bold text-purple-400">Good thinking.</h2>
        <p className="text-zinc-400 text-sm">{confirmationMessage}</p>
        {result.alternative_suggestion && (
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-left">
            <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold mb-2">
              Suggested alternative
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.alternative_suggestion}</p>
          </div>
        )}
        <XPBar xp={xp} />
      </div>
    )
  }

  return (
    <div className="text-center space-y-4 pt-2">
      <div className="text-5xl">👍</div>
      <h2 className="text-2xl font-bold text-zinc-300">Noted.</h2>
      <p className="text-zinc-400 text-sm">{confirmationMessage}</p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Keep in mind</p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          TerpSense isn't here to stop you — just to make sure you know the full picture before you decide.
        </p>
      </div>
      <XPBar xp={xp} />
    </div>
  )
}