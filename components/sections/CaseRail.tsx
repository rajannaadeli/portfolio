"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MetaLabel } from "@/components/ui/typography";
import type { CaseFacts } from "@/lib/content";

/*
  CaseRail (C.1) — the sticky left rail on case pages: case name, a facts stack,
  a scroll-spied section nav (the body's <h2>s), a thin accent reading-progress
  line, and the primary action. Desktop only; below 1024 the page renders a
  compact facts bar instead (in the page). Progress + spy are transform/opacity
  and IntersectionObserver — no layout thrash.

  Note: the "miniature route-thread" rail variant is deferred (see DECISIONS);
  this ships the functional progress line the spec's rail needs.
*/

interface CaseRailProps {
  name: string;
  facts: CaseFacts;
  sections: { id: string; text: string }[];
  action: { label: string; href: string; external?: boolean };
}

export function CaseRail({ name, facts, sections, action }: CaseRailProps) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const fill = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((e): e is HTMLElement => Boolean(e));
    if (els.length) {
      const io = new IntersectionObserver(
        (entries) => {
          const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (vis[0]) setActive(vis[0].target.id);
        },
        { rootMargin: "-20% 0px -70% 0px" },
      );
      els.forEach((e) => io.observe(e));
      return () => io.disconnect();
    }
  }, [sections]);

  useEffect(() => {
    const article = document.getElementById("case-body");
    const onScroll = () => {
      if (!article || !fill.current) return;
      const r = article.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const passed = Math.min(1, Math.max(0, -r.top / (total || 1)));
      fill.current.style.transform = `scaleY(${passed})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-28 flex flex-col gap-8">
      <MetaLabel>{name}</MetaLabel>

      <dl className="flex flex-col gap-4">
        <RailFact label="Role" value={facts.role} />
        <RailFact label="Timeline" value={facts.timeline} />
        <RailFact label="Status" value={facts.status} />
        {facts.stack.length ? <RailFact label="Stack" value={facts.stack.join(" · ")} mono /> : null}
      </dl>

      {sections.length ? (
        <nav className="flex gap-3">
          {/* progress line */}
          <div className="relative w-[2px] shrink-0 overflow-hidden rounded-pill bg-border">
            <div
              ref={fill}
              className="absolute inset-x-0 top-0 h-full origin-top bg-[color:var(--accent-text)]"
              style={{ transform: "scaleY(0)" }}
            />
          </div>
          <ul className="flex flex-col gap-2.5">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`font-mono text-[12px] uppercase tracking-[0.06em] transition-colors ${
                    active === s.id ? "text-(--accent-text)" : "text-dim hover:text-muted"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")} {s.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <Button href={action.href} external={action.external} className="w-full">
        {action.label}
      </Button>
    </div>
  );
}

function RailFact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt>
        <MetaLabel>{label}</MetaLabel>
      </dt>
      <dd className={`mt-1 text-body text-text ${mono ? "font-mono text-[13px]" : "font-body"}`}>
        {value || "—"}
      </dd>
    </div>
  );
}
