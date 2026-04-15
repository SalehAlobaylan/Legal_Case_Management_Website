/*
 * File: src/lib/hooks/use-case-analysis.ts
 * Purpose: TanStack Query hook for AI case analysis. Wraps the existing
 *          POST /api/ai/cases/:id/analyze endpoint exposed by aiApi.analyzeCase
 *          so the result can be cached per case and re-triggered on demand.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiApi, type CaseAnalysisResponse } from "@/lib/api/ai";

const key = (caseId: number) => ["case-analysis", caseId] as const;

/**
 * Read the cached analysis for a case (does not auto-fetch from the server;
 * generation is explicit via useGenerateCaseAnalysis so users are in control
 * of when the expensive LLM call happens).
 */
export function useCaseAnalysis(caseId: number) {
  return useQuery<CaseAnalysisResponse | null>({
    queryKey: key(caseId),
    queryFn: async () => null, // Populated only via the mutation below.
    enabled: Boolean(caseId),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30, // keep for 30 minutes after last use
  });
}

export function useGenerateCaseAnalysis(caseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => aiApi.analyzeCase(caseId, { analysisType: "full" }),
    onSuccess: (data) => {
      qc.setQueryData<CaseAnalysisResponse>(key(caseId), data);
    },
  });
}
