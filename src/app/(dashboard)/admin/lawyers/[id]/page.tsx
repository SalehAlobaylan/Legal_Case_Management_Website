/**
 * File: src/app/(dashboard)/admin/lawyers/[id]/page.tsx
 * Purpose: Admin drill-down for a single lawyer — profile header, case-status
 *          stat cards, full case list, and a recent-activity timeline. Mirrors
 *          the auth-guard pattern from src/app/(dashboard)/admin/monitoring/page.tsx:72.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { usePermission } from "@/lib/hooks/use-permission";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAdminLawyer } from "@/lib/hooks/use-admin-lawyer";
import { useTeamMembers, useSetMemberOnLeave } from "@/lib/hooks/use-team";
import { useAssignCase, useBulkAssignCases } from "@/lib/hooks/use-cases";
import { StatCard } from "@/components/features/admin/stat-card";
import type { AdminLawyerCase } from "@/lib/api/admin";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/hooks/use-i18n";
import { formatDate } from "@/lib/utils/format";
import { bucketByDeadline, daysUntil } from "@/lib/utils/date-buckets";
import {
  formatAdminActivityAction,
  formatAdminActivityType,
  formatAdminCaseStatus,
  formatAdminRole,
} from "@/lib/utils/admin-labels";

export default function AdminLawyerDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isAdmin } = usePermission();
  const { t, isRTL } = useI18n();

  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (!isAdmin()) router.replace("/dashboard");
  }, [isAuthenticated, isAdmin, router]);

  const { data, isLoading, error } = useAdminLawyer(
    id,
    isAuthenticated && isAdmin()
  );
  const { data: teamData } = useTeamMembers();
  const teamMembers = teamData?.members ?? [];
  const assignCase = useAssignCase();
  const setOnLeave = useSetMemberOnLeave();
  const queryClient = useQueryClient();

  if (!isAuthenticated || !isAdmin() || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t("admin.lawyerLoadFailed")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { lawyer, caseCounts, cases, recentActivity } = data;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:underline"
        >
          {isRTL ? (
            <ArrowRight className="h-4 w-4" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
          {t("admin.lawyerBackToDashboard")}
        </Link>
      </div>

      {/* Header — "Team member profile" framing */}
      <Card>
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-[#0F2942] text-white flex items-center justify-center text-xl font-bold">
            {(lawyer.fullName || lawyer.email).slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-[#0F2942]">
                {lawyer.fullName || lawyer.email}
              </h1>
              <Badge variant="outline">{formatAdminRole(lawyer.role, t)}</Badge>
              {lawyer.isOnLeave && (
                <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  {t("admin.onLeaveBadge")}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                disabled={setOnLeave.isPending}
                onClick={() =>
                  setOnLeave.mutate({
                    memberId: lawyer.id,
                    isOnLeave: !lawyer.isOnLeave,
                  })
                }
                className="ms-2"
              >
                {lawyer.isOnLeave
                  ? t("admin.markActive")
                  : t("admin.markOnLeave")}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1 italic">
              {t("admin.lawyerProfileSubtitle")}
            </p>
            <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {lawyer.email}
              </span>
              {lawyer.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {lawyer.phone}
                </span>
              )}
              {lawyer.specialization && (
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> {lawyer.specialization}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Briefcase className="h-5 w-5" />}
          label={t("admin.statTotalCases")}
          value={caseCounts.total}
          accent="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label={t("admin.statOpenCases")}
          value={caseCounts.open}
          accent="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5" />}
          label={t("admin.lawyerClosedCases")}
          value={caseCounts.closed}
          accent="bg-slate-100 text-slate-700"
        />
        <StatCard
          icon={<CalendarClock className="h-5 w-5" />}
          label={t("admin.lawyerUpcomingHearings")}
          value={caseCounts.upcomingHearings}
          accent="bg-amber-50 text-amber-700"
        />
      </div>

      {/* Redistribute their open cases — shown when on leave */}
      {lawyer.isOnLeave && (
        <RedistributeCard
          lawyerId={lawyer.id}
          openCases={cases.filter(
            (c) => !["closed", "archived"].includes(c.status)
          )}
          teamMembers={teamMembers.filter((m) => m.id !== lawyer.id)}
          onSettled={() =>
            queryClient.invalidateQueries({ queryKey: ["admin-lawyer", id] })
          }
        />
      )}

      {/* Cases */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.lawyerCases")} ({cases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <p className="text-sm text-slate-500">{t("admin.lawyerNoCases")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="text-start py-2 pr-4 font-medium">
                      {t("admin.caseNumber")}
                    </th>
                    <th className="text-start py-2 pr-4 font-medium">
                      {t("admin.caseTitle")}
                    </th>
                    <th className="text-start py-2 pr-4 font-medium">
                      {t("table.status")}
                    </th>
                    <th className="text-start py-2 pr-4 font-medium">
                      {t("admin.lawyerNextHearing")}
                    </th>
                    <th className="text-start py-2 pr-4 font-medium">
                      {t("admin.caseUpdated")}
                    </th>
                    <th className="text-end py-2 font-medium">
                      <div>{t("cases.assignment")}</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                        {t("admin.assignmentHelp")}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => {
                    const bucket = bucketByDeadline(c.nextHearing);
                    const tone =
                      bucket === "overdue"
                        ? "text-red-700"
                        : bucket === "thisWeek"
                          ? "text-amber-700"
                          : "text-slate-600";
                    return (
                      <tr
                        key={c.id}
                        className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-2 pr-4 font-mono text-xs text-slate-500">
                          {c.caseNumber}
                        </td>
                        <td className="py-2 pr-4">
                          <Link
                            href={`/cases/${c.id}`}
                            className="font-medium text-[#0F2942] hover:underline"
                          >
                            {c.title}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant="outline">
                            {formatAdminCaseStatus(c.status, t)}
                          </Badge>
                        </td>
                        <td className={`py-2 pr-4 text-xs ${tone}`}>
                          {c.nextHearing ? (
                            <>
                              {formatDate(c.nextHearing)}
                              {bucket !== "none" && (
                                <span className="ms-1 text-slate-400">
                                  ({daysUntil(c.nextHearing)}d)
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-xs text-slate-500">
                          {formatDate(c.updatedAt)}
                        </td>
                        <td className="py-2 text-end">
                          <div className="inline-block min-w-[10rem]">
                            <Select
                              defaultValue=""
                              disabled={assignCase.isPending}
                              onChange={(e) => {
                                const lawyerId = e.target.value;
                                if (!lawyerId) return;
                                assignCase.mutate(
                                  { id: c.id, assignedLawyerId: lawyerId },
                                  {
                                    onSettled: () => {
                                      // Refresh this drill-down's data too,
                                      // since useAssignCase only invalidates
                                      // ["cases"] and ["admin-stats"].
                                      queryClient.invalidateQueries({
                                        queryKey: ["admin-lawyer", id],
                                      });
                                    },
                                  }
                                );
                              }}
                              className="h-8 text-xs"
                            >
                              <option value="">{t("cases.reassign")}</option>
                              {teamMembers.map(
                                (m: { id: string; fullName?: string | null; email: string }) =>
                                  m.id === data.lawyer.id ? null : (
                                    <option key={m.id} value={m.id}>
                                      {m.fullName || m.email}
                                    </option>
                                  )
                              )}
                            </Select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> {t("admin.recentContributions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">{t("admin.noActivity")}</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((a) => (
                <li
                  key={a.id}
                  className="text-sm flex items-center justify-between border-b border-slate-50 pb-2 last:border-0"
                >
                  <span className="text-[#0F2942]">
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
    </div>
  );
}

/* ============================================================================
   REDISTRIBUTE — shown when the member is on leave
   ============================================================================ */

function RedistributeCard({
  lawyerId,
  openCases,
  teamMembers,
  onSettled,
}: {
  lawyerId: string;
  openCases: AdminLawyerCase[];
  teamMembers: Array<{ id: string; fullName?: string | null; email: string }>;
  onSettled: () => void;
}) {
  const { t } = useI18n();
  const bulkAssign = useBulkAssignCases();
  const [selected, setSelected] = React.useState<Set<number>>(
    () => new Set(openCases.map((c) => c.id))
  );
  const [target, setTarget] = React.useState<string>("");

  React.useEffect(() => {
    // When the case list refreshes (after a bulk assign), default-select all again.
    setSelected(new Set(openCases.map((c) => c.id)));
  }, [openCases]);

  const toggle = (id: number, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const submit = () => {
    if (!target || selected.size === 0) return;
    bulkAssign.mutate(
      {
        caseIds: Array.from(selected),
        assignedLawyerId: target,
      },
      {
        onSettled: () => {
          onSettled();
          setTarget("");
        },
      }
    );
  };

  // Suppress lint: lawyerId is used as a key for invalidation context only.
  void lawyerId;

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>{t("admin.redistributeTitle")}</span>
          <span className="text-xs font-normal text-slate-500">
            {openCases.length} {t("admin.lawyerCases")}
          </span>
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">
          {t("admin.redistributeHelp")}
        </p>
      </CardHeader>
      <CardContent>
        {openCases.length === 0 ? (
          <p className="text-sm text-slate-500">{t("admin.allAssigned")}</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-slate-500">
                {t("admin.bulkSelected").replace("{{n}}", String(selected.size))}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="h-8 text-xs min-w-[10rem]"
                >
                  <option value="">{t("admin.bulkAssignTo")}</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName || m.email}
                    </option>
                  ))}
                </Select>
                <Button
                  size="sm"
                  onClick={submit}
                  disabled={
                    !target || selected.size === 0 || bulkAssign.isPending
                  }
                  className="bg-[#0F2942] hover:bg-[#1E3A56]"
                >
                  {bulkAssign.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    t("admin.bulkAssign")
                  )}
                </Button>
              </div>
            </div>
            <ul className="divide-y divide-amber-100">
              {openCases.map((c) => (
                <li
                  key={c.id}
                  className="py-2 flex items-center gap-3 text-sm"
                >
                  <Checkbox
                    checked={selected.has(c.id)}
                    onCheckedChange={(v) => toggle(c.id, v)}
                    aria-label={`Select ${c.caseNumber}`}
                  />
                  <div className="font-mono text-xs text-slate-500">
                    {c.caseNumber}
                  </div>
                  <div className="flex-1 min-w-0 truncate text-[#0F2942]">
                    {c.title}
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {formatAdminCaseStatus(c.status, t)}
                  </Badge>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
