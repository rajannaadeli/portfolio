"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, SITE } from "@/lib/site";

/*
  Floating pill nav (design §5.1) — top-center, surface-3 at 80% + blur, radius
  999, with the orange Contact pill inside. Static this phase: no hide-on-scroll
  (Phase 2). Mobile collapses to a full-screen menu.
*/

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex items-center gap-1 rounded-pill border border-border bg-surface-3/80 p-1.5 pl-5 backdrop-blur-md"
      >
        <Link
          href="/"
          className="mr-2 font-display text-body font-semibold tracking-tight text-text"
        >
          RA
        </Link>

        {/* Desktop items */}
        <div className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-pill px-3 py-2 font-mono text-meta uppercase text-muted transition-colors hover:text-text"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="rounded-pill bg-accent-orange px-4 py-2 font-mono text-meta uppercase text-black transition-colors hover:bg-[color:var(--color-accent-orange)]/90"
          >
            Contact
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-pill text-text sm:hidden"
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
