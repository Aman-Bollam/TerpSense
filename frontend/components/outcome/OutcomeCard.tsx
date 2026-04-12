"use client";

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

export function OutcomeCard({
  decision,
  result,
  purchaseAmount,
  activeGoal,
  updatedGoalAmount,
  confirmationMessage,
}: OutcomeCardProps) {
  const goalTarget = activeGoal?.target_amount ?? 1000;
  const newAmount = updatedGoalAmount ?? (activeGoal?.current_amount ?? 0);
  const newPercent = Math.round((newAmount / goalTarget) * 100);
  const oldPercent = activeGoal ? Math.round((activeGoal.current_amount / goalTarget) * 100) : 0;

  if (decision === "redirect") {
    return (
      <div className="space-y-5">
        <div className="text-center pt-2">
          <div className="text-5xl mb-3">🎯</div>
          <h2 className="text-2xl font-bold text-emerald-400">Smart move.</h2>
          <p className="text-zinc-400 mt-1 text-sm">{confirmationMessage}</p>
        </div>

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
      </div>
    );
  }

  if (decision === "delay") {
    return (
      <div className="text-center space-y-4 pt-2">
        <div className="text-5xl">⏳</div>
        <h2 className="text-2xl font-bold text-blue-400">See you in 7 days.</h2>
        <p className="text-zinc-400 text-sm">{confirmationMessage}</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">
            Pending
          </p>
          <p className="text-sm text-zinc-300">
            {formatCurrency(purchaseAmount)} purchase — check back in 7 days.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            If you still want it then, it was probably worth it.
          </p>
        </div>
      </div>
    );
  }

  if (decision === "alternative") {
    return (
      <div className="text-center space-y-4 pt-2">
        <div className="text-5xl">🔍</div>
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
      </div>
    );
  }

  // proceed
  return (
    <div className="text-center space-y-4 pt-2">
      <div className="text-5xl">👍</div>
      <h2 className="text-2xl font-bold text-zinc-300">Noted.</h2>
      <p className="text-zinc-400 text-sm">{confirmationMessage}</p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">
          Keep in mind
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          TerpSense isn't here to stop you — just to make sure you know the full picture before you decide.
        </p>
      </div>
    </div>
  );
}
