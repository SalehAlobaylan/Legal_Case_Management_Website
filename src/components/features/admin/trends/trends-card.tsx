/**
 * File: src/components/features/admin/trends/trends-card.tsx
 * Purpose: Trends card — three small recharts (cases-over-time, status pie,
 *          case-type bars). Extracted from
 *          src/app/(dashboard)/admin/dashboard/page.tsx.
 */

"use client";

import * as React from "react";
import { Loader2, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useAdminTrends } from "@/lib/hooks/use-admin-trends";
import type { AdminDashboardSettings } from "@/lib/api/admin";

export const STATUS_COLORS: Record<string, string> = {
  open: "#10b981",
  in_progress: "#f59e0b",
  pending_hearing: "#f97316",
  closed: "#64748b",
  archived: "#94a3b8",
};
export const TYPE_COLOR = "#0F2942";

export function TrendsCard({ settings }: { settings?: AdminDashboardSettings }) {
  const { t } = useI18n();
  const { data, isLoading } = useAdminTrends();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5 flex items-center gap-2 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
        </CardContent>
      </Card>
    );
  }
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> {t("admin.trendsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases over time */}
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between gap-2">
              <span>{t("admin.trendsCasesOverTime")}</span>
              {settings && (
                <span className="font-normal text-slate-400">
                  {t("admin.settingWorkload")}: {settings.workloadHighOpenCases}
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.casesOverTime}>
                <XAxis
                  dataKey="week"
                  fontSize={10}
                  tickFormatter={(s: string) => s.slice(5)}
                />
                <YAxis fontSize={10} allowDecimals={false} />
                <ReTooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#D97706"
                  strokeWidth={2}
                  name={t("admin.trendsCreated")}
                />
                <Line
                  type="monotone"
                  dataKey="closed"
                  stroke="#0F2942"
                  strokeWidth={2}
                  name={t("admin.trendsClosed")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status pie */}
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">
              {t("admin.trendsStatus")}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={30}
                  label={(props: { name?: string }) => props.name ?? ""}
                  labelLine={false}
                  fontSize={10}
                >
                  {data.statusBreakdown.map((row) => (
                    <Cell
                      key={row.status}
                      fill={STATUS_COLORS[row.status] ?? "#94a3b8"}
                    />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Case-type bars */}
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">
              {t("admin.trendsCaseType")}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.caseTypeBreakdown}>
                <XAxis dataKey="caseType" fontSize={9} interval={0} />
                <YAxis fontSize={10} allowDecimals={false} />
                <ReTooltip />
                <Bar dataKey="count" fill={TYPE_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
