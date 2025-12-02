"use client";

/*
 * File: src/lib/hooks/use-ai-links.ts
 * Purpose: Expose TanStack Query hooks for fetching, generating, and verifying AI-suggested regulation links for a case.
 * Used by: AI suggestions UI components to interact with the AI microservice-backed endpoints through the backend.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { CaseRegulationLink } from "@/lib/types/case";

export function useAILinks(caseId: number) {
  return useQuery({
    queryKey: ["ai-links", caseId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ links: CaseRegulationLink[] }>(
        `/api/ai-links/${caseId}`
      );
      return data.links;
    },
    enabled: !!caseId,
  });
}

export function useGenerateAILinks(caseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ links: CaseRegulationLink[] }>(
        `/api/ai-links/${caseId}/generate`
      );
      return data.links;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-links", caseId] });
    },
  });
}

export function useVerifyLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: number) => {
      await apiClient.post(`/api/ai-links/${linkId}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-links"] });
    },
  });
}
