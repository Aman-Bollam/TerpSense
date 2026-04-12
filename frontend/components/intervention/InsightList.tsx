interface InsightListProps {
  insights: string[];
}

export function InsightList({ insights }: InsightListProps) {
  return (
    <ul className="space-y-3">
      {insights.map((insight, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="mt-0.5 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-xs text-zinc-400 font-medium">
            {i + 1}
          </span>
          <p className="text-zinc-200 text-sm leading-relaxed">{insight}</p>
        </li>
      ))}
    </ul>
  );
}
