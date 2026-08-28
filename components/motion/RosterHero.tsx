"use client";

import { useGsap } from "@/lib/gsap";

/*
  RosterHero — the hero roster assembling on a time axis (design §4 motion table).
  A pure DOM/SVG + GSAP timeline: the axis and site rows draw in, shift bars
  scale from their left edge staggered by start time, a now-line sweeps in and
  ticks, and an avatar chip lands into an empty slot. Plays once on load then
  rests. transform/opacity only, initialized after first paint (does not delay
  LCP). Under reduced-motion the guard no-ops and it renders in final state.
*/

const TICKS = ["6a", "9a", "12p", "3p", "6p", "9p"];
// site row lanes with seeded shifts: [startPct, widthPct, filled]
const ROWS: { label: string; shifts: [number, number, boolean][] }[] = [
  { label: "Marion", shifts: [[4, 26, true], [34, 22, true]] },
  { label: "Hospital", shifts: [[10, 30, true], [60, 30, true]] },
  { label: "Riverbank", shifts: [[0, 20, true], [46, 18, false]] },
  { label: "Kingsford", shifts: [[24, 34, true], [64, 24, true]] },
];

export function RosterHero() {
  const scope = useGsap(({ gsap, scope }) => {
    if (!scope) return;
    const q = <T extends Element>(s: string) => Array.from(scope.querySelectorAll<T>(s));
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(scope.querySelector("[data-axis]"), { scaleX: 0, opacity: 0, duration: 0.6 })
      .from(q("[data-tick]"), { opacity: 0, y: -6, stagger: 0.04, duration: 0.4 }, "-=0.3")
      .from(q("[data-row]"), { opacity: 0, x: -12, stagger: 0.08, duration: 0.5 }, "-=0.2")
      .from(
        q("[data-bar]"),
        { scaleX: 0, opacity: 0, transformOrigin: "0% 50%", stagger: 0.06, duration: 0.5 },
        "-=0.2",
      )
      .from("[data-nowline]", { xPercent: -120, opacity: 0, duration: 0.7 }, "-=0.2")
      .to("[data-nowline]", { x: "+=6", duration: 0.15, yoyo: true, repeat: 1 })
      .from(
        "[data-avatar]",
        { y: -34, opacity: 0, scale: 0.6, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.1",
      );
  });

  return (
    <div ref={scope as React.RefObject<HTMLDivElement>} className="w-full">
      <svg
        viewBox="0 0 720 380"
        className="w-full"
        role="img"
        aria-label="A weekly roster assembling: site rows with shift bars on a time axis and a now-line."
      >
        {/* time axis */}
        <line data-axis x1="120" y1="46" x2="700" y2="46" stroke="var(--color-border-hover)" strokeWidth="1" />
        {TICKS.map((t, i) => {
          const x = 120 + (i * 580) / (TICKS.length - 1);
          return (
            <text
              key={t}
              data-tick
              x={x}
              y="34"
              fill="var(--color-dim)"
              fontSize="12"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {t}
            </text>
          );
        })}

        {/* site rows */}
        {ROWS.map((row, ri) => {
          const y = 78 + ri * 66;
          return (
            <g key={row.label} data-row>
              <text
                x="24"
                y={y + 18}
                fill="var(--color-muted)"
                fontSize="14"
                fontFamily="var(--font-mono)"
              >
                {row.label}
              </text>
              <line x1="120" y1={y + 40} x2="700" y2={y + 40} stroke="var(--color-border)" strokeWidth="1" />
              {row.shifts.map(([start, width, filled], si) => {
                const x = 120 + (start / 100) * 580;
                const w = (width / 100) * 580;
                return (
                  <rect
                    key={si}
                    data-bar
                    x={x}
                    y={y}
                    width={w}
                    height="30"
                    rx="8"
                    fill={filled ? "var(--color-accent-violet)" : "transparent"}
                    fillOpacity={filled ? 0.9 : 0}
                    stroke={filled ? "transparent" : "var(--color-border-hover)"}
                    strokeDasharray={filled ? "0" : "4 4"}
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          );
        })}

        {/* now-line */}
        <g data-nowline>
          <line x1="392" y1="52" x2="392" y2="356" stroke="var(--color-accent-orange)" strokeWidth="2" />
          <circle cx="392" cy="52" r="4" fill="var(--color-accent-orange)" />
        </g>

        {/* avatar chip landing into the empty Riverbank slot */}
        <g data-avatar transform="translate(387, 210)">
          <rect x="0" y="0" width="106" height="30" rx="8" fill="var(--color-surface-3)" stroke="var(--color-accent-violet)" strokeWidth="1.5" />
          <circle cx="15" cy="15" r="9" fill="var(--color-accent-violet)" fillOpacity="0.9" />
          <text x="15" y="19" fill="#fff" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
            AK
          </text>
          <text x="32" y="19" fill="var(--color-text)" fontSize="12" fontFamily="var(--font-mono)">
            Assigned
          </text>
        </g>
      </svg>
    </div>
  );
}
