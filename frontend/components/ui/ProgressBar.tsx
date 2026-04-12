"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number; // 0–100
  animated?: boolean;
  color?: "emerald" | "yellow" | "orange" | "red";
  className?: string;
  showLabel?: boolean;
}

const colorClasses = {
  emerald: "bg-emerald-500",
  yellow: "bg-yellow-400",
  orange: "bg-orange-400",
  red: "bg-red-500",
};

export function ProgressBar({
  value,
  animated = false,
  color = "emerald",
  className,
  showLabel = false,
}: ProgressBarProps) {
  const [displayed, setDisplayed] = useState(animated ? Math.max(0, value - 10) : value);

  useEffect(() => {
    if (!animated) {
      setDisplayed(value);
      return;
    }
    // Small delay so the animation is visible on mount
    const timer = setTimeout(() => setDisplayed(value), 150);
    return () => clearTimeout(timer);
  }, [value, animated]);

  const clamped = Math.min(100, Math.max(0, displayed));

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all ease-out",
            colorClasses[color],
            animated && "duration-1000"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-500 mt-1 inline-block">{Math.round(clamped)}%</span>
      )}
    </div>
  );
}
