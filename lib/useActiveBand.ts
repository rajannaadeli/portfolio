"use client";

import { useEffect, useState } from "react";

/*
  useActiveBand — single source of truth for "which theme band sits under the top
  chrome right now" (Phase-3 §2/§8). Both the floating nav and the scroll spine
  consume this hook so their palette inversion is always in sync.

  Detection: a thin IntersectionObserver sliver aligned with the nav line (~y=40)
  over the page's [data-band] wrappers. Returns "light" | "dark".
*/

export type Band = "light" | "dark";

export function useActiveBand(): Band {
  const [band, setBand] = useState<Band>("dark");

  useEffect(() => {
    const bands = Array.from(document.querySelectorAll<HTMLElement>("[data-band]"));
    if (!bands.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setBand(e.target.getAttribute("data-band") === "light" ? "light" : "dark");
          }
        }
      },
      { rootMargin: "-38px 0px -100% 0px", threshold: 0 },
    );
    bands.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);

  return band;
}
