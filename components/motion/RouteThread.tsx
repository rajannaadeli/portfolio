"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";
import { sampleSpline, widthArray, buildOutline, pointAt, type Sample } from "@/lib/route-geometry";

/*
  RouteThread (replaces the straight spine) — one continuous, meandering,
  variable-width ribbon traced down the whole page like a GPS route between job
  sites. It weaves behind content, surfaces in front at band boundaries to stitch
  the dark/light bands, and carries a small glowing head at the scroll position.

  Geometry is Catmull-Rom through one anchor per section (uneven amplitude → reads
  as a route, not wallpaper); width swells at section centres and thins with
  scroll velocity; reveal is a clip-rect scaleY scrubbed to document progress.
  All heavy math is cached at mount/resize; the shared GSAP ticker only lerps the
  head + swaps a precomputed outline. Reduced-motion: fully drawn, static, no head.
  ≥1280 full system; 768–1279 behind-content only, amplitude compressed; <768 a
  2px top progress line.
*/

// x-fraction per section, top→bottom. Uneven amplitude; crossings land on the
// three major band boundaries; FAQ runs near-centre (calm) before contact.
const XF = [
  0.16, // hero
  0.74, // stats
  0.3, // featured
  0.68, // selected work   (dark→light crossing)
  0.24, // what I build
  0.7, // how I work
  0.32, // testimonial     (light→dark crossing)
  0.66, // about           (dark→light crossing)
  0.47, // faq (calm)
  0.54, // contact
];

const BUCKETS = [0.6, 0.7, 0.8, 0.9, 1.0];
const BASE_W = 1.2;
const PEAK_W = 4.5;

interface Geo {
  vw: number;
  docH: number;
  samples: Sample[];
  outlines: string[]; // one per BUCKET
  stops: { off: number; color: string; opacity: number }[];
  boundaries: number[]; // band-boundary Y in doc coords
  bands: { top: number; bottom: number; theme: string }[];
  full: boolean; // ≥1280 → weave + head
}

function nearestArc(samples: Sample[], y: number): number {
  let best = 0;
  let bestD = Infinity;
  for (const s of samples) {
    const d = Math.abs(s.y - y);
    if (d < bestD) {
      bestD = d;
      best = s.s;
    }
  }
  return best;
}

