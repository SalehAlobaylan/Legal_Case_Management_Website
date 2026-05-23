/*
 * File: src/lib/hooks/use-ai-health.ts
 * Purpose: Poll the backend `/api/ai/health` endpoint so the UI can show a
 *          friendly "AI assistant is warming up" banner when the local
 *          fallback model is loading, or "running on backup service" when
 *          the primary hosted endpoint is degraded.
 *
 *          The endpoint is cheap (cached server-side for 5s) and the polling
 *          cadence here adapts: every 5s while warming up so the banner
 *          clears as soon as the model is ready, and every 60s otherwise.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface AIHealthState {
  ready: boolean;
  warmingUp: boolean;
  fallbackActive: boolean;
  /** Pre-formatted, non-technical message safe to drop into a banner. */
  message: string | null;
}

export function useAIHealth(options?: { enabled?: boolean }) {
  return useQuery<AIHealthState>({
    queryKey: ["ai-health"],
    queryFn: async () => {
      const response = await apiClient.get<AIHealthState>(endpoints.ai.health);
      return response.data;
    },
    enabled: options?.enabled ?? true,
    // Adaptive polling — fast while warming up so the user sees the banner
    // clear as soon as the assistant is ready; slow otherwise.
    refetchInterval: (query) =>
      query.state.data?.warmingUp ? 5_000 : 60_000,
    refetchOnWindowFocus: true,
    // Network hiccups shouldn't trigger noisy retries for a status check.
    retry: 1,
    staleTime: 4_000,
  });
}
