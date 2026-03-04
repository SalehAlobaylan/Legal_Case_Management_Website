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
 * Hook for comparing two regulation versions
 */
export function useCompareRegulationVersions(
  id: number,
  fromVersion?: number,
  toVersion?: number
) {
  return useQuery({
    queryKey: ["regulation-compare", id, fromVersion, toVersion],
    queryFn: () =>
      regulationsApi.compareRegulationVersions(id, fromVersion as number, toVersion as number),
    enabled:
      !!id &&
      Number.isInteger(fromVersion) &&
      Number.isInteger(toVersion) &&
      fromVersion !== toVersion,
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

/**
 * Hook for triggering MOJ source sync (admin)
 */
export function useSyncMojSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: {
      maxPages?: number;
      extractContent?: boolean;
      runInBackground?: boolean;
    }) =>
      regulationsApi.syncMojSource(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
      queryClient.invalidateQueries({ queryKey: ["moj-source-health"] });
    },
  });
}

/**
 * Hook for MOJ source sync health (admin)
 */
export function useMojSourceHealth() {
  return useQuery({
    queryKey: ["moj-source-health"],
    queryFn: () => regulationsApi.getMojSourceHealth(),
  });
}
