/**
 * File: src/components/features/announcements/announcement-banner.tsx
 * Purpose: Shows the highest-priority active org announcement at the top of
 *          every dashboard page. Each user dismisses locally (localStorage).
 *
 * Why localStorage and not a DB table:
 *   - Announcements are short-lived ("Court closed Thursday"). A per-user
 *     dismissal row per announcement bloats the DB for marginal value.
 *   - Trade-off accepted: dismissals don't sync across devices.
 */

"use client";

import * as React from "react";
import { Banner } from "@/components/ui/banner";
import { useActiveAnnouncements } from "@/lib/hooks/use-announcements";
import { useAuthStore } from "@/lib/store/auth-store";

const STORAGE_KEY = "announcement-dismissed";
// Cap the dismissed-ID list to avoid unbounded growth over time.
const MAX_DISMISSED = 100;

function readDismissed(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function writeDismissed(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(ids.slice(-MAX_DISMISSED))
    );
  } catch {
    // Storage full or disabled — silently ignore; user just sees the banner again on next visit.
  }
}

export function AnnouncementBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data } = useActiveAnnouncements(isAuthenticated);
  const [mounted, setMounted] = React.useState(false);
  const [dismissed, setDismissed] = React.useState<number[]>([]);

  React.useEffect(() => {
    setMounted(true);
    setDismissed(readDismissed());
  }, []);

  // SSR-safe: render nothing on the server pass so hydration matches.
  if (!mounted || !isAuthenticated) return null;
  if (!data || data.length === 0) return null;

  const next = data.find((a) => !dismissed.includes(a.id));
  if (!next) return null;

  const onDismiss = () => {
    const updated = [...dismissed, next.id];
    setDismissed(updated);
    writeDismissed(updated);
  };

  return (
    <Banner
      severity={next.severity}
      title={next.title}
      onDismiss={onDismiss}
    >
      {next.body}
    </Banner>
  );
}
