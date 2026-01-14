/*
 * File: src/lib/hooks/use-alerts.ts
 * Purpose: TanStack Query hooks for alerts/notifications.
 * Used by: Header alerts dropdown and alerts page.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "@/lib/api/alerts";

/**
 * Hook for fetching alerts
 */
export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => alertsApi.getAlerts(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook for marking a single alert as read
 */
export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: number) => alertsApi.markAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

/**
 * Hook for marking all alerts as read
 */
export function useMarkAllAlertsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => alertsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
