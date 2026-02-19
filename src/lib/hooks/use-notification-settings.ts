/*
 * File: src/lib/hooks/use-notification-settings.ts
 * Purpose: React hooks for notification preferences using TanStack Query.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationSettingsApi,
  type NotificationPreferences,
  type UpdateNotificationPreferences,
} from "@/lib/api/notification-settings";

/**
 * Hook to fetch current notification preferences
 */
export function useNotificationSettings() {
  return useQuery<NotificationPreferences>({
    queryKey: ["notification-settings"],
    queryFn: () => notificationSettingsApi.getPreferences(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update notification preferences with optimistic update
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferences) =>
      notificationSettingsApi.updatePreferences(data),
    onMutate: async (newData) => {
      // Cancel outgoing fetches
      await queryClient.cancelQueries({
        queryKey: ["notification-settings"],
      });

      // Snapshot previous value
      const previous = queryClient.getQueryData<NotificationPreferences>([
        "notification-settings",
      ]);

      // Optimistically update
      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(
          ["notification-settings"],
          { ...previous, ...newData }
        );
      }

      return { previous };
    },
    onError: (_err, _newData, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          ["notification-settings"],
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["notification-settings"],
      });
    },
  });
}
