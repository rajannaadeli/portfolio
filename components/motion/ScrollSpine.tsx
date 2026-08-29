"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";
import { useActiveBand } from "@/lib/useActiveBand";

/*
  ScrollSpine (Phase-3 §2) — a single SVG time-axis threading the page, echoing
  the hero's roster axis.

  Desktop ≥1280px: a fixed left-gutter path drawn 0→100% via stroke-dashoffset
  scrubbed to document scroll, ≤10 section nodes (unreached / reached / current),
  a 2px accent now-marker riding the scroll position, and one mono label beside
  the current node. Stroke + label colours invert with the band beneath (shared
  useActiveBand). Below 1280px the spine is not rendered — a 2px accent progress
  line is pinned to the top edge instead.

  Cost: one path, offsets cached and recomputed only on resize, all per-frame work
  is direct ref writes (no React re-render, no layout reads). Reduced-motion: path
  fully drawn and static, nodes shown reached, marker + label hidden.
*/

const LABELS = [
  "HERO",
  "STATS",
  "FEATURED",
  "SELECTED WORK",
  "WHAT I BUILD",
  "HOW I WORK",
  "TESTIMONIAL",
  "ABOUT",
  "FAQ",
  "CONTACT",
];

const VB = 1000; // viewBox height units

export function ScrollSpine() {
  const band = useActiveBand();
  const [reduced, setReduced] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const markerRef = useRef<SVGGElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const topbarRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Array<SVGCircleElement | null>>([]);
  const offsets = useRef<number[]>([]);

  // Detect after mount so SSR and first client render agree (no hydration
  // mismatch); the reduced-motion branch then re-renders static.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setReduced(prefersReducedMotion()), []);

  // Measure each <section>'s centre as a 0..1 document fraction; cache it and
  // place the nodes. Recompute on resize only.
  useEffect(() => {
    const measure = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
      const docH = document.documentElement.scrollHeight || 1;
      const ps: number[] = [];
      sections.slice(0, LABELS.length).forEach((s, i) => {
        const rect = s.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const p = Math.min(1, Math.max(0, (top + rect.height / 2) / docH));
        ps[i] = p;
        const node = nodeRefs.current[i];
        if (node) node.setAttribute("cy", String(p * VB));
      });
      offsets.current = ps;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scrub the draw + drive marker/nodes/label directly from scroll progress.
  useEffect(() => {
    if (reduced) return;
    let kill: (() => void) | null = null;
    let cancelled = false;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const path = pathRef.current;
      if (!path) return;
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

      const update = (progress: number) => {
        // now-marker
        if (markerRef.current) markerRef.current.setAttribute("transform", `translate(0 ${progress * VB})`);
        if (topbarRef.current) topbarRef.current.style.transform = `scaleX(${progress})`;
        // node states + current label
        const ps = offsets.current;
        let current = 0;
        for (let i = 0; i < ps.length; i++) if (progress >= ps[i] - 0.001) current = i;
        for (let i = 0; i < nodeRefs.current.length; i++) {
          const n = nodeRefs.current[i];
          if (!n) continue;
          const reachedNode = progress >= (ps[i] ?? 2) - 0.02;
          n.setAttribute("data-state", i === current ? "current" : reachedNode ? "reached" : "unreached");
        }
        if (labelRef.current) {
          labelRef.current.textContent = `${String(current + 1).padStart(2, "0")} / ${LABELS[current]}`;
          labelRef.current.style.top = `${(ps[current] ?? 0) * 100}vh`;
        }
      };

      const st = gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => update(self.progress),
          onRefresh: (self) => update(self.progress),
        },
      });
      update(0);
      const trigger = (st as unknown as { scrollTrigger?: { kill: () => void } }).scrollTrigger;
      kill = () => trigger?.kill();
    });

    return () => {
      cancelled = true;
      kill?.();
    };
  }, [reduced]);

  return (
    <>
      {/* Desktop spine — fixed left gutter, behind content */}
      <div
        ref={rootRef}
        aria-hidden
        data-band={band}
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-screen w-16 xl:block"
        style={{ color: band === "light" ? "#101014" : "#ffffff" }}
      >
        <svg
          className="absolute left-3 top-0 h-full w-10 overflow-visible"
          viewBox={`0 0 40 ${VB}`}
          preserveAspectRatio="none"
          fill="none"
        >
          {/* faint full track */}
          <path d={`M20 0 V${VB}`} stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
          {/* drawn path */}
          <path
            ref={pathRef}
            d={`M20 0 V${VB}`}
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDashoffset={reduced ? 0 : undefined}
            vectorEffect="non-scaling-stroke"
          />
          {LABELS.map((_, i) => (
            <circle
              key={i}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              className="spine-node"
              cx="20"
              cy="0"
              r="3"
              data-state={reduced ? "reached" : "unreached"}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {!reduced && (
            <g ref={markerRef}>
              <line x1="10" y1="0" x2="30" y2="0" stroke="var(--color-accent-violet)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <circle cx="20" cy="0" r="2.5" fill="var(--color-accent-violet)" />
            </g>
          )}
        </svg>
        {!reduced && (
          <div
            ref={labelRef}
            className="absolute left-[52px] hidden -translate-y-1/2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.08em] opacity-70 2xl:block"
            style={{ top: 0 }}
          />
        )}
      </div>

      {/* Mobile/tablet — top progress line */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px] origin-left bg-accent-violet xl:hidden"
        ref={topbarRef}
        style={{ transform: "scaleX(0)" }}
      />
    </>
  );
}
