import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
  Layout primitives — rhythm, width, and grid. Plain and unanimated (Phase 1).
*/

interface SectionProps {
  children: ReactNode;
  /** Removes the max-width container so children can bleed full-width. */
  fullBleed?: boolean;
  /** Extra vertical breathing room — the featured case's single exception. */
  air?: boolean;
  className?: string;
  as?: ElementType;
  id?: string;
  /** Inline style passthrough (used to set per-case --accent). */
  style?: React.CSSProperties;
}

/** Vertical section rhythm (design §4: clamp(96px,14vh,220px)). */
export function Section({
  children,
  fullBleed = false,
  air = false,
  className,
  as: Tag = "section",
  id,
  style,
}: SectionProps) {
  return (
    <Tag
      id={id}
      style={style}
      className={cn(air ? "py-[clamp(140px,20vh,300px)]" : "py-section", className)}
    >
      {fullBleed ? children : <Container>{children}</Container>}
    </Tag>
  );
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Narrow reading measure instead of the full 1320px. */
  narrow?: boolean;
}

/** Centered content column, max-width 1320px (design §4). */
export function Container({ children, className, narrow = false }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-6 sm:px-8", className)}
      style={{ maxWidth: narrow ? "820px" : "var(--container-max)" }}
    >
      {children}
    </div>
  );
}

interface GridProps {
  children: ReactNode;
  className?: string;
  /** Tailwind grid-cols utility set by the caller for responsive layouts. */
  cols?: string;
}

/** 12-col-friendly grid with a 24px gutter (design §4). */
export function Grid({ children, className, cols = "grid-cols-1 md:grid-cols-12" }: GridProps) {
  return <div className={cn("grid gap-gutter", cols, className)}>{children}</div>;
}
