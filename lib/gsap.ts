"use client";

import { useEffect, useRef } from "react";

/*
  GSAP infrastructure — wired for Phase 2/3, inert in Phase 1.

  GSAP + ScrollTrigger are dynamically imported (client-only, code-split) so they
  never appear in the initial route JS of a statically rendered page. A global
  reduced-motion guard makes every animation registered through `useGsap` a
  no-op when the user prefers reduced motion.

  Nothing in Phase 1 calls useGsap with real tweens; this exists so Phase 2 can
  drop in reveals, count-ups, and pinning without touching bundle wiring.
*/

export type GsapModule = typeof import("gsap")["gsap"];

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

let loaded: Promise<{ gsap: GsapModule }> | null = null;

/** Lazily load GSAP + ScrollTrigger, registering the plugin once. */
export function loadGsap(): Promise<{ gsap: GsapModule }> {
  if (!loaded) {
    loaded = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        return { gsap };
      },
    );
  }
  return loaded;
}

/**
 * useGSAP-style hook. Runs `setup` inside a scoped gsap.context on mount and
 * reverts it on unmount. No-ops entirely under prefers-reduced-motion — the
 * global guard the design direction requires.
 */
export function useGsap(
  setup: (ctx: { gsap: GsapModule; scope: HTMLElement | null }) => void,
  deps: React.DependencyList = [],
) {
  const scopeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return; // guard: every animation collapses to static
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => setup({ gsap, scope: scopeRef.current }), scopeRef.current ?? undefined);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
