/*
 * File: src/lib/api/security-settings.ts
 * Purpose: API module for security settings (password change, login activity).
 */

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface LoginActivityRecord {
  id: number;
  userId: string;
  device: string;
  browser: string | null;
  ip: string;
  location: string | null;
  loginAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const securitySettingsApi = {
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const { data: result } = await apiClient.put(
      endpoints.settings.security.changePassword,
      data
    );
    return result;
  },

  async getLoginActivity(limit = 10): Promise<{ activity: LoginActivityRecord[] }> {
    const { data } = await apiClient.get(
      endpoints.settings.security.loginActivity,
      { params: { limit } }
    );
    return data;
  },
};
