import type { Decision } from "@/types";

interface DecisionButtonsProps {
  onDecision: (decision: Decision) => void;
  hasAlternative: boolean;
}

interface DecisionOption {
  id: Decision;
  label: string;
  description: string;
  icon: string;
  style: string;
}

export function DecisionButtons({ onDecision, hasAlternative }: DecisionButtonsProps) {
  const options: DecisionOption[] = [
    {
      id: "redirect",
      label: "Redirect to Savings",
      description: "Put this money toward your goal",
      icon: "🎯",
      style:
        "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 hover:border-emerald-400 text-emerald-300",
    },
    {
      id: "delay",
      label: "Wait 7 Days",
      description: "Come back if you still want it",
      icon: "⏳",
      style:
        "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/40 hover:border-blue-400 text-blue-300",
    },
    {
      id: "alternative",
      label: "See Alternative",
      description: "Find a better deal",
      icon: "🔍",
      style: hasAlternative
        ? "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/40 hover:border-purple-400 text-purple-300"
        : "opacity-40 cursor-not-allowed bg-zinc-800 border-zinc-700 text-zinc-500",
    },
    {
      id: "proceed",
      label: "Proceed Anyway",
      description: "I've considered this",
      icon: "→",
      style:
        "bg-zinc-800/60 hover:bg-zinc-700/60 border-zinc-700 hover:border-zinc-600 text-zinc-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onDecision(opt.id)}
          disabled={opt.id === "alternative" && !hasAlternative}
          className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-all duration-150 text-left cursor-pointer disabled:cursor-not-allowed ${opt.style}`}
        >
          <span className="text-xl">{opt.icon}</span>
          <span className="font-semibold text-sm leading-tight">{opt.label}</span>
          <span className="text-xs opacity-70 leading-snug">{opt.description}</span>
        </button>
      ))}
    </div>
  );
}
