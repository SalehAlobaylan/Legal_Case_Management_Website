"use client";

import * as React from "react";
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CaseActionsMenu } from "@/components/features/cases/case-actions-menu";
import {
  CaseStatusBadge,
  getCaseStatusAccent,
} from "@/components/features/cases/case-status-badge";
import type { Case } from "@/lib/types/case";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface CaseWorkspaceCardProps {
  case_: Case;
  selected: boolean;
  isBusy: boolean;
  isRTL: boolean;
  formatStatus: (status: string) => string;
  formatCaseType: (caseType: string) => string;
  onToggleSelected: (checked: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onLinkStudio: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  labels: {
    selectCase: string;
    updated: string;
    unassigned: string;
    linkStudio: string;
    open: string;
  };
}

export function CaseWorkspaceCard({
  case_,
  selected,
  isBusy,
  isRTL,
  formatStatus,
  formatCaseType,
  onToggleSelected,
  onView,
  onEdit,
  onLinkStudio,
  onDelete,
  onStatusChange,
  labels,
}: CaseWorkspaceCardProps) {
  return (
    <Card
      hoverable
      onClick={onView}
      className={cn(
        "group overflow-hidden border-s-4 bg-white",
        !selected && getCaseStatusAccent(case_.status),
        selected && "border-[#0F2942] bg-slate-50 ring-2 ring-[#0F2942]/10"
      )}
    >
      <CardContent className="p-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_13rem]">
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={selected}
                  onCheckedChange={onToggleSelected}
                  aria-label={labels.selectCase}
                  className="mt-1"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="min-w-0 text-base font-bold leading-snug text-[#0F2942] transition-colors group-hover:text-[#D97706]">
                    {case_.title}
                  </h3>
                  <CaseStatusBadge
                    status={case_.status}
                    label={formatStatus(case_.status)}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    #{case_.case_number}
                  </span>
                  <Badge
                    variant="default"
                    size="sm"
                    className="normal-case tracking-normal"
                  >
                    {formatCaseType(case_.case_type)}
                  </Badge>
                </div>
              </div>
            </div>

            {case_.description ? (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                {case_.description}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              {case_.client_info ? (
                <span className="inline-flex max-w-44 items-center gap-1.5 truncate">
                  <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate font-medium">{case_.client_info}</span>
                </span>
              ) : null}
              {case_.court_jurisdiction ? (
                <span className="inline-flex max-w-44 items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate font-medium">
                    {case_.court_jurisdiction}
                  </span>
                </span>
              ) : null}
              {case_.filing_date ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium">{formatDate(case_.filing_date)}</span>
                </span>
              ) : null}
              {case_.next_hearing ? (
                <span className="inline-flex items-center gap-1.5 text-[#D97706]">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-bold">{formatDate(case_.next_hearing)}</span>
                </span>
              ) : null}
              {case_.assignedLawyer?.fullName ? (
                <span className="inline-flex max-w-44 items-center gap-1.5 truncate">
                  <Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate font-medium">
                    {case_.assignedLawyer.fullName}
                  </span>
                </span>
              ) : !(case_.assignedLawyerId || case_.assigned_lawyer_id) ? (
                <span className="inline-flex items-center gap-1.5 text-amber-600">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="font-medium">{labels.unassigned}</span>
                </span>
              ) : null}
            </div>
          </div>

          <CardFooter
            bordered
            className="flex-row justify-between gap-3 bg-slate-50/70 p-4 lg:flex-col lg:items-end lg:justify-center"
          >
            <div className={cn("text-start lg:text-end", isRTL && "lg:text-start")}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {labels.updated}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-600">
                {formatDate(case_.updated_at)}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    onClick={(event) => {
                      event.stopPropagation();
                      onLinkStudio();
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{labels.linkStudio}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    onClick={(event) => {
                      event.stopPropagation();
                      onView();
                    }}
                  >
                    <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{labels.open}</TooltipContent>
              </Tooltip>
              <CaseActionsMenu
                caseStatus={case_.status}
                formatStatus={formatStatus}
                isBusy={isBusy}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onLinkStudio={onLinkStudio}
                onStatusChange={onStatusChange}
                caseId={case_.id}
                assignedLawyerId={
                  case_.assignedLawyerId ?? case_.assigned_lawyer_id ?? null
                }
              />
            </div>
          </CardFooter>
        </div>
      </CardContent>
    </Card>
  );
}
