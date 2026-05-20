/*
 * File: src/lib/utils/date-buckets.ts
 * Purpose: Bucket deadlines (e.g. case.nextHearing) into UI-friendly groups
 *          and compute simple day-deltas for display.
 *
 * The buckets match the backend (src/routes/admin/index.ts: bucketHearing):
 *   - "overdue"   — strictly before today
 *   - "thisWeek"  — today .. end of the current calendar week (upcoming Sunday)
 *   - "nextWeek"  — the following week
 *   - "later"     — everything else with a date set
 *   - "none"      — no date / falsy input
 */

export type DeadlineBucket =
  | "overdue"
  | "thisWeek"
  | "nextWeek"
  | "later"
  | "none";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function bucketByDeadline(
  input: Date | string | null | undefined,
  now: Date = new Date()
): DeadlineBucket {
  if (!input) return "none";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "none";

  const today = startOfDay(now);
  const daysToEndOfThisWeek = 7 - today.getDay(); // upcoming Sunday inclusive
  const endOfThisWeek = new Date(today);
  endOfThisWeek.setDate(today.getDate() + daysToEndOfThisWeek);
  endOfThisWeek.setHours(23, 59, 59, 999);

  const endOfNextWeek = new Date(endOfThisWeek);
  endOfNextWeek.setDate(endOfThisWeek.getDate() + 7);

  if (d < today) return "overdue";
  if (d <= endOfThisWeek) return "thisWeek";
  if (d <= endOfNextWeek) return "nextWeek";
  return "later";
}

export function daysUntil(
  input: Date | string,
  now: Date = new Date()
): number {
  const d = typeof input === "string" ? new Date(input) : input;
  const a = startOfDay(d);
  const b = startOfDay(now);
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}
