/**
 * File: src/components/features/admin/audit-log/audit-log-card.tsx
 * Purpose: Admin audit-log card — paginated feed of governance events with
 *          action filter. Extracted from
 *          src/app/(dashboard)/admin/dashboard/page.tsx.
 */

"use client";

import * as React from "react";
import { Filter, Loader2, ScrollText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useAdminAuditLog } from "@/lib/hooks/use-admin-audit-log";
import { formatDate } from "@/lib/utils/format";

export function AuditLogCard() {
  const { t } = useI18n();
  const [action, setAction] = React.useState<string>("");
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useAdminAuditLog({ action: action || undefined });

  const entries = data?.pages.flatMap((p) => p.entries) ?? [];
  const actions = data?.pages[0]?.actions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" /> {t("admin.auditLogTitle")}
          </span>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <Select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="h-7 text-xs min-w-[10rem]"
            >
              <option value="">{t("admin.auditAll")}</option>
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-slate-500">{t("admin.auditEmpty")}</p>
        ) : (
          <>
            <ul className="space-y-2">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="text-sm flex items-center justify-between border-b border-slate-50 pb-2 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 me-2">
                      {e.action}
                    </span>
                    <span className="text-[#0F2942] font-medium">
                      {e.actorName || e.actorEmail || "—"}
                    </span>
                    {e.targetType && (
                      <span className="text-slate-500 ms-1">
                        → {e.targetType}
                        {e.targetId ? `#${e.targetId}` : ""}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {formatDate(e.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
            {hasNextPage && (
              <div className="mt-3 text-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    t("admin.auditLoadMore")
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
