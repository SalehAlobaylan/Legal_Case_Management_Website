/*
 * File: src/lib/hooks/use-case-analysis.ts
 * Purpose: TanStack Query hook for AI case analysis. Wraps the existing
 *          persisted case-analysis endpoints so generated output survives
 *          navigation, refreshes, and TanStack Query cache eviction.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiApi, type CaseAnalysisResponse } from "@/lib/api/ai";

const key = (caseId: number) => ["case-analysis", caseId] as const;

/**
 * Read the persisted analysis state for a case. Generation is still explicit
 * via useGenerateCaseAnalysis so users control expensive LLM calls.
 */
export function useCaseAnalysis(caseId: number) {
  return useQuery<CaseAnalysisResponse>({
    queryKey: key(caseId),
    queryFn: () => aiApi.getCaseAnalysis(caseId),
    enabled: Boolean(caseId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useGenerateCaseAnalysis(caseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input?: { force?: boolean }) =>
      aiApi.analyzeCase(caseId, {
        analysisType: "full",
        force: Boolean(input?.force),
      }),
    onSuccess: (data) => {
      qc.setQueryData<CaseAnalysisResponse>(key(caseId), data);
    },
  });
}
