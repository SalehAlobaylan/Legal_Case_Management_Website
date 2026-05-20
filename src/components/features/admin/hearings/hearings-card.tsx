/**
 * File: src/components/features/admin/hearings/hearings-card.tsx
 * Purpose: Hearings & deadlines pipeline card (Overdue / This week / Next week /
 *          Later) with inline reassignment. Extracted from
 *          src/app/(dashboard)/admin/dashboard/page.tsx.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useTeamMembers } from "@/lib/hooks/use-team";
import { useAssignCase } from "@/lib/hooks/use-cases";
import type {
  AdminHearingItem,
  AdminHearingsBlock,
} from "@/lib/api/admin";
import { formatDate } from "@/lib/utils/format";

type HearingTab = "overdue" | "thisWeek" | "nextWeek" | "later";

export function HearingsCard({ hearings }: { hearings: AdminHearingsBlock }) {
  const { t } = useI18n();
  const assignCase = useAssignCase();
  const { data: teamData } = useTeamMembers();
  const teamMembers = teamData?.members ?? [];

  const tabs: { key: HearingTab; label: string; tone: string }[] = [
    { key: "overdue", label: t("admin.hearingsOverdue"), tone: "text-red-700 bg-red-50" },
    { key: "thisWeek", label: t("admin.hearingsThisWeek"), tone: "text-amber-700 bg-amber-50" },
    { key: "nextWeek", label: t("admin.hearingsNextWeek"), tone: "text-blue-700 bg-blue-50" },
    { key: "later", label: t("admin.hearingsLater"), tone: "text-slate-700 bg-slate-100" },
  ];

  // Default to the most actionable tab that has rows.
  const firstNonEmpty =
    (["overdue", "thisWeek", "nextWeek", "later"] as HearingTab[]).find(
      (k) => hearings[k]?.length > 0
    ) ?? "overdue";
  const [active, setActive] = React.useState<HearingTab>(firstNonEmpty);

  const items = hearings[active] ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          {t("admin.hearingsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            const cnt = hearings.counts?.[tab.key] ?? 0;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors " +
                  (isActive
                    ? "bg-[#0F2942] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200")
                }
              >
                <span>{tab.label}</span>
                <span
                  className={
                    "ms-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] " +
                    (isActive ? "bg-white/20" : tab.tone)
                  }
                >
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            {active === "overdue"
              ? t("admin.hearingsNoneOverdue")
              : t("admin.hearingsNoneInBucket")}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((h) => (
              <HearingRow
                key={h.id}
                hearing={h}
                teamMembers={teamMembers}
                onAssign={(lawyerId) =>
                  assignCase.mutate({ id: h.id, assignedLawyerId: lawyerId })
                }
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function HearingRow({
  hearing,
  teamMembers,
  onAssign,
}: {
  hearing: AdminHearingItem;
  teamMembers: Array<{ id: string; fullName?: string | null; email: string }>;
  onAssign: (lawyerId: string) => void;
}) {
  const { t } = useI18n();
  const isOverdue = hearing.daysUntil < 0;
  const dayText =
    isOverdue
      ? t("admin.overdueBy").replace("{{n}}", String(Math.abs(hearing.daysUntil)))
      : hearing.daysUntil === 0
        ? t("admin.dueToday")
        : t("admin.daysUntil").replace("{{n}}", String(hearing.daysUntil));

  return (
    <li className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex-1 min-w-0">
        <Link
          href={`/cases/${hearing.id}`}
          className="font-medium text-[#0F2942] hover:underline truncate block"
        >
          {hearing.caseNumber} — {hearing.title}
        </Link>
        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
              {dayText}
            </span>
          </span>
          {hearing.nextHearing && (
            <span className="text-slate-400">
              · {formatDate(hearing.nextHearing)}
            </span>
          )}
          {hearing.assignedLawyer ? (
            <Link
              href={`/admin/lawyers/${hearing.assignedLawyer.id}`}
              className="text-slate-500 hover:text-[#D97706] hover:underline"
            >
              · {hearing.assignedLawyer.fullName || hearing.assignedLawyer.email}
            </Link>
          ) : (
            <span className="text-amber-600">· {t("cases.unassigned")}</span>
          )}
        </div>
      </div>
      <div className="md:min-w-[12rem]">
        <Select
          defaultValue=""
          onChange={(e) => {
            const lawyerId = e.target.value;
            if (!lawyerId) return;
            onAssign(lawyerId);
          }}
          className="h-8 text-xs"
        >
          <option value="">{t("cases.reassign")}</option>
          {teamMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName || m.email}
            </option>
          ))}
        </Select>
      </div>
    </li>
  );
}
