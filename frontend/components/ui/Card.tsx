import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  padded?: boolean;
}

export function Card({ title, padded = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-zinc-900 border border-zinc-800 rounded-2xl",
        padded && "p-5",
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
