"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Section, Container } from "@/components/ui/layout";
import { Heading } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

/*
  WorkBento (Part B) — the /work index as an immersive 12-column bento. Tile
  shape follows image shape (wide tiles for desktop shots, tall for phone), light
  screenshots sit on inset paper panels inside the dark tiles, and a mono filter
  row narrows by category with the choice reflected in the URL query.
*/

export interface Tile {
  slug: string;
  name: string;
  lede: string;
  category: string;
  accentVar: string;
  accentTextVar: string;
  order: number;
  meta: string;
  live?: string;
  paper: boolean;
  span: string;
  ratio: string;
  thumb: { avif: string; webp: string; width: number; height: number; alt: string; blur: string | null };
}

const FILTERS = ["ALL", "WORKFORCE", "DOCUMENTS", "SCHEDULING", "RETAIL"];

export function WorkBento({ tiles }: { tiles: Tile[] }) {
  // SSR renders "ALL" (every tile) so the grid is in the static HTML — no CLS.
  // The URL query is read after mount and kept in sync via history (no Suspense,
  // no navigation hooks that would deopt SSR).
  const [active, setActive] = useState("ALL");

  // Read the URL filter after mount so SSR stays "ALL" (no CLS, no Suspense).
  useEffect(() => {
    const f = (new URLSearchParams(window.location.search).get("filter") ?? "ALL").toUpperCase();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (FILTERS.includes(f)) setActive(f);
  }, []);

  const choose = (f: string) => {
    setActive(f);
    const q = new URLSearchParams(window.location.search);
    if (f === "ALL") q.delete("filter");
    else q.set("filter", f.toLowerCase());
    const qs = q.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };

  return (
    <>
      {/* filter row */}
      <div className="mt-10 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => choose(f)}
            aria-pressed={active === f}
            className={cn(
              "rounded-pill border px-4 py-2 font-mono text-meta uppercase tracking-[0.08em] transition-colors",
              active === f
                ? "border-text bg-surface-2 text-text"
                : "border-border text-dim hover:text-muted",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* bento */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
        {tiles.map((t) => {
          const show = active === "ALL" || t.category === active;
          return (
            <Link
              key={t.slug}
              href={`/work/${t.slug}`}
              data-show={show}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface-1 transition-all duration-300",
                "hover:border-(--accent) md:col-span-1",
                t.span,
                !show && "pointer-events-none absolute -z-10 scale-95 opacity-0",
              )}
              style={{ "--accent": t.accentVar, "--accent-text": t.accentTextVar } as React.CSSProperties}
              hidden={!show}
            >
              {/* media */}
              <div className="relative overflow-hidden p-5" style={{ aspectRatio: t.ratio }}>
                <div
                  className={cn(
                    "h-full w-full overflow-hidden rounded-media",
                    t.paper ? "bg-[#f7f6f3] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)]" : "border border-border",
                  )}
                >
                  <div className="h-full w-full overflow-hidden rounded-[10px]">
                    <picture>
                      <source srcSet={t.thumb.avif} type="image/avif" />
                      <source srcSet={t.thumb.webp} type="image/webp" />
                      <img
                        src={t.thumb.webp}
                        alt={t.thumb.alt}
                        width={t.thumb.width}
                        height={t.thumb.height}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full rounded-md object-cover transition-transform duration-300 scale-[0.98] group-hover:scale-[0.96]"
                        style={t.thumb.blur ? { backgroundImage: `url(${t.thumb.blur})`, backgroundSize: "cover" } : undefined}
                      />
                    </picture>
                  </div>
                </div>
                {/* index numeral */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-6 top-3 font-display text-[64px] leading-none text-(--accent) opacity-[0.14]"
                >
                  {String(t.order + 1).padStart(2, "0")}
                </span>
                {t.live ? (
                  <span className="absolute left-8 top-8 inline-flex items-center gap-2 rounded-pill bg-black/70 px-3 py-1 font-mono text-meta uppercase text-text backdrop-blur">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-accent-lime opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-pill bg-accent-lime" />
                    </span>
                    Live
                  </span>
                ) : null}
              </div>

              {/* content */}
              <div className="flex flex-1 flex-col gap-3 p-6 pt-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-h3 text-text">{t.name}</h2>
                  <span className="font-mono text-body text-dim transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <p className="line-clamp-2 font-body text-body text-muted">{t.lede}</p>
                <div className="mt-auto font-mono text-meta uppercase text-dim">{t.meta}</div>
                {/* py-2 on both children below lifts the tap target past the
                    24px WCAG 2.2 minimum without changing the visual rhythm. */}
                {t.live ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(t.live, "_blank", "noopener");
                      }}
                      className="inline-block py-2 font-mono text-meta uppercase text-text underline decoration-(--accent) decoration-2 underline-offset-4"
                    >
                      Open the {t.name} demo ↗
                    </button>
                    <span className="py-2 font-mono text-meta uppercase text-dim">
                      Read the {t.name} case →
                    </span>
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      {/* closing CTA band */}
      <div data-band="dark" className="band-edge mt-24">
        <Section fullBleed>
          <Container>
            <Heading variant="display" as="h2" className="max-w-[18ch]">
              Your team&rsquo;s problem is probably one of these.
            </Heading>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={SITE.links.rosterbay} external>
                Open the live demo ↗
              </Button>
              <Button href={SITE.links.upwork} external variant="secondary">
                Hire me on Upwork ↗
              </Button>
            </div>
          </Container>
        </Section>
      </div>
    </>
  );
}
