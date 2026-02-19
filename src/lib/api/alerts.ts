/*
 * File: src/lib/api/alerts.ts
 * Purpose: API methods for alerts/notifications operations.
 * Used by: TanStack Query hooks for alerts.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Alert } from "@/lib/types/alert";

export interface AlertsResponse {
  alerts: Alert[];
  unreadCount: number;
}

interface LegacyNotification {
  id: number;
  userId: string;
  type: Alert["type"];
  title: string;
  message?: string | null;
  read: boolean;
  relatedCaseId?: number | null;
  relatedRegulationId?: number | null;
  relatedCase?: { id: number } | null;
  relatedRegulation?: { id: number } | null;
  createdAt: string;
}

interface LegacyAlertsResponse {
  notifications: LegacyNotification[];
}

type AlertsApiResponse =
  | AlertsResponse
  | LegacyAlertsResponse
  | {
      alerts?: Alert[];
      unreadCount?: number;
      notifications?: LegacyNotification[];
    };

export const alertsApi = {
  /**
   * Get list of alerts for the current user
   */
  async getAlerts(): Promise<AlertsResponse> {
    const { data } = await apiClient.get<AlertsApiResponse>(endpoints.alerts.list);

    if (
      data &&
      typeof data === "object" &&
      "alerts" in data &&
      Array.isArray(data.alerts)
    ) {
      return {
        alerts: data.alerts,
        unreadCount:
          typeof data.unreadCount === "number"
            ? data.unreadCount
            : data.alerts.filter((alert) => !alert.isRead).length,
      };
    }

    const notifications =
      data &&
      typeof data === "object" &&
      "notifications" in data &&
      Array.isArray(data.notifications)
        ? data.notifications
        : [];

    const alerts: Alert[] = notifications.map((notification) => ({
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message || "",
      isRead: Boolean(notification.read),
      metadata: {
        caseId: notification.relatedCaseId || notification.relatedCase?.id,
        regulationId:
          notification.relatedRegulationId || notification.relatedRegulation?.id,
      },
      createdAt: notification.createdAt,
    }));

    return {
      alerts,
      unreadCount: alerts.filter((alert) => !alert.isRead).length,
    };
  },

  /**
   * Mark a single alert as read
   */
  async markAsRead(alertId: number): Promise<void> {
    await apiClient.patch(endpoints.alerts.markRead(alertId));
  },

  /**
   * Mark all alerts as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch(endpoints.alerts.markAllRead);
  },
};
