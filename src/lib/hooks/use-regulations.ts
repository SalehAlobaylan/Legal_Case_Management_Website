/*
 * File: src/lib/hooks/use-regulations.ts
 * Purpose: TanStack Query hooks for regulations data.
 * Used by: Regulations page and components.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { regulationsApi, type RegulationFilters, type SubscribeInput } from "@/lib/api/regulations";

/**
 * Hook for fetching regulations list
 */
export function useRegulations(filters?: RegulationFilters) {
  return useQuery({
    queryKey: ["regulations", filters],
    queryFn: () => regulationsApi.getRegulations(filters),
  });
}

/**
 * Hook for fetching a single regulation
 */
export function useRegulation(id: number) {
  return useQuery({
    queryKey: ["regulation", id],
    queryFn: () => regulationsApi.getRegulationById(id),
    enabled: !!id,
  });
}

/**
 * Hook for fetching regulation version history
 */
export function useRegulationVersions(id: number) {
  return useQuery({
    queryKey: ["regulation-versions", id],
    queryFn: () => regulationsApi.getRegulationVersions(id),
    enabled: !!id,
  });
}

/**
 * Hook for searching regulations
 */
export function useSearchRegulations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ query, topK }: { query: string; topK?: number }) =>
      regulationsApi.searchRegulations(query, topK),
    onSuccess: (data) => {
      // Optionally cache individual regulations from search results
      data.forEach((regulation) => {
        queryClient.setQueryData(["regulation", regulation.id], regulation);
      });
    },
  });
}

/**
 * Hook for subscribing to regulation updates
 */
export function useSubscribeToRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubscribeInput) => regulationsApi.subscribeToRegulation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
    },
  });
}
