import { formatCurrency, pluralize } from "@/lib/utils";
import type { Decision, InterventionResult } from "@/types";
import { SeverityBadge } from "./SeverityBadge";
import { InsightList } from "./InsightList";
import { DecisionButtons } from "./DecisionButtons";

const severityBorderColors = {
  yellow: "border-yellow-500/30",
  orange: "border-orange-500/40",
  red: "border-red-500/40",
};

const severityGlowColors = {
  yellow: "shadow-yellow-500/5",
  orange: "shadow-orange-500/10",
  red: "shadow-red-500/10",
};

interface InterventionCardProps {
  result: InterventionResult;
  purchaseAmount: number;
  merchant?: string;
  onDecision: (decision: Decision) => void;
}

export function InterventionCard({
  result,
  purchaseAmount,
  merchant,
  onDecision,
}: InterventionCardProps) {
  const { severity, insights, goal_impact_days, redirect_value_6mo, alternative_suggestion, summary_line } = result;

  return (
    <div
      className={`bg-zinc-900 border-2 ${severityBorderColors[severity]} ${severityGlowColors[severity]} rounded-2xl shadow-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-zinc-800">
        <div className="flex items-start justify-between mb-3">
          <SeverityBadge severity={severity} />
          <span className="text-2xl font-bold text-zinc-100">{formatCurrency(purchaseAmount)}</span>
        </div>
        {merchant && (
          <p className="text-sm text-zinc-500">
            Pending purchase at <span className="text-zinc-300 font-medium">{merchant}</span>
          </p>
        )}
        <p className="text-base font-medium text-zinc-300 mt-2 leading-snug">{summary_line}</p>
      </div>

      {/* Insights */}
      <div className="px-6 py-5 border-b border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
          What the numbers say
        </p>
        <InsightList insights={insights} />
      </div>

      {/* Impact metrics */}
      <div className="px-6 py-5 border-b border-zinc-800 grid grid-cols-2 gap-4">
        <div className="bg-zinc-800/60 rounded-xl p-3.5">
          <p className="text-xs text-zinc-500 mb-1">Goal delayed by</p>
          <p className="text-xl font-bold text-red-400">
            {goal_impact_days}{" "}
            <span className="text-sm font-medium">{pluralize(goal_impact_days, "day")}</span>
          </p>
        </div>
        <div className="bg-zinc-800/60 rounded-xl p-3.5">
          <p className="text-xs text-zinc-500 mb-1">Redirected value (6mo)</p>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(redirect_value_6mo)}</p>
        </div>
      </div>

      {/* Alternative suggestion */}
      {alternative_suggestion && (
        <div className="px-6 py-4 border-b border-zinc-800 bg-purple-500/5">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-1">
                Better option
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{alternative_suggestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Decision buttons */}
      <div className="px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
          What do you want to do?
        </p>
        <DecisionButtons
          onDecision={onDecision}
          hasAlternative={!!alternative_suggestion}
        />
      </div>
    </div>
  );
}
