import type { ReactNode, CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/*
  Button — pill shape (radius 999). Primary = orange, secondary = outline,
  ghost = bare. Renders a Next <Link> when `href` is set, else a <button>.
  Motion (magnetic hover) is Phase 2; only a color/border transition here.
*/

type ButtonVariant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-pill font-mono text-meta uppercase " +
  "px-6 py-3 transition-colors duration-200 select-none whitespace-nowrap";

const VARIANT: Record<ButtonVariant, string> = {
  // Literal black (not the --black token, which the light band remaps to paper).
  primary: "bg-accent-orange text-[#0a0a0a] hover:bg-[color:var(--color-accent-orange)]/90",
  secondary:
    "border border-border-hover text-text hover:border-[color:var(--color-text)] hover:bg-surface-1",
  ghost: "text-muted hover:text-text",
};

interface CommonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  style?: CSSProperties;
}

interface AsLink extends CommonProps {
  href: string;
  external?: boolean;
  onClick?: never;
  type?: never;
}

interface AsButton extends CommonProps {
  href?: undefined;
  external?: never;
  onClick?: () => void;
  type?: "button" | "submit";
}

export function Button(props: AsLink | AsButton) {
  const { children, variant = "primary", className, style } = props;
  const classes = cn(BASE, VARIANT[variant], className);

  if ("href" in props && props.href) {
    const external = props.external;
    return (
      <Link
        href={props.href}
        className={classes}
        style={style}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {children}
      </Link>
    );
  }

  const { onClick, type = "button" } = props as AsButton;
  return (
    <button type={type} onClick={onClick} className={classes} style={style}>
      {children}
    </button>
  );
}
