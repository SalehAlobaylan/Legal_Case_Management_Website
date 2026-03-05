/*
 * File: src/lib/hooks/use-regulations.ts
 * Purpose: TanStack Query hooks for regulations data.
 * Used by: Regulations page and components.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { regulationsApi, type RegulationFilters, type SubscribeInput } from "@/lib/api/regulations";
import type {
  RegulationAmendmentImpact,
  RegulationInsights,
} from "@/lib/types/regulation";

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
 * Hook for fetching latest regulation AI insights
 */
export function useRegulationInsights(id: number) {
  return useQuery({
    queryKey: ["regulation-insights", id],
    queryFn: () => regulationsApi.getRegulationInsights(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const state = query.state.data as RegulationInsights | undefined;
      if (!state) {
        return 10000;
      }
      return state.status === "pending" || state.status === "processing"
        ? 10000
        : false;
    },
  });
}

/**
 * Hook for forcing latest regulation AI insights regeneration
 */
export function useRefreshRegulationInsights(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: { force?: boolean }) =>
      regulationsApi.refreshRegulationInsights(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(["regulation-insights", id], data);
      queryClient.invalidateQueries({ queryKey: ["regulation-insights", id] });
    },
  });
}

/**
 * Hook for fetching regulation amendment impact analysis
 */
export function useRegulationAmendmentImpact(
  id: number,
  fromVersion?: number,
  toVersion?: number
) {
  return useQuery({
    queryKey: ["regulation-amendment-impact", id, fromVersion, toVersion],
    queryFn: () =>
      regulationsApi.getRegulationAmendmentImpact(
        id,
        fromVersion as number,
        toVersion as number
      ),
    enabled:
      !!id &&
      Number.isInteger(fromVersion) &&
      Number.isInteger(toVersion) &&
      fromVersion !== toVersion,
    refetchInterval: (query) => {
      const state = query.state.data as RegulationAmendmentImpact | undefined;
      if (!state) {
        return 10000;
      }
      return state.status === "pending" || state.status === "processing"
        ? 10000
        : false;
    },
  });
}

/**
 * Hook for forcing amendment impact regeneration for selected versions
 */
export function useRefreshRegulationAmendmentImpact(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { fromVersion: number; toVersion: number; force?: boolean }) =>
      regulationsApi.refreshRegulationAmendmentImpact(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(
        [
          "regulation-amendment-impact",
          id,
          data.fromVersion,
          data.toVersion,
        ],
        data
      );
      queryClient.invalidateQueries({
        queryKey: ["regulation-amendment-impact", id, data.fromVersion, data.toVersion],
      });
    },
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
