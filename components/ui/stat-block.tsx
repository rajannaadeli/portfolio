import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/*
  StatBlock — mega mono numeral + one-line muted descriptor on a --surface-1
  card (design §5.3). The count-up animation is Phase 2; the number is static
  here. When `href` is set (the "1 live product" card) it links and takes the
  accent treatment.
*/

interface StatBlockProps {
  /** The figure, e.g. "8" or "3+". Rendered in mono at --fs-mega. */
  value: ReactNode;
  /** One-line descriptor beneath. */
  label: string;
  href?: string;
  external?: boolean;
  /** Emphasis card — violet accent border + link affordance. */
  featured?: boolean;
  className?: string;
}

export function StatBlock({
  value,
  label,
  href,
  external,
  featured = false,
  className,
}: StatBlockProps) {
  const inner = (
    <>
      <div
        className={cn(
          "font-mono text-mega leading-[0.9]",
          featured ? "text-[color:var(--color-accent-violet)]" : "text-text",
        )}
      >
        {value}
      </div>
      <div className="mt-4 font-body text-body text-muted">{label}</div>
      {href ? (
        <div className="mt-3 font-mono text-meta uppercase text-[color:var(--color-accent-violet)]">
          Open it ↗
        </div>
      ) : null}
    </>
  );

  const base = cn(
    "rounded-card bg-surface-1 border p-6 sm:p-8",
    featured ? "border-[color:var(--color-accent-violet)]/40" : "border-border",
    href && "transition-colors hover:border-border-hover",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={base}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {inner}
      </Link>
    );
  }
  return <div className={base}>{inner}</div>;
}
