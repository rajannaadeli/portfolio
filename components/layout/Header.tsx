"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, SITE } from "@/lib/site";
import { useActiveBand } from "@/lib/useActiveBand";

/*
  Floating pill nav (design §5.1). Phase 2: hides on scroll-down past 400px,
  returns on scroll-up; inverts its palette when it overlaps a light band
  (detected via IntersectionObserver on [data-band] wrappers). Mobile collapses
  to a full-screen menu.
*/

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const onLight = useActiveBand() === "light";
  const lastY = useRef(0);

  // Hide on scroll-down past 400px, show on scroll-up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 400 && y > lastY.current) setHidden(true);
      else if (y < lastY.current) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 transition-transform duration-300"
      // style={{ transform: hidden && !open ? "translateY(-140%)" : "translateY(0)" }}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "pointer-events-auto flex items-center gap-1 rounded-pill border p-1.5 pl-5 backdrop-blur-md transition-colors duration-200",
          onLight ? "border-black/10 bg-white/80" : "border-border bg-surface-3/80",
        )}
      >
        <Link
          href="/"
          className={cn(
            "mr-2 font-display text-body font-semibold tracking-tight transition-colors",
            onLight ? "text-[#101014]" : "text-text",
          )}
        >
          RA
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-pill px-3 py-2 font-mono text-meta uppercase transition-colors",
                onLight ? "text-[#5A5A63] hover:text-[#101014]" : "text-muted hover:text-text",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="rounded-pill bg-accent-orange px-4 py-2 font-mono text-meta uppercase text-black transition-colors hover:brightness-110"
          >
            Contact
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-pill sm:hidden",
            onLight ? "text-[#101014]" : "text-text",
          )}
        >
          <span className="font-mono text-meta uppercase">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className={cn(
          "pointer-events-auto fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/95 backdrop-blur-md transition-opacity duration-200 sm:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="font-display text-h2 text-text"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/#contact"
          onClick={() => setOpen(false)}
          className="rounded-pill bg-accent-orange px-6 py-3 font-mono text-meta uppercase text-black"
        >
          Contact
        </Link>
        <a
          href={`mailto:${SITE.email}`}
          className="font-mono text-meta uppercase text-dim"
          onClick={() => setOpen(false)}
        >
          {SITE.email}
        </a>
      </div>
    </header>
  );
}
