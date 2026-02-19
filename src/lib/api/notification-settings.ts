/*
 * File: src/lib/api/notification-settings.ts
 * Purpose: API module for notification settings preferences.
 */

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface NotificationPreferences {
  id: number;
  userId: string;
  emailAlerts: boolean;
  pushNotifications: boolean;
  aiSuggestions: boolean;
  regulationUpdates: boolean;
  caseUpdates: boolean;
  systemAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  digestEnabled: boolean;
  digestFrequency: "daily" | "weekly";
  createdAt: string;
  updatedAt: string;
}

export type UpdateNotificationPreferences = Partial<
  Omit<NotificationPreferences, "id" | "userId" | "createdAt" | "updatedAt">
>;

export const notificationSettingsApi = {
  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await apiClient.get(endpoints.settings.notifications);
    return data;
  },

  async updatePreferences(
    prefs: UpdateNotificationPreferences
  ): Promise<NotificationPreferences> {
    const { data } = await apiClient.put(
      endpoints.settings.notifications,
      prefs
    );
    return data;
  },
};
