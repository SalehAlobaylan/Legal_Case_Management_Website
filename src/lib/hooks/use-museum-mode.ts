"use client";

/*
 * File: src/lib/hooks/use-museum-mode.ts
 * Purpose: Tiny selector hook exposing whether the current session is a
 *          read-only "museum mode" demo. Used by UI to disable mutating
 *          actions (create/edit/delete/AI) and show explanatory tooltips.
 *
 * Note: this is a UX convenience only. Real enforcement happens in two places:
 *   1. The API client request interceptor blocks writes client-side.
 *   2. The backend rejects every write made with a `museum`-flagged JWT.
 */

import { useAuthStore } from "@/lib/store/auth-store";

export function useMuseumMode(): boolean {
  return useAuthStore((state) => state.museum);
}

/**
 * Localized explanation shown in tooltips / toasts when an action is blocked
 * because the visitor is exploring in read-only demo mode.
 */
export function museumLockMessage(isRTL: boolean): string {
  return isRTL
    ? "أنت تتصفّح في الوضع التجريبي (للعرض فقط). أنشئ حسابًا لاستخدام هذه الميزة."
    : "You're exploring in demo mode (read-only). Sign up to use this feature.";
}
