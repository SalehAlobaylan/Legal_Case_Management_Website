/*
 * File: src/lib/api/alerts.ts
 * Purpose: API methods for alerts/notifications operations.
 * Used by: TanStack Query hooks for alerts.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import { toArabicNotificationContent } from "./alert-content-ar";
import type { Alert } from "@/lib/types/alert";

function withArabicNotificationContent(alerts: Alert[]): Alert[] {
  return alerts.map((a) => {
    const { title, message } = toArabicNotificationContent(a.title, a.message);
    return { ...a, title, message };
  });
}

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

interface AlertsUnreadCountResponse {
  count: number;
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
      const alerts = withArabicNotificationContent(data.alerts as Alert[]);
      return {
        alerts,
        unreadCount:
          typeof data.unreadCount === "number"
            ? data.unreadCount
            : alerts.filter((alert) => !alert.isRead).length,
      };
    }

    const notifications =
      data &&
      typeof data === "object" &&
      "notifications" in data &&
      Array.isArray(data.notifications)
        ? data.notifications
        : [];

    const alerts: Alert[] = withArabicNotificationContent(
      notifications.map((notification) => ({
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
      }))
    );

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

  /**
   * Get unread alerts count for the current user
   */
  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<AlertsUnreadCountResponse>(
      endpoints.alerts.unreadCount
    );
    return typeof data?.count === "number" ? data.count : 0;
  },
};
