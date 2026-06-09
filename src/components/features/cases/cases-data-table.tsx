"use client";

import * as React from "react";
import { ArrowUpDown, Briefcase, CalendarClock, Sparkles } from "lucide-react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CaseActionsMenu } from "@/components/features/cases/case-actions-menu";
import { CaseStatusBadge } from "@/components/features/cases/case-status-badge";
import type { Case } from "@/lib/types/case";
import { formatDate } from "@/lib/utils/format";

interface CasesDataTableProps {
  cases: Case[];
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  formatStatus: (status: string) => string;
  formatCaseType: (caseType: string) => string;
  onView: (case_: Case) => void;
  onEdit: (case_: Case) => void;
  onLinkStudio: (case_: Case) => void;
  onDelete: (case_: Case) => void;
  onStatusChange: (case_: Case, status: string) => void;
  activeCaseId: number | null;
  labels: {
    selectAll: string;
    selectCase: string;
    case: string;
    client: string;
    type: string;
    status: string;
    lawyer: string;
    updated: string;
    actions: string;
    linkStudio: string;
    noResults: string;
    selected: string;
    previous: string;
    next: string;
    unassigned: string;
  };
}

function SortHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ms-2 h-8 px-2 text-[11px] uppercase tracking-wide"
      onClick={onClick}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </Button>
  );
}

export function CasesDataTable({
  cases,
  rowSelection,
  onRowSelectionChange,
  formatStatus,
  formatCaseType,
  onView,
  onEdit,
  onLinkStudio,
  onDelete,
  onStatusChange,
  activeCaseId,
  labels,
}: CasesDataTableProps) {
  const columns = React.useMemo<ColumnDef<Case>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div onClick={(event) => event.stopPropagation()}>
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(checked) =>
                table.toggleAllPageRowsSelected(Boolean(checked))
              }
              aria-label={labels.selectAll}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div onClick={(event) => event.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
              aria-label={labels.selectCase}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <SortHeader
            label={labels.case}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => {
          const case_ = row.original;
          return (
            <div className="min-w-0">
              <p className="max-w-80 truncate text-sm font-bold text-[#0F2942]">
                {case_.title}
              </p>
              <p className="mt-1 font-mono text-[11px] font-semibold text-slate-400">
                #{case_.case_number}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "client_info",
        header: labels.client,
        cell: ({ row }) => (
          <span className="block max-w-36 truncate text-xs font-medium text-slate-600">
            {row.original.client_info || "—"}
          </span>
        ),
      },
      {
        accessorKey: "case_type",
        header: labels.type,
        cell: ({ row }) => (
          <Badge
            variant="default"
            size="sm"
            className="normal-case tracking-normal"
          >
            {formatCaseType(row.original.case_type)}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortHeader
            label={labels.status}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <CaseStatusBadge
            status={row.original.status}
            label={formatStatus(row.original.status)}
          />
        ),
      },
      {
        id: "lawyer",
        header: labels.lawyer,
        cell: ({ row }) => {
          const case_ = row.original;
          const assigned = case_.assignedLawyer?.fullName;
          return (
            <span className="inline-flex max-w-36 items-center gap-1.5 truncate text-xs text-slate-600">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{assigned || labels.unassigned}</span>
            </span>
          );
        },
      },
      {
        accessorKey: "updated_at",
        header: ({ column }) => (
          <SortHeader
            label={labels.updated}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
            {formatDate(row.original.updated_at)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{labels.actions}</span>,
        cell: ({ row }) => {
          const case_ = row.original;
          return (
            <div
              className="flex justify-end gap-1.5"
              onClick={(event) => event.stopPropagation()}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    onClick={() => onLinkStudio(case_)}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{labels.linkStudio}</TooltipContent>
              </Tooltip>
              <CaseActionsMenu
                caseStatus={case_.status}
                formatStatus={formatStatus}
                isBusy={activeCaseId === case_.id}
                onView={() => onView(case_)}
                onEdit={() => onEdit(case_)}
                onDelete={() => onDelete(case_)}
                onLinkStudio={() => onLinkStudio(case_)}
                onStatusChange={(status) => onStatusChange(case_, status)}
                caseId={case_.id}
                assignedLawyerId={
                  case_.assignedLawyerId ?? case_.assigned_lawyer_id ?? null
                }
              />
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [
      activeCaseId,
      formatCaseType,
      formatStatus,
      labels,
      onDelete,
      onEdit,
      onLinkStudio,
      onStatusChange,
      onView,
    ]
  );

  return (
    <DataTable
      columns={columns}
      data={cases}
      getRowId={(case_) => String(case_.id)}
      emptyMessage={labels.noResults}
      selectedLabel={labels.selected.replace(
        "{{count}}",
        String(Object.values(rowSelection).filter(Boolean).length)
      )}
      previousLabel={labels.previous}
      nextLabel={labels.next}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      onRowClick={onView}
    />
  );
}
