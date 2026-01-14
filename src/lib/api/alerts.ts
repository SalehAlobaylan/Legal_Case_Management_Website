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

export const alertsApi = {
  /**
   * Get list of alerts for the current user
   */
  async getAlerts(): Promise<AlertsResponse> {
    const { data } = await apiClient.get<AlertsResponse>(endpoints.alerts.list);
    return data;
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
