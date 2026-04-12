import { formatCurrency } from "@/lib/utils";
import type { SpendingSummary } from "@/types";
import { Card } from "@/components/ui/Card";

interface SpendingSummaryProps {
  summary: SpendingSummary;
}

const CATEGORY_ICONS: Record<string, string> = {
  Clothing: "👕",
  Food: "🍔",
  Dining: "🍔",
  Entertainment: "🎬",
  Transport: "🚗",
  Subscriptions: "📱",
  Health: "💊",
  Shopping: "🛍️",
  Other: "•",
};

export function SpendingSummaryCard({ summary }: SpendingSummaryProps) {
  const categories = Object.entries(summary.week).sort(([, a], [, b]) => b - a);

  return (
    <Card title="This Week's Spending">
      <div className="space-y-3">
        {categories.map(([category, amount]) => {
          const weekAvg = summary.category_weekly_averages[category] ?? 0;
          const isOver = amount > weekAvg && weekAvg > 0;
          const barWidth =
            weekAvg > 0 ? Math.min(100, Math.round((amount / (weekAvg * 2.5)) * 100)) : 20;

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-zinc-300 flex items-center gap-2">
                  <span className="text-base">{CATEGORY_ICONS[category] ?? "•"}</span>
                  {category}
                </span>
                <div className="flex items-center gap-2">
                  {isOver && (
                    <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wide">
                      Over avg
                    </span>
                  )}
                  <span className={`text-sm font-medium ${isOver ? "text-orange-300" : "text-zinc-200"}`}>
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isOver ? "bg-orange-400" : "bg-zinc-600"}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between text-sm">
        <span className="text-zinc-500">Total this week</span>
        <span className="font-semibold text-zinc-100">{formatCurrency(summary.total_week)}</span>
      </div>
    </Card>
  );
}
