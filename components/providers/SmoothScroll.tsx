"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";

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

  Entirely disabled under prefers-reduced-motion, and destroyed on unmount.
*/

/** Resets scroll on route change & handles hash-fragment scrolling. */
function ScrollManager() {
  const pathname = usePathname();
  const lenis = useLenis();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!lenis) return;

    // Skip scroll-to-top on the initial render (the page already loads at
    // the correct position). Only act on subsequent client-side navigations.
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // But still handle an initial hash (e.g. direct link to /#about).
      const hash = window.location.hash;
      if (hash) {
        // Give the DOM a tick to settle after hydration before scrolling.
        requestAnimationFrame(() => {
          lenis.scrollTo(hash, { offset: 0 });
        });
      }
      return;
    }

    // Route changed — check if the new URL has a hash fragment.
    const hash = window.location.hash;
    if (hash) {
      // Hash navigation (e.g. /#about, /#faq): scroll to the target element.
      // Use requestAnimationFrame to ensure the DOM has been updated first.
      requestAnimationFrame(() => {
        lenis.scrollTo(hash, { offset: 0 });
      });
    } else {
      // Normal page navigation: immediately reset to top.
      lenis.scrollTo(0, { immediate: true });
    }
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
