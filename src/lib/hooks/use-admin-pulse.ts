"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi, type AdminPulseResponse } from "@/lib/api/admin";

/** Org Pulse / Risk Surface — stale cases, AI awaiting review, regulation updates. */
export function useAdminPulse(enabled = true) {
  return useQuery<AdminPulseResponse>({
    queryKey: ["admin-pulse"],
    queryFn: () => adminApi.getPulse(),
    enabled,
    staleTime: 60_000,
  });
}
