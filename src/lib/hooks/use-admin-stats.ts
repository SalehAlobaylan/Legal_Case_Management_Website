"use client";

/*
 * File: src/lib/hooks/use-admin-stats.ts
 * Purpose: React Query hook around /api/admin/stats for the admin dashboard.
 */

import { useQuery } from "@tanstack/react-query";
import { adminApi, type AdminStatsResponse } from "@/lib/api/admin";

export function useAdminStats(enabled = true) {
  return useQuery<AdminStatsResponse>({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
    enabled,
    staleTime: 30_000,
  });
}
