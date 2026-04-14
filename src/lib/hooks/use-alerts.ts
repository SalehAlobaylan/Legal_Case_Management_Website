/*
 * File: src/lib/hooks/use-alerts.ts
 * Purpose: TanStack Query hooks for alerts/notifications.
 * Used by: Header alerts dropdown and alerts page.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "@/lib/api/alerts";
import type { AlertsResponse } from "@/lib/api/alerts";

type AlertsQueryData = AlertsResponse | undefined;

function updateUnreadCount(queryClient: ReturnType<typeof useQueryClient>, delta: number) {
  queryClient.setQueriesData<number>({ queryKey: ["alerts-unread-count"] }, (current) => {
    const value = typeof current === "number" ? current : 0;
    return Math.max(0, value + delta);
  });
}

/**
 * Hook for fetching alerts
 */
export function useAlerts(params?: { unreadOnly?: boolean; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["alerts", params ?? {}],
    queryFn: () => alertsApi.getAlerts(params),
    retry: 1,
    refetchInterval: (query) => (query.state.error ? false : 30000),
  });
}

/**
 * Hook for fetching unread alerts count only
 */
export function useUnreadAlertsCount() {
  return useQuery({
    queryKey: ["alerts-unread-count"],
    queryFn: () => alertsApi.getUnreadCount(),
    retry: 1,
    refetchInterval: (query) => (query.state.error ? false : 30000),
  });
}

/**
 * Hook for marking a single alert as read
 */
export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: number) => alertsApi.markAsRead(alertId),
    onMutate: async (alertId: number) => {
      await queryClient.cancelQueries({ queryKey: ["alerts"] });
      await queryClient.cancelQueries({ queryKey: ["alerts-unread-count"] });

      const snapshots = queryClient.getQueriesData<AlertsQueryData>({ queryKey: ["alerts"] });
      let changedUnread = 0;

      queryClient.setQueriesData<AlertsQueryData>({ queryKey: ["alerts"] }, (current) => {
        if (!current) return current;
        const nextAlerts = current.alerts.map((alert) => {
          if (alert.id === alertId && !alert.isRead) {
            changedUnread += 1;
            return { ...alert, isRead: true };
          }
          return alert;
        });

        return {
          ...current,
          alerts: nextAlerts,
          unreadCount: Math.max(0, current.unreadCount - changedUnread),
        };
      });

      if (changedUnread > 0) {
        updateUnreadCount(queryClient, -changedUnread);
      }

      return { snapshots };
    },
    onError: (_error, _alertId, context) => {
      if (!context?.snapshots) return;
      for (const [key, data] of context.snapshots) {
        queryClient.setQueryData(key, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-unread-count"] });
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["alerts"] });
      await queryClient.cancelQueries({ queryKey: ["alerts-unread-count"] });

      const snapshots = queryClient.getQueriesData<AlertsQueryData>({ queryKey: ["alerts"] });

      queryClient.setQueriesData<AlertsQueryData>({ queryKey: ["alerts"] }, (current) => {
        if (!current) return current;
        return {
          ...current,
          alerts: current.alerts.map((alert) => ({ ...alert, isRead: true })),
          unreadCount: 0,
        };
      });
      queryClient.setQueriesData<number>({ queryKey: ["alerts-unread-count"] }, () => 0);

      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      if (!context?.snapshots) return;
      for (const [key, data] of context.snapshots) {
        queryClient.setQueryData(key, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-unread-count"] });
    },
  });
}

/**
 * Hook for deleting a single alert
 */
export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: number) => alertsApi.deleteAlert(alertId),
    onMutate: async (alertId: number) => {
      await queryClient.cancelQueries({ queryKey: ["alerts"] });
      await queryClient.cancelQueries({ queryKey: ["alerts-unread-count"] });

      const snapshots = queryClient.getQueriesData<AlertsQueryData>({ queryKey: ["alerts"] });
      let unreadDelta = 0;

      queryClient.setQueriesData<AlertsQueryData>({ queryKey: ["alerts"] }, (current) => {
        if (!current) return current;
        const toDelete = current.alerts.find((a) => a.id === alertId);
        if (toDelete && !toDelete.isRead) unreadDelta += 1;
        const nextAlerts = current.alerts.filter((alert) => alert.id !== alertId);
        return {
          ...current,
          alerts: nextAlerts,
          unreadCount: Math.max(0, current.unreadCount - (toDelete && !toDelete.isRead ? 1 : 0)),
        };
      });

      if (unreadDelta > 0) {
        updateUnreadCount(queryClient, -unreadDelta);
      }

      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      if (!context?.snapshots) return;
      for (const [key, data] of context.snapshots) {
        queryClient.setQueryData(key, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-unread-count"] });
    },
  });
}

/**
 * Hook for clearing read alerts
 */
export function useClearReadAlerts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const pageSize = 100;
      let offset = 0;
      let deletedCount = 0;

      while (true) {
        const page = await alertsApi.getAlerts({ limit: pageSize, offset });
        if (!page.alerts.length) break;

        const readIds = page.alerts.filter((a) => a.isRead).map((a) => a.id);
        if (readIds.length) {
          await Promise.all(readIds.map((id) => alertsApi.deleteAlert(id)));
          deletedCount += readIds.length;
        }

        if (page.alerts.length < pageSize) break;
        offset += pageSize;
      }

      return { deletedCount };
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["alerts"] });

      const snapshots = queryClient.getQueriesData<AlertsQueryData>({ queryKey: ["alerts"] });

      queryClient.setQueriesData<AlertsQueryData>({ queryKey: ["alerts"] }, (current) => {
        if (!current) return current;
        return {
          ...current,
          alerts: current.alerts.filter((alert) => !alert.isRead),
        };
      });

      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      if (!context?.snapshots) return;
      for (const [key, data] of context.snapshots) {
        queryClient.setQueryData(key, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-unread-count"] });
    },
  });
}
