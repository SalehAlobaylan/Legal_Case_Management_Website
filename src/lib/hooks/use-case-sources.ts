"use client";

/*
 * File: src/lib/hooks/use-case-sources.ts
 * Purpose: TanStack Query hooks for the multi-source case linking flow
 *          (regulations + judicial decisions + gov data + Tavily web search).
 * Used by: src/components/features/cases/multi-source-suggestions.tsx
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dismissCaseSourceLink,
  findRelatedCaseSources,
  getCaseSources,
  runWebResearch,
  verifyCaseSourceLink,
  type CaseSourcesResponse,
  type FindRelatedRequest,
  type FindRelatedResponse,
  type WebResearchResponse,
} from "@/lib/api/case-sources";

const caseSourcesKey = (caseId: number) => ["case-sources", caseId] as const;

export function useCaseSources(caseId: number, enabled = true) {
  return useQuery<CaseSourcesResponse>({
    queryKey: caseSourcesKey(caseId),
    queryFn: () => getCaseSources(caseId),
    enabled: enabled && Number.isFinite(caseId),
  });
}

/**
 * Run the multi-source AI find-related pipeline. Triggers Tavily search by
 * default, fetches all eligible legal sources, scores them, and persists
 * case_source_links rows.
 */
export function useFindRelatedCaseSources(caseId: number) {
  const qc = useQueryClient();
  return useMutation<FindRelatedResponse, Error, FindRelatedRequest | undefined>({
    mutationFn: (body) => findRelatedCaseSources(caseId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: caseSourcesKey(caseId) });
    },
  });
}

/**
 * On-demand web research only (no AI pipeline).
 * Useful when a lawyer wants to broaden discovery without re-running the
 * full multi-source matcher.
 */
export function useRunWebResearch(caseId: number) {
  const qc = useQueryClient();
  return useMutation<
    WebResearchResponse,
    Error,
    { query?: string; maxResults?: number; searchDepth?: "basic" | "advanced" } | undefined
  >({
    mutationFn: (body) => runWebResearch(caseId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: caseSourcesKey(caseId) });
    },
  });
}

export function useVerifyCaseSourceLink(caseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: number) => verifyCaseSourceLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: caseSourcesKey(caseId) });
    },
  });
}

export function useDismissCaseSourceLink(caseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ linkId, reason }: { linkId: number; reason?: string }) =>
      dismissCaseSourceLink(linkId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: caseSourcesKey(caseId) });
    },
  });
}
