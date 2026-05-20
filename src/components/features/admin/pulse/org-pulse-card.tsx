/**
 * File: src/components/features/admin/pulse/org-pulse-card.tsx
 * Purpose: Org pulse risk-surface card — stale cases, AI awaiting review, and
 *          regulation updates. Extracted from
 *          src/app/(dashboard)/admin/dashboard/page.tsx.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlarmClock,
  AlertCircle,
  Heart,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useAdminPulse } from "@/lib/hooks/use-admin-pulse";
import { formatDate } from "@/lib/utils/format";

export function OrgPulseCard() {
  const { t } = useI18n();
  const { data, isLoading } = useAdminPulse();

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
          <Heart className="h-4 w-4" /> {t("admin.pulseTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PulseTile
            tone="amber"
            icon={<AlarmClock className="h-5 w-5" />}
            title={t("admin.pulseStale")}
            hint={t("admin.pulseStaleHint")}
            count={data.stale.count}
            items={data.stale.items.slice(0, 3).map((it) => ({
              key: String(it.id),
              href: `/cases/${it.id}`,
              label: `${it.caseNumber} — ${it.title}`,
              meta:
                it.assignedLawyer?.fullName ||
                it.assignedLawyer?.email ||
                t("cases.unassigned"),
            }))}
          />
          <PulseTile
            tone="blue"
            icon={<Sparkles className="h-5 w-5" />}
            title={t("admin.pulseAiAwaiting")}
            hint={t("admin.pulseAiHint")}
            count={data.awaitingReview.count}
            items={data.awaitingReview.items.slice(0, 3).map((it) => ({
              key: String(it.caseId),
              href: `/cases/${it.caseId}`,
              label: `${it.caseNumber} — ${it.title}`,
              meta: `${it.unreviewed} ${t("admin.pulseAiPerCase") || "to review"}`,
            }))}
          />
          <PulseTile
            tone="red"
            icon={<AlertCircle className="h-5 w-5" />}
            title={t("admin.pulseRegUpdates")}
            hint={t("admin.pulseRegHint")}
            count={data.regulationUpdates.count}
            items={data.regulationUpdates.items.slice(0, 3).map((it) => ({
              key: `${it.caseId}-${it.regulationId}`,
              href: `/cases/${it.caseId}`,
              label: it.regulationTitle,
              meta: `${it.caseNumber} · ${formatDate(it.fetchedAt)}`,
            }))}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PulseTile({
  tone,
  icon,
  title,
  hint,
  count,
  items,
}: {
  tone: "amber" | "blue" | "red";
  icon: React.ReactNode;
  title: string;
  hint: string;
  count: number;
  items: { key: string; href: string; label: string; meta: string }[];
}) {
  const toneClass: Record<typeof tone, string> = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${toneClass[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <div className="font-semibold">{title}</div>
        </div>
        <div className="text-2xl font-bold">{count}</div>
      </div>
      <p className="text-[11px] opacity-80 mt-1">{hint}</p>
      {items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.map((it) => (
            <li key={it.key} className="text-xs">
              <Link
                href={it.href}
                className="text-[#0F2942] hover:underline truncate block max-w-full"
              >
                {it.label}
              </Link>
              <div className="text-[10px] opacity-70 truncate">{it.meta}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
