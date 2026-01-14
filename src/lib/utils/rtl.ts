/*
 * File: src/lib/utils/rtl.ts
 * Purpose: Helper functions for RTL (Right-to-Left) layout support.
 * Used by: Components and layouts that need direction-aware styling.
 */

type Locale = "ar" | "en";
type Direction = "ltr" | "rtl";

/**
 * Check if a locale uses RTL direction
 */
export function isRTL(locale: string): boolean {
  return locale === "ar";
}

/**
 * Get the text direction for a locale
 */
export function getDirection(locale: string): Direction {
  return isRTL(locale) ? "rtl" : "ltr";
}

/**
 * Return the appropriate class based on locale direction
 */
export function rtlClass(locale: string, ltrClass: string, rtlClass: string): string {
  return isRTL(locale) ? rtlClass : ltrClass;
}

/**
 * Get the opposite direction (for layout calculations)
 */
export function oppositeDirection(direction: Direction): Direction {
  return direction === "ltr" ? "rtl" : "ltr";
}

/**
 * CSS logical properties helpers for inline styles
 */
export const logical = {
  marginStart: (value: string) => ({ marginInlineStart: value }),
  marginEnd: (value: string) => ({ marginInlineEnd: value }),
  paddingStart: (value: string) => ({ paddingInlineStart: value }),
  paddingEnd: (value: string) => ({ paddingInlineEnd: value }),
  borderStart: (value: string) => ({ borderInlineStart: value }),
  borderEnd: (value: string) => ({ borderInlineEnd: value }),
  start: (value: string) => ({ insetInlineStart: value }),
  end: (value: string) => ({ insetInlineEnd: value }),
  textAlign: (locale: string) => ({ textAlign: isRTL(locale) ? "right" : "left" } as const),
};

/**
 * Flip an icon based on locale (for chevrons, arrows, etc.)
 */
export function shouldFlipIcon(locale: string): boolean {
  return isRTL(locale);
}

/**
 * Get Tailwind RTL-aware classes
 */
export function rtlTailwind(locale: string) {
  const isRtl = isRTL(locale);
  return {
    textStart: "text-start",
    textEnd: "text-end",
    msAuto: isRtl ? "me-auto" : "ms-auto",
    meAuto: isRtl ? "ms-auto" : "me-auto",
    borderStart: "border-s",
    borderEnd: "border-e",
    roundedStart: isRtl ? "rounded-e" : "rounded-s",
    roundedEnd: isRtl ? "rounded-s" : "rounded-e",
    flip: isRtl ? "rtl:rotate-180" : "",
  };
}
