"use client";

import * as React from "react";
import { CheckCircle2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CaseStatus } from "@/lib/types/case";
import { cn } from "@/lib/utils/cn";

interface BulkCaseActionsBarProps {
  selectedCount: number;
  canAssign: boolean;
  teamMembers: Array<{ id: string; fullName?: string | null; email: string }>;
  isBusy: boolean;
  isRTL: boolean;
  onClear: () => void;
  onAssign: (lawyerId: string | null) => void;
  onStatusChange: (status: CaseStatus) => void;
  onDelete: () => void;
  formatStatus: (status: string) => string;
  labels: {
    selected: string;
    clear: string;
    assign: string;
    unassign: string;
    selectLawyer: string;
    changeStatus: string;
    delete: string;
  };
}

export function BulkCaseActionsBar({
  selectedCount,
  canAssign,
  teamMembers,
  isBusy,
  isRTL,
  onClear,
  onAssign,
  onStatusChange,
  onDelete,
  formatStatus,
  labels,
}: BulkCaseActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <Card
      className={cn(
        "sticky bottom-4 z-30 border-[#0F2942]/20 bg-white/95 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur",
        isRTL && "text-right"
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F2942] text-white">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F2942]">
              {labels.selected.replace("{{count}}", String(selectedCount))}
            </p>
            <Button
              type="button"
              variant="link"
              className="mt-0.5 text-xs"
              onClick={onClear}
            >
              <X className="h-3.5 w-3.5" />
              {labels.clear}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {canAssign ? (
            <>
              <Select
                defaultValue=""
                disabled={isBusy}
                onChange={(event) => {
                  const value = event.target.value;
                  if (!value) return;
                  onAssign(value === "__unassign" ? null : value);
                  event.currentTarget.value = "";
                }}
                aria-label={labels.assign}
                className="min-w-52"
              >
                <option value="">{labels.selectLawyer}</option>
                <option value="__unassign">{labels.unassign}</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName || member.email}
                  </option>
                ))}
              </Select>
              <Separator orientation="vertical" className="hidden h-8 sm:block" />
            </>
          ) : null}

          <Select
            defaultValue=""
            disabled={isBusy}
            onChange={(event) => {
              const value = event.target.value as CaseStatus;
              if (!value) return;
              onStatusChange(value);
              event.currentTarget.value = "";
            }}
            aria-label={labels.changeStatus}
            className="min-w-44"
          >
            <option value="">{labels.changeStatus}</option>
            {Object.values(CaseStatus).map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </Select>

          <Button
            type="button"
            variant="destructive"
            disabled={isBusy}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            {labels.delete}
          </Button>
        </div>
      </div>
    </Card>
  );
}
