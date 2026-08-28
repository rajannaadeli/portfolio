import type { ElementType, ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/cn";

/*
  Typographic primitives, mapped to the fluid type scale (design §3).
*/

type HeadingVariant = "mega" | "display" | "h2" | "h3";

const HEADING_CLASS: Record<HeadingVariant, string> = {
  mega: "font-mono text-mega text-text",
  display: "font-display text-display text-text",
  h2: "font-display text-h2 text-text",
  h3: "font-display text-h3 text-text",
};

const DEFAULT_TAG: Record<HeadingVariant, ElementType> = {
  mega: "div",
  display: "h1",
  h2: "h2",
  h3: "h3",
};

interface HeadingProps {
  children: ReactNode;
  variant?: HeadingVariant;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

export function Heading({ children, variant = "display", as, className, style, id }: HeadingProps) {
  const Tag = as ?? DEFAULT_TAG[variant];
  return (
    <Tag id={id} style={style} className={cn(HEADING_CLASS[variant], "text-balance", className)}>
      {children}
    </Tag>
  );
}

interface TextProps {
  children: ReactNode;
  size?: "lg" | "base";
  muted?: boolean;
  as?: ElementType;
  className?: string;
  /** Cap the measure at 62ch (design §3). */
  measure?: boolean;
}

export function Text({
  children,
  size = "base",
  muted = true,
  as: Tag = "p",
  className,
  measure = false,
}: TextProps) {
  return (
    <Tag
      className={cn(
        "font-body",
        size === "lg" ? "text-body-lg" : "text-body",
        muted ? "text-muted" : "text-text",
        className,
      )}
      style={measure ? { maxWidth: "var(--measure)" } : undefined}
    >
      {children}
    </Tag>
  );
}

interface MetaLabelProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Tint with the current accent instead of dim. */
  accent?: boolean;
}

/** Mono, uppercase, wide tracking (design §3). */
export function MetaLabel({ children, as: Tag = "span", className, accent = false }: MetaLabelProps) {
  return (
    <Tag
      className={cn(
        "font-mono text-meta uppercase",
        // --accent-text is the AA-safe accent for text: the vivid accent on the
        // dark band, a darkened variant on paper.
        accent ? "text-(--accent-text)" : "text-dim",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
