/*
 * File: src/lib/utils/cn.ts
 * Purpose: Small className helper used across layout and UI components.
 * Notes:
 *  - Intentionally dependency-free (no clsx/tailwind-merge) to keep the bundle light.
 *  - Accepts a mix of strings/booleans/undefined and joins all truthy values.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cn(...values: any[]) {
  return values.filter(Boolean).join(" ");
}


