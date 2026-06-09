"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { CaseStatus } from "@/lib/types/case";

const STATUS_STYLE: Record<CaseStatus, { dot: string; className: string }> = {
  [CaseStatus.OPEN]: {
    dot: "bg-emerald-500",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  [CaseStatus.IN_PROGRESS]: {
    dot: "bg-amber-500",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  [CaseStatus.PENDING_HEARING]: {
    dot: "bg-orange-500",
    className: "bg-orange-50 text-orange-700 border-orange-100",
  },
  [CaseStatus.CLOSED]: {
    dot: "bg-slate-500",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  [CaseStatus.ARCHIVED]: {
    dot: "bg-slate-300",
    className: "bg-slate-50 text-slate-500 border-slate-200",
  },
};

interface CaseStatusBadgeProps {
  status: CaseStatus;
  label: string;
  className?: string;
}

export function CaseStatusBadge({ status, label, className }: CaseStatusBadgeProps) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE[CaseStatus.CLOSED];

  return (
    <Badge
      variant="outline"
      size="sm"
      className={cn(
        "gap-1.5 rounded-full normal-case tracking-normal",
        style.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {label}
    </Badge>
  );
}

export function getCaseStatusAccent(status: CaseStatus) {
  const map: Record<CaseStatus, string> = {
    [CaseStatus.OPEN]: "border-s-emerald-500",
    [CaseStatus.IN_PROGRESS]: "border-s-amber-500",
    [CaseStatus.PENDING_HEARING]: "border-s-orange-500",
    [CaseStatus.CLOSED]: "border-s-slate-400",
    [CaseStatus.ARCHIVED]: "border-s-slate-300",
  };
  return map[status] ?? map[CaseStatus.CLOSED];
}
