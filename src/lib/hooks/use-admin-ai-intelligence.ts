"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminAIIntelligenceSummary } from "@/lib/api/admin";
import { toast } from "@/components/ui/use-toast";

const KEY = ["admin-ai-intelligence"];

export function useAdminAIIntelligence(enabled = true) {
  return useQuery<AdminAIIntelligenceSummary>({
    queryKey: KEY,
    queryFn: () => adminApi.getAIIntelligence(),
    enabled,
    staleTime: 30_000,
  });
}

export function useRefreshAdminAIIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.refreshAIIntelligence(),
    onSuccess: (data) => {
      qc.setQueryData(KEY, data);
      qc.invalidateQueries({ queryKey: ["admin-audit-log"] });
      toast({ title: "AI intelligence refreshed" });
    },
    onError: () => {
      toast({ title: "Could not refresh AI intelligence", variant: "destructive" });
    },
  });
}

export function useRefreshAdminAICaseProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (caseId: number) => adminApi.refreshAICaseProfile(caseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast({ title: "Case profile refreshed" });
    },
    onError: () => {
      toast({ title: "Could not refresh case profile", variant: "destructive" });
    },
  });
}

export function useRunAdminAIEvaluation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input?: { topK?: number; caseIds?: number[] }) =>
      adminApi.runAIEvaluation(input ?? {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["admin-audit-log"] });
      toast({ title: "Evaluation run completed" });
    },
    onError: () => {
      toast({ title: "Could not run evaluation", variant: "destructive" });
    },
  });
}
