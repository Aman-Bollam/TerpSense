import { formatCurrency, pluralize } from "@/lib/utils";
import type { Goal } from "@/types";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const percent = Math.round((goal.current_amount / goal.target_amount) * 100);
  const remaining = goal.target_amount - goal.current_amount;

  return (
    <Card title="Savings Goal">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-lg font-semibold text-zinc-100">{goal.name}</p>
          <p className="text-sm text-zinc-500 mt-0.5">
            {formatCurrency(remaining)} to go
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">{percent}%</p>
          <p className="text-xs text-zinc-500">funded</p>
        </div>
      </div>

      <ProgressBar value={percent} color="emerald" className="mb-3" />

      <div className="flex justify-between text-sm mt-3">
        <span className="text-zinc-400">
          <span className="text-zinc-100 font-medium">{formatCurrency(goal.current_amount)}</span>
          {" "}saved
        </span>
        <span className="text-zinc-400">
          goal{" "}
          <span className="text-zinc-100 font-medium">{formatCurrency(goal.target_amount)}</span>
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          At this pace,{" "}
          <span className="text-zinc-300 font-medium">
            {goal.days_to_goal_at_current_pace} {pluralize(goal.days_to_goal_at_current_pace, "day")}
          </span>{" "}
          until you hit your goal.
        </p>
      </div>
    </Card>
  );
}
