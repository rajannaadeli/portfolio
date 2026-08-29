import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
  Chip — small pill for proof points, tech-stack tokens, and meta. The `accent`
  variant tints with the current --accent (per-case).
*/

interface ChipProps {
  children: ReactNode;
  variant?: "default" | "accent" | "outline";
  className?: string;
}

const VARIANT = {
  default: "bg-surface-2 text-muted border border-border",
  accent:
    "border text-(--accent) border-[color:var(--accent)]/35 bg-(--accent)/8",
  outline: "border border-border text-dim",
} as const;

export function Chip({ children, variant = "default", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1 font-mono text-meta uppercase",
        VARIANT[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
