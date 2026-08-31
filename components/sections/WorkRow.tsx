"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { DeviceFrame } from "@/components/ui/device-frame";
import { useGsap } from "@/lib/gsap";
import type { CaseStudy } from "@/lib/content";

/*
  WorkRow — one editorial row in Selected Work (Phase-3 §1.3/§1.4). Every row's
  image sits in a fixed 16:10 slot so the five rows share a consistent visual
  weight (no more PlanIt/whitefleet towering). A landscape screenshot fills the
  slot; a phone or portrait shot is composed centred on a soft accent-tinted
  panel rather than driving the row height. Image and text enter from opposite
  sides on reveal; a short right-angle connector draws from eyebrow to image.
*/

const SLOT_RATIO = 16 / 10;

function pickImage(c: CaseStudy) {
  const shortlisted = c.images.filter((i) => i.shortlisted);
  const rank1 = shortlisted[0] ?? c.images[0];
  // A portrait *web* capture (e.g. PlanIt's full-page shot) reads poorly shrunk;
  // prefer a landscape shortlisted image. Phone shots are kept and composed.
  if (rank1.frame !== "phone" && rank1.width < rank1.height) {
    return shortlisted.find((i) => i.width > i.height) ?? rank1;
  }
  return rank1;
}

export function WorkRow({ c, flip }: { c: CaseStudy; flip: boolean }) {
  const thumb = pickImage(c);
  const ratio = thumb.width && thumb.height ? thumb.width / thumb.height : SLOT_RATIO;
  // Landscape fills the slot width; narrower shots take a fraction of it.
  const frameWidth = ratio >= SLOT_RATIO ? "100%" : `${Math.round((ratio / SLOT_RATIO) * 92)}%`;

  const scope = useGsap(({ gsap, scope }) => {
    if (!scope) return;
    const img = scope.querySelector("[data-row-img]");
    const txt = scope.querySelector("[data-row-txt]");
    if (img && txt) {
      gsap.from([img, txt], {
        x: (i: number) => (i === 0 ? -24 : 24),
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: scope, start: "top 78%", once: true },
      });
    }
    const conn = scope.querySelector("[data-connector]") as SVGPathElement | null;
    if (conn) {
      const len = conn.getTotalLength();
      gsap.fromTo(
        conn,
        { strokeDasharray: len, strokeDashoffset: len },
        {
          strokeDashoffset: 0,
          duration: 0.6,
          delay: 0.35,
          ease: "power2.out",
          scrollTrigger: { trigger: scope, start: "top 78%", once: true },
        },
      );
    }
  });

  return (
    <div
      ref={scope as React.RefObject<HTMLDivElement>}
      className="group grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12"
      style={{ "--accent": c.accentVar, "--accent-text": c.accentTextVar } as React.CSSProperties}
    >
      <div
        data-row-img
        className={cn(
          "transition-transform duration-200 will-change-transform group-hover:-translate-y-1 md:col-span-7",
          flip ? "md:order-2" : "md:order-1",
        )}
      >
        <div
          className="flex items-center justify-center overflow-hidden rounded-card border border-border p-4 sm:p-6"
          style={{
            aspectRatio: `${16} / ${10}`,
            background: "color-mix(in srgb, var(--accent) 6%, var(--color-surface-1))",
          }}
        >
          <div style={{ width: frameWidth }}>
            <DeviceFrame image={thumb} composed sizes="(min-width: 768px) 46vw, 92vw" />
          </div>
        </div>
      </div>

      <div className={cn("relative md:col-span-5", flip ? "md:order-1" : "md:order-2")}>
        {/* eyebrow → image connector (desktop) */}
        <svg
          aria-hidden
          className={cn(
            "absolute top-2 hidden h-6 w-16 overflow-visible md:block",
            flip ? "right-full mr-2" : "left-full ml-2",
          )}
          viewBox="0 0 64 24"
          fill="none"
        >
          <path
            data-connector
            d={flip ? "M64 4 H16 V22" : "M0 4 H48 V22"}
            stroke="var(--accent-text)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        </svg>

        <div className="font-mono text-meta uppercase text-dim transition-colors group-hover:text-(--accent-text)">
          0{c.order + 1} / {c.name}
        </div>
        <h3 className="mt-3 font-display text-h2 text-text">
          <Link
            href={`/work/${c.slug}`}
            className="transition-colors hover:text-(--accent-text)"
          >
            {c.name}
          </Link>
        </h3>
        <p className="mt-4 max-w-[46ch] font-body text-body-lg text-muted">{c.lede}</p>
        <div className="mt-5 font-mono text-meta uppercase text-dim">
          {c.facts.stack.slice(0, 4).join(" · ")}
        </div>
        <Link
          href={`/work/${c.slug}`}
          className="mt-6 inline-block font-mono text-meta uppercase text-(--accent-text) underline decoration-transparent underline-offset-4 transition-[text-decoration-color] hover:decoration-current"
        >
          Read the {c.name} case →
        </Link>
      </div>
    </div>
  );
}
