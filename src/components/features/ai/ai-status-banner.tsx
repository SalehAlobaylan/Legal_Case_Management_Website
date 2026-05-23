/**
 * File: src/components/features/ai/ai-status-banner.tsx
 * Purpose: Small inline note shown ONLY beside a failed AI request.
 *
 * NOT a global banner — this is a lightweight hint that individual AI
 * feature components render next to their error state to explain *why*
 * the request failed (e.g. backup model still loading). It renders
 * nothing when the AI service is healthy.
 *
 * Usage:
 *   {requestFailed && <AIFailureHint />}
 */

"use client";

import { AlertCircle, Clock } from "lucide-react";
import { useAIHealth } from "@/lib/hooks/use-ai-health";

export interface AIFailureHintProps {
  className?: string;
}

/**
 * Tiny inline note — renders a single line explaining why an AI request
 * may have failed. Shows nothing when the service is healthy.
 */
export function AIFailureHint({ className }: AIFailureHintProps) {
  const { data } = useAIHealth({ enabled: true });

  if (!data) return null;
  if (data.ready && !data.fallbackActive && !data.warmingUp) return null;

  const message = data.warmingUp
    ? "AI assistant is starting up — please retry in a moment."
    : "Running on backup service — request may be slower than usual.";

  const Icon = data.warmingUp ? Clock : AlertCircle;

  return (
    <p className={`flex items-center gap-1.5 text-xs text-slate-500 ${className ?? ""}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

/* Keep the old name as an alias so existing imports don't break during
   migration, but it now renders nothing (the global banner is gone). */
export function AIStatusBanner() {
  return null;
}
