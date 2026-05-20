"use client";

/*
 * File: src/lib/hooks/use-admin-lawyer.ts
 * Purpose: React Query wrapper around GET /api/admin/lawyers/:id (drill-down).
 */

import { useQuery } from "@tanstack/react-query";
import { adminApi, type AdminLawyerDetailResponse } from "@/lib/api/admin";

export function useAdminLawyer(id: string | undefined, enabled = true) {
  return useQuery<AdminLawyerDetailResponse>({
    queryKey: ["admin-lawyer", id],
    queryFn: () => adminApi.getLawyer(id as string),
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
  });
}
