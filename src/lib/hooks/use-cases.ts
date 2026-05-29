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

interface PatchCaseInput {
  id: number;
  updates: Partial<CreateCaseInput>;
}

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

export function usePatchCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: PatchCaseInput) => {
      const { data } = await apiClient.put<{ case: Case }>(
        `/api/cases/${id}`,
        updates
      );
      return data.case;
    },
    onSuccess: (updatedCase) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case", updatedCase.id] });
      toast({ title: "Case updated successfully" });
    },
  });
}

export function useUpdateCase(id: number) {
  const patchCase = usePatchCase();

  return useMutation({
    mutationFn: async (updates: Partial<CreateCaseInput>) => {
      return patchCase.mutateAsync({ id, updates });
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

/**
 * Bulk-reassign cases (pass null to unassign all).
 */
export function useBulkAssignCases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      caseIds: number[];
      assignedLawyerId: string | null;
    }) => {
      const { data } = await apiClient.post<{ updated: Case[] }>(
        "/api/cases/bulk/assign",
        input
      );
      return data.updated;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-command-center"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pulse"] });
      queryClient.invalidateQueries({ queryKey: ["admin-trends"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-log"] });
      toast({
        title: "Cases reassigned",
        description: `${updated.length} case${updated.length === 1 ? "" : "s"} updated.`,
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast({
        title: "Bulk assign failed",
        description:
          error?.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Assign or reassign a case to a lawyer (pass null to unassign).
 */
export function useAssignCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: number; assignedLawyerId: string | null }) => {
      const { data } = await apiClient.patch<{ case: Case }>(
        `/api/cases/${input.id}/assign`,
        { assignedLawyerId: input.assignedLawyerId }
      );
      return data.case;
    },
    onSuccess: (updatedCase) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case", updatedCase.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-command-center"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pulse"] });
      queryClient.invalidateQueries({ queryKey: ["admin-trends"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-log"] });
      toast({ title: "Case assignment updated" });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast({
        title: "Could not update assignment",
        description:
          error?.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
}
