"use client";
"use client";

/*
 * File: src/lib/hooks/use-cases.ts
 * Purpose: Provide TanStack Query hooks for listing, reading, creating, updating, and deleting cases via the backend API.
 * Used by: Case-related pages and components (lists, detail views, forms, dashboard stats) to load and mutate case data.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Case, CreateCaseInput } from "@/lib/types/case";
import { toast } from "@/components/ui/use-toast";

export function useCases() {
  return useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ cases: Case[] }>("/api/cases");
      return data.cases;
    },
  });
}

export function useCase(id: number) {
  return useQuery({
    queryKey: ["case", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ case: Case }>(`/api/cases/${id}`);
      return data.case;
    },
    enabled: !!id,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCaseInput) => {
      const { data } = await apiClient.post<{ case: Case }>(
        "/api/cases",
        input
      );
      return data.case;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast({
        title: "Success",
        description: "Case created successfully",
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to create case",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCase(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<CreateCaseInput>) => {
      const { data } = await apiClient.put<{ case: Case }>(
        `/api/cases/${id}`,
        updates
      );
      return data.case;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case", id] });
      toast({ title: "Case updated successfully" });
    },
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/cases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast({ title: "Case deleted successfully" });
    },
  });
}
