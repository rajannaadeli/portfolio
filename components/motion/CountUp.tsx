"use client";

import { useRef } from "react";
import { useGsap } from "@/lib/gsap";

/*
  CountUp — animates a stat numeral from 0 to its value once at 60% viewport
  (design §4, 1.2s ease-out). The final value is rendered server-side, so
  reduced-motion / no-JS show the real number immediately; the tween only
  overwrites it on the way up.
*/

interface CountUpProps {
  /** Final numeric value. */
  value: number;
  /** Trailing glyph, e.g. "+". */
  suffix?: string;
  className?: string;
}

export function CountUp({ value, suffix = "", className }: CountUpProps) {
  const numRef = useRef<HTMLSpanElement | null>(null);

  const scope = useGsap(({ gsap, scope }) => {
    if (!scope || !numRef.current) return;
    const counter = { n: 0 };
    const el = numRef.current;
    gsap.to(counter, {
      n: value,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: { trigger: scope, start: "top 60%", once: true },
      onUpdate: () => {
        el.textContent = String(Math.round(counter.n));
      },
    });
  });

  return (
    <span ref={scope as React.RefObject<HTMLSpanElement>} className={className}>
      <span ref={numRef}>{value}</span>
      {suffix}
    </span>
  );
}
