"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { DeviceFrame } from "@/components/ui/device-frame";
import { useGsap } from "@/lib/gsap";
import type { CaseStudy } from "@/lib/content";

/*
  WorkRow — one editorial row in Selected Work (Phase 2 §2.4). Image and text
  alternate sides and enter from opposite directions, converging (design §4).
  Hover lifts the image 4px and brings the per-case accent onto eyebrow + link.
  Mobile stacks image-over-text with order preserved.
*/

export function WorkRow({ c, flip }: { c: CaseStudy; flip: boolean }) {
  const thumb = c.images.find((i) => i.shortlisted) ?? c.images[0];

  const scope = useGsap(({ gsap, scope }) => {
    if (!scope) return;
    const img = scope.querySelector("[data-row-img]");
    const txt = scope.querySelector("[data-row-txt]");
    if (!img || !txt) return;
    gsap.from([img, txt], {
      x: (i: number) => (i === 0 ? -24 : 24),
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: { trigger: scope, start: "top 78%", once: true },
    });
  });

  return (
    <div
      ref={scope as React.RefObject<HTMLDivElement>}
      className="group grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12"
      style={
        {
          "--accent": c.accentVar,
          "--accent-text": c.accentTextVar,
        } as React.CSSProperties
      }
    >
      <div
        data-row-img
        className={cn(
          "transition-transform duration-200 will-change-transform group-hover:-translate-y-1 md:col-span-7",
          flip ? "md:order-2" : "md:order-1",
        )}
      >
        <DeviceFrame image={thumb} sizes="(min-width: 768px) 60vw, 100vw" />
      </div>

      <div className={cn("md:col-span-5", flip ? "md:order-1" : "md:order-2")}>
        <div className="font-mono text-meta uppercase text-dim transition-colors group-hover:text-[color:var(--accent-text)]">
          0{c.order + 1} / {c.name}
        </div>
        <h3 className="mt-3 font-display text-h2 text-text">
          <Link href={`/work/${c.slug}`} className="transition-colors hover:text-[color:var(--accent-text)]">
            {c.name}
          </Link>
        </h3>
        <p className="mt-4 max-w-[46ch] font-body text-body-lg text-muted">{c.lede}</p>
        <div className="mt-5 font-mono text-meta uppercase text-dim">
          {c.facts.stack.slice(0, 4).join(" · ")}
        </div>
        <Link
          href={`/work/${c.slug}`}
          className="mt-6 inline-block font-mono text-meta uppercase text-[color:var(--accent-text)] underline decoration-transparent underline-offset-4 transition-[text-decoration-color] hover:decoration-current"
        >
          Read the case →
        </Link>
      </div>
    </div>
  );
}
