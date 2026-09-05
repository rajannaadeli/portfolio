"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";

/** The two Lenis methods this file needs; avoids importing the full type. */
interface LenisInstance {
  resize: () => void;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: { offset?: number; immediate?: boolean },
  ) => void;
}

/*
  SmoothScroll — global Lenis smooth scroll (design §4: lerp 0.09, duration 1.1).

  Uses Lenis's official React adapter (`ReactLenis`) in `root` mode so Lenis
  controls `document.documentElement` directly (no wrapper divs). Key features:

  - `anchors: true` tells Lenis to intercept hash-link clicks (`#about`,
    `#faq`, `#contact`) and smooth-scroll to the target element itself — this
    fixes the inconsistent hash navigation that occurred because Lenis was
    swallowing the native `scrollIntoView` calls Next.js relies on.

  - `autoRaf: true` lets Lenis manage its own rAF loop so we don't have to.

  - `ScrollManager` (child component) listens to `usePathname()` changes and
    calls `lenis.scrollTo(0, { immediate: true })` on every route transition.
    This fixes the stale-scroll-position bug where navigating from e.g.
    /work → /work/[slug] would start the new page at the previous page's
    scroll offset, because Lenis's virtual scroll position persists across
    client-side navigations and prevents Next.js's own scroll-to-top logic
    from working.

  - Cross-page hash links (/work → /#about) need more than a single rAF, and
    that is what `scrollToHash` below exists for. See its comment.

  Entirely disabled under prefers-reduced-motion, and destroyed on unmount.
*/

/*
  Scroll to a hash target after a cross-page navigation.

  Lenis caches the document dimensions it measured for the *previous* page and
  clamps every scrollTo against that stale limit. Arriving at the long home page
  from a short one, `/work` (scrollHeight 3839, max scroll 2939) → `/#about`
  (target 9754) landed at exactly 2939 — the old page's bottom — which read as
  "it scrolled to a random place". `lenis.resize()` re-measures first.

  Even after a resize the target can still move for a frame or two while the new
  route paints, so the offset is sampled until it stops changing before we
  commit. `immediate` matches what a browser does for a cross-document anchor:
  animating 10,000px of home page would be slow and disorienting. Same-page
  anchor clicks are untouched — Lenis's `anchors: true` handles those, smoothly.
*/
function scrollToHash(lenis: LenisInstance, hash: string) {
  const MAX_FRAMES = 60; // ~1s at 60fps, then give up rather than spin
  let frames = 0;
  let lastTop: number | null = null;

  const step = () => {
    if (frames++ > MAX_FRAMES) return;
    let el: Element | null = null;
    try {
      el = document.querySelector(hash);
    } catch {
      return; // not a valid selector (e.g. "#123"); nothing to scroll to
    }
    if (!el) {
      requestAnimationFrame(step);
      return;
    }

    lenis.resize();
    const top = Math.round(el.getBoundingClientRect().top + window.scrollY);
    if (lastTop === null || top !== lastTop) {
      lastTop = top;
      requestAnimationFrame(step);
      return;
    }
    lenis.scrollTo(el as HTMLElement, { offset: 0, immediate: true });
  };

  requestAnimationFrame(step);
}

/** Resets scroll on route change & handles hash-fragment scrolling. */
function ScrollManager() {
  const pathname = usePathname();
  const lenis = useLenis();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!lenis) return;

    const wasFirstRender = isFirstRender.current;
    isFirstRender.current = false;

    // A hash is handled the same way whether it arrived by deep link or by a
    // client-side navigation from another route.
    const hash = window.location.hash;
    if (hash) {
      scrollToHash(lenis, hash);
      return;
    }

    // Plain navigation to a new route starts at the top. The initial render
    // already loads at the right position, so leave it alone.
    if (!wasFirstRender) lenis.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  // Respect the user's motion preference — skip Lenis entirely.
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        duration: 1,
        anchors: true,
        autoRaf: true,
      }}
    >
      <ScrollManager />
      {children}
    </ReactLenis>
  );
}
