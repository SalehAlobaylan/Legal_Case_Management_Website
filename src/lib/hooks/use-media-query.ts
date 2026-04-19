/**
 * File: src/lib/hooks/use-media-query.ts
 * Purpose: SSR-safe hook for subscribing to CSS media queries from React,
 *          plus named helpers for the Tailwind breakpoints used throughout
 *          the app.
 *
 * Use in component logic when a responsive decision can't be expressed in
 * Tailwind prefixes alone — e.g. mounting/unmounting a <Sheet> vs an inline
 * desktop panel, switching event handlers, or skipping a scroll-spy on
 * mobile. For simple class swaps, prefer `md:` / `lg:` Tailwind prefixes.
 */

"use client";

import * as React from "react";

/**
 * Subscribe to a CSS media query.
 * SSR-safe: returns `false` on the server (no `window`) and syncs on mount.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      // Safari <14 only supports addListener/removeListener.
      if (mql.addEventListener) {
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
      }
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    },
    [query]
  );

  const getSnapshot = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  // Server snapshot is always false — components should fall back to a
  // desktop-first render on SSR, then re-hydrate. Matches Next.js guidance.
  const getServerSnapshot = React.useCallback(() => false, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * `true` when the viewport is narrower than Tailwind's `md` breakpoint
 * (default: 768px). Use for logic branches that need to render a bottom
 * sheet, hide a desktop sidebar, etc.
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/**
 * `true` at the tablet boundary and below (narrower than Tailwind's `lg`
 * breakpoint, default 1024px). Useful when the split-pane layout only
 * kicks in at `lg:`.
 */
export function useIsBelowLg(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}

/**
 * `true` if the device has no hover affordance (touch-primary). Pair with
 * the `touch-visible` CSS utility for progressive enhancement.
 */
export function useIsTouch(): boolean {
  return useMediaQuery("(hover: none)");
}
