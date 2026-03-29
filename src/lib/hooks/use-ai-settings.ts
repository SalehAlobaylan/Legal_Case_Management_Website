/*
 * File: src/lib/hooks/use-ai-settings.ts
 * Purpose: React hooks for AI pipeline settings using TanStack Query.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  aiSettingsApi,
  type AISettings,
  type UpdateAISettings,
} from "@/lib/api/ai-settings";

/**
 * Hook to fetch current AI pipeline settings.
 */
export function useAISettings() {
  return useQuery<AISettings>({
    queryKey: ["ai-settings"],
    queryFn: () => aiSettingsApi.getSettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update AI pipeline settings with optimistic update.
 */
export function useUpdateAISettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAISettings) =>
      aiSettingsApi.updateSettings(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: ["ai-settings"],
      });

      const previous = queryClient.getQueryData<AISettings>(["ai-settings"]);

      if (previous) {
        queryClient.setQueryData<AISettings>(["ai-settings"], {
          ...previous,
          ...newData,
        });
      }

      return { previous };
    },
    onError: (_err, _newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["ai-settings"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-settings"],
      });
    },
  });
}
