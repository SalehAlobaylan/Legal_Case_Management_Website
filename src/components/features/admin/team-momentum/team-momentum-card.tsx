/**
 * File: src/components/features/admin/team-momentum/team-momentum-card.tsx
 * Purpose: "Team momentum" feed — last 20 case/document/etc. activities across
 *          the org. Framed as collective progress, not per-person tracking.
 */

"use client";

import * as React from "react";
import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/lib/hooks/use-i18n";
import { formatDate } from "@/lib/utils/format";
import type { AdminActivityRow } from "@/lib/api/admin";
import {
  formatAdminActivityAction,
  formatAdminActivityType,
} from "@/lib/utils/admin-labels";

export function TeamMomentumCard({
  activity,
}: {
  activity: AdminActivityRow[];
}) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" /> {t("admin.teamMomentum")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-sm text-slate-500">{t("admin.noActivity")}</p>
        ) : (
          <ul className="space-y-2">
            {activity.map((a) => (
              <li
                key={a.id}
                className="text-sm flex items-center justify-between border-b border-slate-50 pb-2 last:border-0"
              >
                <span className="text-[#0F2942]">
                  <strong>{a.userName || t("admin.unknownActor")}</strong>{" "}
                  <span className="text-slate-500">
                    {formatAdminActivityAction(a.action, t)}{" "}
                    {formatAdminActivityType(a.type, t)}
                  </span>{" "}
                  {a.title && (
                    <span className="text-slate-600">— {a.title}</span>
                  )}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
