import type { ReactNode, CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/*
  Card — 28px radius, --surface-1 plane, hairline border that lifts on hover.
  Borders over shadows (design §4). When `href` is set the whole card links.
*/

interface CardProps {
  children: ReactNode;
  href?: string;
  className?: string;
  style?: CSSProperties;
}

const BASE =
  "block rounded-card bg-surface-1 border border-border p-6 sm:p-8 " +
  "transition-colors duration-200";
const INTERACTIVE = "hover:border-border-hover hover:bg-surface-2";

export function Card({ children, href, className, style }: CardProps) {
  if (href) {
    return (
      <Link href={href} className={cn(BASE, INTERACTIVE, "group", className)} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <div className={cn(BASE, className)} style={style}>
      {children}
    </div>
  );
}
