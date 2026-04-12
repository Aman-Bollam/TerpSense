import { Badge } from "@/components/ui/Badge";
import type { Severity } from "@/types";

interface SeverityBadgeProps {
  severity: Severity;
}

const config: Record<Severity, { color: "yellow" | "orange" | "red"; label: string; dot: string }> = {
  yellow: { color: "yellow", label: "Heads Up", dot: "🟡" },
  orange: { color: "orange", label: "Watch Out", dot: "🟠" },
  red: { color: "red", label: "Risky Move", dot: "🔴" },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { color, label, dot } = config[severity];
  return (
    <Badge color={color} className="text-sm px-3 py-1.5">
      <span>{dot}</span>
      {label}
    </Badge>
  );
}
