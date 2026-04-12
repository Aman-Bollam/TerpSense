import { cn } from "@/lib/utils";

type BadgeColor = "yellow" | "orange" | "red" | "green" | "zinc";

interface BadgeProps {
  color: BadgeColor;
  children: React.ReactNode;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  red: "bg-red-500/10 text-red-400 border-red-500/30",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  zinc: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

export function Badge({ color, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border",
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
