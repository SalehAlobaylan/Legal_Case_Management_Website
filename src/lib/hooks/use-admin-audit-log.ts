"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { adminApi, type AdminAuditLogResponse } from "@/lib/api/admin";

/**
 * Cursor-paginated admin audit log. `before=<id>` keeps fetches stable when
 * new rows arrive at the head.
 */
export function useAdminAuditLog(opts: { action?: string; enabled?: boolean } = {}) {
  return useInfiniteQuery<AdminAuditLogResponse>({
    queryKey: ["admin-audit-log", opts.action ?? "all"],
    queryFn: ({ pageParam }) =>
      adminApi.getAuditLog({
        action: opts.action,
        before: (pageParam as number | undefined) ?? undefined,
        limit: 50,
      }),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextBefore ?? undefined,
    enabled: opts.enabled ?? true,
    staleTime: 60_000,
  });
}
