"use client";

import type { ElementType, ReactNode } from "react";
import { useGsap } from "@/lib/gsap";

/*
  Reveal — section reveal (design §4): children fade + rise (y 40 → 0), 0.7s
  power3.out, staggered 0.06, triggered once at 75% viewport. Animates the
  wrapper's direct children so callers don't annotate each element.

  Content is visible at rest: under prefers-reduced-motion the GSAP guard no-ops
  and nothing is ever hidden, so no-JS and reduced-motion both render final state.
*/

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger between children. */
  stagger?: number;
  style?: React.CSSProperties;
}

export function Reveal({ children, as: Tag = "div", className, stagger = 0.06, style }: RevealProps) {
  const scope = useGsap(({ gsap, scope }) => {
    if (!scope) return;
    const targets = Array.from(scope.children);
    if (!targets.length) return;
    gsap.from(targets, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger,
      scrollTrigger: { trigger: scope, start: "top 75%", once: true },
    });
  });

  return (
    <Tag ref={scope} className={className} style={style}>
      {children}
    </Tag>
  );
}
