"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/*
  RevealHeadings (C.4) — draws each case-body <h2>'s accent underline as it
  enters view. Adds `.prose-anim` to the target so the CSS only arms the
  animation once JS is present; without JS the underline is static and visible.
  No-ops under reduced motion. IntersectionObserver only — no scroll handlers.
*/

export function RevealHeadings({ targetId }: { targetId: string }) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root || prefersReducedMotion()) return;
    const heads = Array.from(root.querySelectorAll<HTMLElement>("h2"));
    if (!heads.length) return;
    root.classList.add("prose-anim");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [targetId]);

  return null;
}
