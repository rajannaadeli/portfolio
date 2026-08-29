"use client";

import { cn } from "@/lib/cn";
import { TextReveal } from "@/components/motion/TextReveal";
import { useGsap } from "@/lib/gsap";

/*
  SectionHeader — one uniform eyebrow + heading treatment across the page
  (Phase-3 §8), with a 2px accent underline that draws left-to-right on reveal,
  after the heading's text-mask (§2). Eyebrow: mono, uppercase, --text-dim,
  tracking 0.08em, fixed margin. Reduced-motion: underline renders fully drawn.
*/

interface SectionHeaderProps {
  eyebrow: string;
  /** Heading, one entry per masked line. */
  lines: string[];
  variant?: "display" | "h2";
  /** Tint the eyebrow with the band accent instead of dim. */
  accentEyebrow?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  lines,
  variant = "h2",
  accentEyebrow = false,
  className,
}: SectionHeaderProps) {
  const scope = useGsap(({ gsap, scope }) => {
    const path = scope?.querySelector("[data-underline]");
    if (!path) return;
    const len = (path as SVGPathElement).getTotalLength();
    gsap.fromTo(
      path,
      { strokeDasharray: len, strokeDashoffset: len },
      {
        strokeDashoffset: 0,
        duration: 0.6,
        delay: 0.45,
        ease: "power2.out",
        scrollTrigger: { trigger: scope, start: "top 80%", once: true },
      },
    );
  });

  return (
    <div ref={scope as React.RefObject<HTMLDivElement>} className={className}>
      <div
        className={cn(
          "font-mono text-meta uppercase",
          accentEyebrow ? "text-(--accent-text)" : "text-dim",
        )}
      >
        {eyebrow}
      </div>
      <TextReveal
        lines={lines}
        as="h2"
        className={cn(
          "mt-4 font-display text-text",
          variant === "display" ? "text-display" : "text-h2",
        )}
      />
      <svg
        className="mt-4 block h-[2px] w-[72px] overflow-visible"
        viewBox="0 0 72 2"
        fill="none"
        aria-hidden
      >
        <path
          data-underline
          d="M0 1 H72"
          stroke="var(--accent-text)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
