"use client";

import { useRef, type ReactNode } from "react";
import { useGsap } from "@/lib/gsap";

/*
  ParallaxLayer — drifts the whole framed screenshot ≤8% vertically as it scrolls
  through the viewport (design §4). It translates the entire frame within the
  section's padding rather than scaling the image inside the frame, so a
  screenshot is never cropped through its own UI chrome and no edge is ever
  clipped (Phase-3 §1.2/§5). transform-only; no-ops under reduced-motion.
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
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });

  return (
    <div ref={scope as React.RefObject<HTMLDivElement>}>
      <div ref={inner} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
