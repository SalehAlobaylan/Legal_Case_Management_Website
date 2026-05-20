"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi, type AdminTrendsResponse } from "@/lib/api/admin";

/** 12-week trends + status & case-type breakdowns. */
export function useAdminTrends(enabled = true) {
  return useQuery<AdminTrendsResponse>({
    queryKey: ["admin-trends"],
    queryFn: () => adminApi.getTrends(),
    enabled,
    staleTime: 5 * 60_000,
  });
}
