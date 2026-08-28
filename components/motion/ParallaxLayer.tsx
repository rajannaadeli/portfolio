"use client";

import { useRef, type ReactNode } from "react";
import { useGsap } from "@/lib/gsap";

/*
  ParallaxLayer — translates its (server-rendered) child ≤8% vertically as it
  scrolls through the viewport (design §4). The child is scaled up slightly so
  the translation never reveals an edge. transform-only; no-ops under
  prefers-reduced-motion via the Phase 1 GSAP guard.
*/

export function ParallaxLayer({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement | null>(null);

  const scope = useGsap(({ gsap }) => {
    const el = inner.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { yPercent: -4 },
      {
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });

  return (
    <div ref={scope as React.RefObject<HTMLDivElement>} className="h-full w-full">
      <div ref={inner} className="h-full w-full scale-[1.12] will-change-transform">
        {children}
      </div>
    </div>
  );
}
