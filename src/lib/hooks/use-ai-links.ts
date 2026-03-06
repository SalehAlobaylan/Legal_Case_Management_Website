"use client";

/*
 * File: src/lib/hooks/use-ai-links.ts
 * Purpose: Expose TanStack Query hooks for fetching, generating, and verifying AI-suggested regulation links for a case.
 * Used by: AI suggestions UI components to interact with the AI microservice-backed endpoints through the backend.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { AILinkGenerationMeta, CaseRegulationLink } from "@/lib/types/case";

export interface BulkSubscribeResponse {
  created: number;
  alreadySubscribed: number;
  failed: Array<{
    regulationId: number;
    reason: string;
  }>;
}

export interface GenerateAILinksResponse {
  links: CaseRegulationLink[];
  generationMeta?: AILinkGenerationMeta;
}

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
      const { data } = await apiClient.post<GenerateAILinksResponse>(
        `/api/ai-links/${caseId}/generate`,
        {},
        { timeout: 300000 } // 5 minutes - AI linking can take ~2min with embeddings
      );
      return data;
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
      const response = await apiClient.post(`/api/ai-links/${linkId}/verify`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-links"] });
    },
    onError: (error) => {
      console.error("Failed to verify link:", error);
    },
  });
}

export function useDismissLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: number) => {
      const response = await apiClient.delete(`/api/ai-links/${linkId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-links"] });
      queryClient.refetchQueries({ queryKey: ["ai-links"] });
    },
    onError: (error) => {
      console.error("Failed to dismiss link:", error);
    },
  });
}

export function useBulkSubscribeRegulations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { caseId: number; regulationIds: number[] }) => {
      const { data } = await apiClient.post<BulkSubscribeResponse>(
        "/api/regulations/subscriptions/bulk",
        input
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai-links", variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ["ai-links"] });
      queryClient.invalidateQueries({ queryKey: ["regulation-subscriptions"] });
    },
  });
}
