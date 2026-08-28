"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

/*
  Persistent floating CTA (design §5.2) — violet pill, bottom-right, "Open the
  live demo ↗". Fades out when the contact section (or footer) is in view so it
  never overlaps them. Respects reduced-motion (opacity only; no transform).
*/

export function FloatingCTA() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const targets = ["#contact", "footer"]
      .map((s) => document.querySelector(s))
      .filter(Boolean) as Element[];
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Hide while any watched target is intersecting the viewport.
        const anyVisible = entries.some((e) => e.isIntersecting);
        if (anyVisible) setHidden(true);
        else setHidden(targets.every((t) => t.getBoundingClientRect().top > window.innerHeight));
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <a
      href={SITE.links.rosterbay}
      target="_blank"
      rel="noreferrer noopener"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className="fixed bottom-5 right-5 z-40 rounded-pill bg-accent-violet px-5 py-3 font-mono text-meta uppercase text-white shadow-[0_20px_50px_-20px_rgba(123,92,255,0.8)] transition-[opacity,transform] duration-300 hover:brightness-110"
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(12px)" : "translateY(0)",
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      Open the live demo ↗
    </a>
  );
}
