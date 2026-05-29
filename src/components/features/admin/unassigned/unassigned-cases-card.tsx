/**
 * File: src/components/features/admin/unassigned/unassigned-cases-card.tsx
 * Purpose: Unassigned cases panel with bulk-select + inline single assign.
 *          Extracted from src/app/(dashboard)/admin/dashboard/page.tsx.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useAssignCase, useBulkAssignCases } from "@/lib/hooks/use-cases";
import type { AdminUnassignedCase } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils/format";

export function UnassignedCasesCard({
  unassigned,
  teamMembers,
  teamLoading = false,
}: {
  unassigned: AdminUnassignedCase[];
  teamMembers: Array<{ id: string; fullName?: string | null; email: string }>;
  teamLoading?: boolean;
}) {
  const { t } = useI18n();
  const assignCase = useAssignCase();
  const bulkAssign = useBulkAssignCases();
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [bulkLawyer, setBulkLawyer] = React.useState<string>("");
  const [confirmBulk, setConfirmBulk] = React.useState(false);

  const toggle = (id: number, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(unassigned.map((c) => c.id)) : new Set());

  const allChecked =
    unassigned.length > 0 && selected.size === unassigned.length;

  const submitBulk = () => {
    if (!bulkLawyer || selected.size === 0) return;
    if (selected.size > 1 && !confirmBulk) {
      setConfirmBulk(true);
      return;
    }
    bulkAssign.mutate(
      {
        caseIds: Array.from(selected),
        assignedLawyerId: bulkLawyer,
      },
      {
        onSuccess: () => {
          setSelected(new Set());
          setBulkLawyer("");
          setConfirmBulk(false);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("admin.unassignedCases")} ({unassigned.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {unassigned.length === 0 ? (
          <p className="text-sm text-slate-500">{t("admin.allAssigned")}</p>
        ) : (
          <>
            {/* Bulk header — select all + sticky-ish bulk action bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <label className="inline-flex items-center gap-2 text-xs text-slate-500">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={(c) => toggleAll(c)}
                  aria-label="Select all"
                />
                {selected.size === 0
                  ? t("admin.selectAll")
                  : (t("admin.bulkSelected") || "{{n}} selected").replace(
                      "{{n}}",
                      String(selected.size)
                    )}
              </label>
              {selected.size > 0 && (
                <div className="flex items-center gap-2">
                  <Select
                    value={bulkLawyer}
                    onChange={(e) => setBulkLawyer(e.target.value)}
                    className="h-8 text-xs min-w-[10rem]"
                    disabled={teamLoading}
                  >
                    <option value="">
                      {teamLoading ? t("common.loading") : t("admin.bulkAssignTo")}
                    </option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName || m.email}
                      </option>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    onClick={submitBulk}
                    disabled={!bulkLawyer || bulkAssign.isPending || teamLoading}
                    className="bg-[#0F2942] hover:bg-[#1E3A56]"
                  >
                    {bulkAssign.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      t("admin.bulkAssign")
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(new Set())}
                  >
                    {t("admin.bulkClear")}
                  </Button>
                </div>
              )}
            </div>

            <ul className="divide-y divide-slate-100">
              {unassigned.map((c) => {
                const isSelected = selected.has(c.id);
                return (
                  <li
                    key={c.id}
                    className="py-3 flex items-start gap-3"
                  >
                    <div className="pt-0.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(v) => toggle(c.id, v)}
                        aria-label={`Select ${c.caseNumber}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/cases/${c.id}`}
                        className="font-medium text-[#0F2942] hover:underline"
                      >
                        {c.caseNumber} — {c.title}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {c.caseType} • {c.status} • {t("admin.createdLabel")}{" "}
                        {formatDate(c.createdAt)}
                      </div>
                    </div>
                    <div className="min-w-[12rem]">
                      <Select
                        defaultValue=""
                        onChange={(e) => {
                          const lawyerId = e.target.value;
                          if (!lawyerId) return;
                          assignCase.mutate({
                            id: c.id,
                            assignedLawyerId: lawyerId,
                          });
                        }}
                        className="h-9 text-sm"
                        disabled={assignCase.isPending || teamLoading}
                      >
                        <option value="">
                          {teamLoading ? t("common.loading") : t("admin.assignTo")}
                        </option>
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.fullName || m.email}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </li>
                );
              })}
            </ul>
            <ConfirmDialog
              open={confirmBulk}
              onOpenChange={setConfirmBulk}
              title={t("admin.confirmBulkAssignTitle")}
              description={t("admin.confirmBulkAssignDesc").replace(
                "{{n}}",
                String(selected.size)
              )}
              confirmText={t("admin.bulkAssign")}
              cancelText={t("common.cancel")}
              variant="warning"
              onConfirm={submitBulk}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
