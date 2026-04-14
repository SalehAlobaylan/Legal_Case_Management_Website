"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { automationsApi } from "@/lib/api/automations";

export function useAutomationRules() {
  return useQuery({
    queryKey: ["automation-rules"],
    queryFn: () => automationsApi.listRules(),
  });
}

export function useCreateAutomationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: automationsApi.createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
    },
  });
}

export function useUpdateAutomationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Parameters<typeof automationsApi.updateRule>[1] }) =>
      automationsApi.updateRule(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
    },
  });
}
