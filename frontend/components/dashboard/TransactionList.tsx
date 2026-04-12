import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";
import { Card } from "@/components/ui/Card";

interface TransactionListProps {
  transactions: Transaction[];
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

export function TransactionList({ transactions }: TransactionListProps) {
  const recent = transactions.slice(0, 7);

  return (
    <Card title="Recent Transactions">
      <div className="space-y-1">
        {recent.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between py-2.5 border-b border-zinc-800/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg w-7 text-center">
                {CATEGORY_ICONS[tx.category] ?? "•"}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-200">{tx.merchant}</p>
                <p className="text-xs text-zinc-500">{tx.category} · {formatDate(tx.date)}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-zinc-300">
              -{formatCurrency(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
