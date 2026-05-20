/**
 * Tests for date-buckets util. Anchors all assertions to a fixed `now` to keep
 * the suite deterministic across CI runs.
 */

import { bucketByDeadline, daysUntil } from "../date-buckets";

// Anchor: Wednesday 2026-06-17 12:00:00 local time.
//   - Sunday-anchored week ends on Sunday 2026-06-21 23:59:59
//   - Next-week end:           Sunday 2026-06-28 23:59:59
const NOW = new Date(2026, 5, 17, 12, 0, 0); // month is 0-indexed (5 = June)

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

describe("bucketByDeadline", () => {
  it("returns 'none' for null/undefined/empty", () => {
    expect(bucketByDeadline(null, NOW)).toBe("none");
    expect(bucketByDeadline(undefined, NOW)).toBe("none");
    expect(bucketByDeadline("", NOW)).toBe("none");
  });

  it("returns 'none' for invalid strings", () => {
    expect(bucketByDeadline("not-a-date", NOW)).toBe("none");
  });

  it("returns 'overdue' for dates strictly before today", () => {
    expect(bucketByDeadline(addDays(NOW, -1), NOW)).toBe("overdue");
    expect(bucketByDeadline(addDays(NOW, -10), NOW)).toBe("overdue");
  });

  it("returns 'thisWeek' for today and the rest of the current week", () => {
    expect(bucketByDeadline(NOW, NOW)).toBe("thisWeek");
    // NOW is Wednesday; +3 days = Saturday — still this week.
    expect(bucketByDeadline(addDays(NOW, 3), NOW)).toBe("thisWeek");
    // +4 days = upcoming Sunday — the week boundary (inclusive).
    expect(bucketByDeadline(addDays(NOW, 4), NOW)).toBe("thisWeek");
  });

  it("returns 'nextWeek' for the following 7 days after the week boundary", () => {
    // +5 days from Wednesday = Monday next week.
    expect(bucketByDeadline(addDays(NOW, 5), NOW)).toBe("nextWeek");
    // +11 days = following Sunday (last day of next week).
    expect(bucketByDeadline(addDays(NOW, 11), NOW)).toBe("nextWeek");
  });

  it("returns 'later' for dates beyond next week", () => {
    expect(bucketByDeadline(addDays(NOW, 12), NOW)).toBe("later");
    expect(bucketByDeadline(addDays(NOW, 60), NOW)).toBe("later");
  });

  it("accepts ISO string input", () => {
    const yesterday = addDays(NOW, -1).toISOString();
    expect(bucketByDeadline(yesterday, NOW)).toBe("overdue");
  });
});

describe("daysUntil", () => {
  it("returns 0 for today", () => {
    expect(daysUntil(NOW, NOW)).toBe(0);
  });

  it("returns positive for future dates", () => {
    expect(daysUntil(addDays(NOW, 1), NOW)).toBe(1);
    expect(daysUntil(addDays(NOW, 14), NOW)).toBe(14);
  });

  it("returns negative for past dates", () => {
    expect(daysUntil(addDays(NOW, -1), NOW)).toBe(-1);
    expect(daysUntil(addDays(NOW, -30), NOW)).toBe(-30);
  });

  it("ignores the time-of-day component (uses start-of-day)", () => {
    // Same calendar day as NOW, but 23:59 — still 0 days away.
    const sameDayEvening = new Date(2026, 5, 17, 23, 59, 0);
    expect(daysUntil(sameDayEvening, NOW)).toBe(0);
  });
});
