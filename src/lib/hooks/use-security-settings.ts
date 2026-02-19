/*
 * File: src/lib/hooks/use-security-settings.ts
 * Purpose: React hooks for security settings using TanStack Query.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  securitySettingsApi,
  type LoginActivityRecord,
  type ChangePasswordRequest,
} from "@/lib/api/security-settings";

/**
 * Hook to fetch login activity
 */
export function useLoginActivity(limit = 10) {
  return useQuery<{ activity: LoginActivityRecord[] }>({
    queryKey: ["login-activity", limit],
    queryFn: () => securitySettingsApi.getLoginActivity(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      securitySettingsApi.changePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login-activity"] });
    },
  });
}
