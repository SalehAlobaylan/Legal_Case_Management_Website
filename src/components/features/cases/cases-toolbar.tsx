"use client";

import * as React from "react";
import {
  ArrowDownAZ,
  ArrowDownUp,
  ArrowUpAZ,
  LayoutGrid,
  LayoutList,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CaseType } from "@/lib/types/case";
import { cn } from "@/lib/utils/cn";

export type CasesViewMode = "cards" | "table";
export type CasesSortKey = "updated" | "created" | "title" | "status";
export type CasesSortDir = "asc" | "desc";

interface CasesToolbarProps {
  statusFilter: string;
  typeFilter: string;
  searchTerm: string;
  viewMode: CasesViewMode;
  sortKey: CasesSortKey;
  sortDir: CasesSortDir;
  counts: Record<string, number>;
  isRTL: boolean;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onViewModeChange: (value: CasesViewMode) => void;
  onSortKeyChange: (value: CasesSortKey) => void;
  onToggleSortDir: () => void;
  onClearFilters: () => void;
  formatStatus: (status: string) => string;
  formatCaseType: (caseType: string) => string;
  labels: {
    all: string;
    search: string;
    type: string;
    allTypes: string;
    sortBy: string;
    updated: string;
    created: string;
    title: string;
    status: string;
    cards: string;
    table: string;
    clear: string;
  };
}

export function CasesToolbar({
  statusFilter,
  typeFilter,
  searchTerm,
  viewMode,
  sortKey,
  sortDir,
  counts,
  isRTL,
  onStatusChange,
  onTypeChange,
  onSearchChange,
  onViewModeChange,
  onSortKeyChange,
  onToggleSortDir,
  onClearFilters,
  formatStatus,
  formatCaseType,
  labels,
}: CasesToolbarProps) {
  const statusOptions = [
    { key: "all", label: labels.all, count: counts.all ?? 0 },
    { key: "open", label: formatStatus("open"), count: counts.open ?? 0 },
    {
      key: "in_progress",
      label: formatStatus("in_progress"),
      count: counts.in_progress ?? 0,
    },
    {
      key: "pending_hearing",
      label: formatStatus("pending_hearing"),
      count: counts.pending_hearing ?? 0,
    },
    { key: "closed", label: formatStatus("closed"), count: counts.closed ?? 0 },
    {
      key: "archived",
      label: formatStatus("archived"),
      count: counts.archived ?? 0,
    },
  ];
  const hasFilters = statusFilter !== "all" || typeFilter !== "all" || searchTerm;

  return (
    <Card className="rounded-2xl">
      <CardContent className="space-y-4 p-4">
        <Tabs
          defaultValue="all"
          value={statusFilter}
          onValueChange={onStatusChange}
        >
          <TabsList
            variant="pills"
            className="-mx-1 overflow-x-auto bg-slate-100/80 p-1"
          >
            {statusOptions.map((item) => (
              <TabsTrigger
                key={item.key}
                value={item.key}
                variant="pills"
                className="shrink-0 gap-2 whitespace-nowrap"
              >
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    statusFilter === item.key
                      ? "bg-[#D97706]/10 text-[#D97706]"
                      : "bg-white text-slate-500"
                  )}
                >
                  {item.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_12rem_13rem_auto_auto] lg:items-center">
          <SearchInput
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={labels.search}
            inputSize="md"
            className={cn(isRTL && "pr-10 text-right")}
          />

          <Select
            value={typeFilter}
            onChange={(event) => onTypeChange(event.target.value)}
            aria-label={labels.type}
          >
            <option value="all">{labels.allTypes}</option>
            {Object.values(CaseType).map((caseType) => (
              <option key={caseType} value={caseType}>
                {formatCaseType(caseType)}
              </option>
            ))}
          </Select>

          <Select
            value={sortKey}
            onChange={(event) => onSortKeyChange(event.target.value as CasesSortKey)}
            aria-label={labels.sortBy}
          >
            <option value="updated">{labels.updated}</option>
            <option value="created">{labels.created}</option>
            <option value="title">{labels.title}</option>
            <option value="status">{labels.status}</option>
          </Select>

          <Button
            type="button"
            variant="outline"
            onClick={onToggleSortDir}
            className="justify-center"
          >
            {sortDir === "desc" ? (
              <ArrowDownAZ className="h-4 w-4" />
            ) : (
              <ArrowUpAZ className="h-4 w-4" />
            )}
            <span className="lg:sr-only">{labels.sortBy}</span>
          </Button>

          <div className="flex items-center justify-between gap-2">
            <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 md:flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={viewMode === "cards" ? "primary" : "ghost"}
                    size="icon"
                    aria-label={labels.cards}
                    className="h-8 w-8"
                    onClick={() => onViewModeChange("cards")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{labels.cards}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={viewMode === "table" ? "primary" : "ghost"}
                    size="icon"
                    aria-label={labels.table}
                    className="h-8 w-8"
                    onClick={() => onViewModeChange("table")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{labels.table}</TooltipContent>
              </Tooltip>
            </div>
            {hasFilters ? (
              <Button type="button" variant="ghost" onClick={onClearFilters}>
                <X className="h-4 w-4" />
                {labels.clear}
              </Button>
            ) : (
              <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 lg:flex">
                <Search className="h-3.5 w-3.5" />
                <ArrowDownUp className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
