"use client";

import { useEffect } from "react";

/*
  SmoothScroll — global Lenis smooth scroll (design §4: lerp 0.09, duration 1.1).

  Lenis is dynamically imported inside the effect so it is code-split into its
  own async chunk and never lands in the initial route JS of a static page; it
  initializes only after hydration (first paint is unaffected). Entirely
  disabled under prefers-reduced-motion, and destroyed on unmount.

  This is the baseline motion layer only. No scroll choreography, reveals, or
  count-ups run in Phase 1 (see lib/gsap.ts + DECISIONS.md).
*/

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let destroy: (() => void) | null = null;
    let cancelled = false;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({ lerp: 0.09, duration: 1.1 });
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      destroy = () => lenis.destroy();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      destroy?.();
    };
  }, []);

  return <>{children}</>;
}
