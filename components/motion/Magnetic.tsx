"use client";

import { useRef, type ReactNode } from "react";

/*
  Magnetic — desktop-only pull toward the cursor (≤6px), spring back on leave
  (design §4). Pointer-fine only; disabled on touch and under reduced-motion.
  transform-only, CSS transition handles the spring-back. No GSAP needed.
*/

const MAX = 6;

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);

  const enabled = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * MAX;
    const y = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * MAX;
    el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0px, 0px)";
  };

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={className}
      style={{ display: "inline-flex", transition: "transform 120ms ease-out", willChange: "transform" }}
    >
      {children}
    </span>
  );
}
