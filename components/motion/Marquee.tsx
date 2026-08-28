import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
  Marquee — continuous tech-stack strip, pauses on hover (design §4). Pure CSS
  (keyframes in globals.css); static under reduced-motion. Content is duplicated
  so the -50% translate loops seamlessly. Server component — zero JS.
*/

export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("marquee overflow-hidden", className)} aria-hidden>
      <div className="marquee-track">
        <div className="flex items-center">{children}</div>
        <div className="flex items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
