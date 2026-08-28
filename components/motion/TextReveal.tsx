"use client";

import type { ElementType } from "react";
import { cn } from "@/lib/cn";
import { useGsap } from "@/lib/gsap";

/*
  TextReveal — line-by-line clip/mask reveal for the hero display line and
  section headings (design §4): each line rises out from behind a clip, stagger
  0.08. Pass `lines` for a multi-line heading. Visible at rest under
  reduced-motion (guard no-ops; the translate never applies).
*/

interface TextRevealProps {
  lines: string[];
  as?: ElementType;
  className?: string;
  /** Applied to each line for type styling. */
  lineClassName?: string;
}

export function TextReveal({ lines, as: Tag = "h2", className, lineClassName }: TextRevealProps) {
  const scope = useGsap(({ gsap, scope }) => {
    if (!scope) return;
    const inner = scope.querySelectorAll("[data-line-inner]");
    if (!inner.length) return;
    gsap.from(inner, {
      yPercent: 115,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: scope, start: "top 80%", once: true },
    });
  });

  return (
    <Tag ref={scope} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <span data-line-inner className={cn("block will-change-transform", lineClassName)}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
