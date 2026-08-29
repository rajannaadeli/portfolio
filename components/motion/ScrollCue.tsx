"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/*
  ScrollCue (Phase-3 §3) — a mono "SCROLL" micro-label with a gently pulsing
  drawn arrow at the hero's bottom edge. Fades out permanently after the first
  scroll. The pulse is CSS (static under reduced-motion via the global rule).
*/

export function ScrollCue() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 8) {
        setGone(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "mt-14 inline-flex flex-col items-center gap-2 text-dim transition-opacity duration-500",
        gone && "pointer-events-none opacity-0",
      )}
    >
      <span className="font-mono text-meta uppercase">Scroll</span>
      <svg className="scroll-cue" width="14" height="22" viewBox="0 0 14 22" fill="none">
        <path
          d="M7 1 V17 M2 12 L7 17 L12 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
