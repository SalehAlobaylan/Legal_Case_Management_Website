/**
 * File: src/components/features/ai/ai-status-banner.tsx
 * Purpose: Friendly inline status banner for AI-powered pages.
 *
 * Renders nothing when the AI assistant is healthy (ready === true and no
 * fallback active). Surfaces a non-technical message in two cases:
 *
 *  1. warmingUp — the backup model is loading after the primary service
 *     became unavailable. First request after this will take ~1 minute,
 *     subsequent ones are fast. We use an `info` banner.
 *
 *  2. fallbackActive (but ready) — requests are being served by the backup
 *     model. Things still work; latency is slightly higher. We use a
 *     `warning` banner.
 *
 * Drop this component into any page that exposes AI features (regulation
 * insights, document insights, chat, case analysis, ai-links). It is
 * intentionally lightweight — one tiny query polling at most every 5s.
 */

"use client";

import { Banner } from "@/components/ui/banner";
import { useAIHealth } from "@/lib/hooks/use-ai-health";

export interface AIStatusBannerProps {
  /** If false, the banner is mounted but no polling happens. */
  enabled?: boolean;
  className?: string;
}

export function AIStatusBanner({ enabled = true, className }: AIStatusBannerProps) {
  const { data } = useAIHealth({ enabled });

  if (!data) return null;
  if (data.ready && !data.fallbackActive) return null;

  const severity = data.warmingUp ? "info" : "warning";
  const title = data.warmingUp
    ? "AI assistant is warming up"
    : "AI assistant is on the backup service";

  return (
    <Banner severity={severity} title={title} className={className}>
      {data.message ?? "Your request will work — it may take a moment longer than usual."}
    </Banner>
  );
}