export function RouteThread() {
  const [geo, setGeo] = useState<Geo | null>(null);
  const [tier, setTier] = useState<"full" | "mid" | "none">("none");
  const [reduced, setReduced] = useState(false);

  const backPath = useRef<SVGPathElement | null>(null);
  const frontPath = useRef<SVGPathElement | null>(null);
  const revealRect = useRef<SVGRectElement | null>(null);
  const head = useRef<SVGGElement | null>(null);
  const headDot = useRef<SVGCircleElement | null>(null);
  const headHalo = useRef<SVGCircleElement | null>(null);
  const topbar = useRef<HTMLDivElement | null>(null);

  // live scroll state written by ScrollTrigger, read by the ticker
  const prog = useRef(0);
  const vel = useRef(0);
  const vf = useRef(1);
  const headProg = useRef(0);
  const bucket = useRef(4);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setReduced(prefersReducedMotion()), []);

  // Measure + build geometry at mount, on debounced resize, and after fonts load.
  useEffect(() => {
    let raf = 0;
    const build = () => {
      const vw = window.innerWidth;
      const t: "full" | "mid" | "none" = vw >= 1280 ? "full" : vw >= 768 ? "mid" : "none";
      setTier(t);
      if (t === "none") {
        setGeo(null);
        return;
      }
      const sections = Array.from(document.querySelectorAll<HTMLElement>("main section")).slice(0, XF.length);
      if (!sections.length) return;
      const docH = document.documentElement.scrollHeight;
      const compress = t === "mid" ? 0.6 : 1;
      const anchors = sections.map((s, i) => {
        const r = s.getBoundingClientRect();
        return { x: (0.5 + (XF[i] - 0.5) * compress) * vw, y: r.top + window.scrollY + r.height / 2 };
      });
      const samples = sampleSpline(anchors, 300, 400);
      const sectionArcs = anchors.map((a) => nearestArc(samples, a.y));
      const outlines = BUCKETS.map((b) =>
        buildOutline(samples, widthArray(samples, sectionArcs, BASE_W, PEAK_W, b)),
      );
      const bands = Array.from(document.querySelectorAll<HTMLElement>("[data-band]")).map((b) => {
        const r = b.getBoundingClientRect();
        return {
          top: r.top + window.scrollY,
          bottom: r.bottom + window.scrollY,
          theme: b.getAttribute("data-band") ?? "dark",
        };
      });
      const stops = bands.flatMap((bd) => {
        const c =
          bd.theme === "light"
            ? { color: "#101014", opacity: 0.12 }
            : { color: "var(--color-accent-violet)", opacity: 0.9 };
        return [
          { off: bd.top / docH, ...c },
          { off: bd.bottom / docH, ...c },
        ];
      });
      const boundaries = bands.slice(1).map((b) => b.top);
      setGeo({ vw, docH, samples, outlines, stops, boundaries, bands, full: t === "full" });
    };
    const debounced = () => {
      clearTimeout(raf);
      raf = window.setTimeout(build, 150);
    };
    build();
    window.addEventListener("resize", debounced);
    document.fonts?.ready.then(build).catch(() => {});
    return () => {
      clearTimeout(raf);
      window.removeEventListener("resize", debounced);
    };
  }, []);

  // Reveal scrub + shared-ticker head/velocity loop.
  useEffect(() => {
    if (reduced || !geo) return;
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const rect = revealRect.current;
      const st = rect
        ? gsap.fromTo(
            rect,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.4,
                onUpdate: (self) => {
                  prog.current = self.progress;
                  vel.current = self.getVelocity();
                },
              },
            },
          )
        : null;

      const tick = () => {
        // velocity factor → uniform thinning, lerped, restoring at rest
        const target = 1 - Math.min(0.4, Math.abs(vel.current) / 5000 * 0.4);
        vf.current += (target - vf.current) * 0.08;
        vel.current *= 0.9; // decay so it restores when scrolling stops
        const bi = Math.max(0, Math.min(4, Math.round((vf.current - 0.6) / 0.1)));
        if (bi !== bucket.current) {
          bucket.current = bi;
          backPath.current?.setAttribute("d", geo.outlines[bi]);
          frontPath.current?.setAttribute("d", geo.outlines[bi]);
        }
        // head with velocity lag
        const lead = ((1 - vf.current) / 0.4) * 0.015 * Math.sign(vel.current || 1);
        const ht = Math.max(0, Math.min(1, prog.current + lead));
        headProg.current += (ht - headProg.current) * 0.1;
        const p = pointAt(geo.samples, headProg.current);
        head.current?.setAttribute("transform", `translate(${p.x} ${p.y})`);
        // head band-awareness: violet 5px + halo on dark, ink 4px no halo on light
        if (headDot.current && headHalo.current) {
          const light = geo.bands.some((b) => p.y >= b.top && p.y < b.bottom && b.theme === "light");
          headDot.current.setAttribute("r", light ? "2" : "2.5");
          headDot.current.setAttribute("fill", light ? "#101014" : "var(--color-accent-violet)");
          headHalo.current.setAttribute("opacity", light ? "0" : "0.18");
        }
      };
      gsap.ticker.add(tick);
      const trigger = (st as unknown as { scrollTrigger?: { kill: () => void } } | null)?.scrollTrigger;
      cleanup = () => {
        gsap.ticker.remove(tick);
        trigger?.kill();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced, geo]);

  // Mobile <768: only the top progress line.
  useEffect(() => {
    if (tier !== "none" || reduced) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (topbar.current) topbar.current.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tier, reduced]);

  // Mobile progress line
  if (tier === "none") {
    return (
      <div
        aria-hidden
        ref={topbar}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px] origin-left bg-accent-violet"
        style={{ transform: "scaleX(0)" }}
      />
    );
  }

  if (!geo) return null;
  const restOutline = geo.outlines[4];

  return (
    <>
      {/* BACK — behind content */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-0"
        width="100%"
        height={geo.docH}
        viewBox={`0 0 ${geo.vw} ${geo.docH}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="routeFill" x1="0" y1="0" x2="0" y2={geo.docH} gradientUnits="userSpaceOnUse">
            {geo.stops.map((s, i) => (
              <stop key={i} offset={`${(s.off * 100).toFixed(2)}%`} stopColor={s.color} stopOpacity={s.opacity} />
            ))}
          </linearGradient>
          <clipPath id="routeReveal">
            <rect
              ref={revealRect}
              x="0"
              y="0"
              width={geo.vw}
              height={geo.docH}
              style={{ transformBox: "fill-box", transformOrigin: "top", transform: reduced ? "scaleY(1)" : "scaleY(0)" }}
            />
          </clipPath>
          {geo.full ? (
            <mask id="routeWeave" maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width={geo.vw} height={geo.docH} fill="black" />
              {geo.boundaries.map((b, i) => (
                <rect key={i} x="0" y={b - 70} width={geo.vw} height="140" fill="white" />
              ))}
            </mask>
          ) : null}
        </defs>

        <path ref={backPath} d={restOutline} fill="url(#routeFill)" clipPath="url(#routeReveal)" />
      </svg>

      {/* FRONT — surfaces only at band boundaries (weave) + the head */}
      {geo.full ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20"
          width="100%"
          height={geo.docH}
          viewBox={`0 0 ${geo.vw} ${geo.docH}`}
          preserveAspectRatio="none"
        >
          <path
            ref={frontPath}
            d={restOutline}
            fill="url(#routeFill)"
            clipPath="url(#routeReveal)"
            mask="url(#routeWeave)"
          />
          {!reduced ? (
            <g ref={head}>
              <circle ref={headHalo} cx="0" cy="0" r="11" fill="var(--color-accent-violet)" opacity="0.18" />
              <circle ref={headDot} cx="0" cy="0" r="3" fill="var(--color-accent-violet)" />
            </g>
          ) : null}
        </svg>
      ) : null}
    </>
  );
}
