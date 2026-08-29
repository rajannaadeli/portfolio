import Link from "next/link";
import { Section } from "@/components/ui/layout";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { SITE } from "@/lib/site";

/*
  2.2 Stat bento (Phase-3 §4). A 12-column, two-row composition: the "1 live
  product" card is TALL — 4 columns, full row height — with numeral, label and
  the open link stacked and vertically balanced. The three small stats fill the
  other 8 columns, 2-up over 1. Tablet 2×2, mobile stacked with the live card
  first. Mega numerals use the DISPLAY face (see DECISIONS — amends §3).
*/

const SMALL = [
  { value: 3, suffix: "+", label: "years building software", span: "lg:col-span-4" },
  { value: 8, suffix: "", label: "products shipped to production", span: "lg:col-span-4" },
  { value: 3, suffix: "", label: "countries with clients", span: "lg:col-span-8" },
];

export function StatRow() {
  return (
    <Section>
      <Reveal
        className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2"
        stagger={0.08}
      >
        {/* Tall live-product card (first in DOM → first on mobile) */}
        <Link
          href={SITE.links.rosterbay}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex flex-col justify-between rounded-card border border-accent-violet/40 bg-surface-1 p-6 transition-colors hover:border-accent-violet sm:p-8 md:col-span-2 lg:col-span-4 lg:row-span-2"
        >
          <div className="flex items-start justify-between">
            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-pill border border-accent-violet/40 font-mono text-body-lg text-accent-violet"
            >
              R
            </span>
            <span className="font-mono text-meta uppercase text-accent-violet transition-transform group-hover:translate-x-1">
              Open RosterBay ↗
            </span>
          </div>
          <div className="mt-10 font-display text-mega leading-[0.9] text-accent-violet">
            <CountUp value={1} />
          </div>
          <div className="mt-4 font-body text-body-lg text-text">
            live product you can open right now
          </div>
        </Link>

        {SMALL.map((s) => (
          <div
            key={s.label}
            className={`flex flex-col justify-between rounded-card border border-border bg-surface-1 p-6 transition-colors hover:border-border-hover md:col-span-1 ${s.span}`}
          >
            <div className="font-display text-mega leading-[0.9] text-text">
              <CountUp value={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-4 font-body text-body text-muted">{s.label}</div>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
