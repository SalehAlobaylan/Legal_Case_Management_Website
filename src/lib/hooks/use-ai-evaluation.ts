"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiEvaluationApi } from "@/lib/api/ai-evaluation";

export function useAIEvaluationLabels(enabled = true) {
  return useQuery({
    queryKey: ["ai-eval", "labels"],
    queryFn: () => aiEvaluationApi.listLabels(),
    enabled,
  });
}

export function useCreateAIEvaluationLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { caseId: number; regulationId: number }) =>
      aiEvaluationApi.createLabel(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-eval", "labels"] });
      queryClient.invalidateQueries({ queryKey: ["ai-eval", "runs"] });
    },
  });
}

export function useDeleteAIEvaluationLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => aiEvaluationApi.deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-eval", "labels"] });
      queryClient.invalidateQueries({ queryKey: ["ai-eval", "runs"] });
    },
  });
}

export function useRunAIEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: { caseIds?: number[]; topK?: number }) =>
      aiEvaluationApi.run(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-eval", "runs"] });
      queryClient.invalidateQueries({ queryKey: ["ai-eval", "labels"] });
    },
  });
}

export function useAIEvaluationRuns(enabled = true) {
  return useQuery({
    queryKey: ["ai-eval", "runs"],
    queryFn: () => aiEvaluationApi.listRuns(),
    enabled,
  });
}

export function useAIEvaluationRunDetails(runId?: number, enabled = true) {
  return useQuery({
    queryKey: ["ai-eval", "runs", runId],
    queryFn: () => aiEvaluationApi.getRun(runId as number),
    enabled: enabled && Boolean(runId),
  });
}

export function useAIEvaluationCaseSummary(caseId?: number, enabled = true) {
  return useQuery({
    queryKey: ["ai-eval", "case-summary", caseId],
    queryFn: () => aiEvaluationApi.getCaseSummary(caseId as number),
    enabled: enabled && Boolean(caseId),
  });
}
