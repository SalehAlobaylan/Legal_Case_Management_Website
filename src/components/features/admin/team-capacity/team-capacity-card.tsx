/**
 * File: src/components/features/admin/team-capacity/team-capacity-card.tsx
 * Purpose: "Team capacity" — per-lawyer workload table preceded by team
 *          averages, framed collectively rather than as per-person scoring.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/hooks/use-i18n";
import type { AdminWorkloadRow } from "@/lib/api/admin";

export function TeamCapacityCard({
  workload,
}: {
  workload: AdminWorkloadRow[];
}) {
  const { t } = useI18n();

  if (workload.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.teamCapacity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">{t("admin.noMembers")}</p>
        </CardContent>
      </Card>
    );
  }

  const opens = workload.map((r) => r.openCases);
  const avg =
    Math.round((opens.reduce((a, b) => a + b, 0) / opens.length) * 10) / 10;
  const max = Math.max(...opens);
  const min = Math.min(...opens);
  const maxTotal = Math.max(...workload.map((r) => r.totalCases), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.teamCapacity")}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Team averages header — read collectively first, individuals second */}
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
          <span>
            <span className="text-slate-400">{t("admin.capacityAvg")}:</span>{" "}
            <span className="font-semibold text-[#0F2942]">{avg}</span>
          </span>
          <span>
            <span className="text-slate-400">{t("admin.capacityMax")}:</span>{" "}
            <span className="font-semibold text-[#0F2942]">{max}</span>
          </span>
          <span>
            <span className="text-slate-400">{t("admin.capacityMin")}:</span>{" "}
            <span className="font-semibold text-[#0F2942]">{min}</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="text-start py-2 pr-4 font-medium">
                  {t("admin.name")}
                </th>
                <th className="text-start py-2 pr-4 font-medium">
                  {t("admin.role")}
                </th>
                <th className="text-end py-2 pr-4 font-medium">
                  {t("admin.open")}
                </th>
                <th className="text-end py-2 font-medium">
                  {t("admin.total")}
                </th>
              </tr>
            </thead>
            <tbody>
              {workload.map((row) => {
                const pct = Math.round((row.totalCases / maxTotal) * 100);
                return (
                  <tr
                    key={row.lawyerId}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-2 pr-4">
                      <Link
                        href={`/admin/lawyers/${row.lawyerId}`}
                        className="block group"
                      >
                        <div className="font-medium text-[#0F2942] group-hover:text-[#D97706] group-hover:underline">
                          {row.fullName || row.email}
                        </div>
                        <div className="text-xs text-slate-400">
                          {row.email}
                        </div>
                      </Link>
                      <div className="mt-1 h-1.5 w-32 bg-slate-100 rounded">
                        <div
                          className="h-full bg-orange-500 rounded"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant="outline">{row.role}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-end">{row.openCases}</td>
                    <td className="py-2 text-end">{row.totalCases}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
