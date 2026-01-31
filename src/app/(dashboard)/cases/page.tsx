/**
 * File: src/app/(dashboard)/cases/page.tsx
 * Purpose: Cases list page with Silah design system.
 *
 * Layout:
 * - Page header with title and New Case button
 * - Status filter pills
 * - Search input
 * - Cases table with hover states
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ChevronRight,
  Filter,
  Scale,
  Search,
  Plus,
  Loader2,
} from "lucide-react";
import { useCases } from "@/lib/hooks/use-cases";
import { useI18n } from "@/lib/hooks/use-i18n";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { type Case, CaseStatus } from "@/lib/types/case";

export default function CasesPage() {
  const router = useRouter();
  const { data: cases, isLoading, error } = useCases();
  const { t, isRTL } = useI18n();
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const STATUS_FILTERS = [
    { id: "all", label: t("cases.filters.all") },
    { id: "open", label: t("cases.filters.active") },
    { id: "in_progress", label: t("cases.filters.review") },
    { id: "pending_hearing", label: t("cases.filters.draft") },
    { id: "closed", label: t("cases.filters.closed") },
  ];

  const filteredCases = React.useMemo(() => {
    if (!cases) return [];

    return cases.filter((case_) => {
      // Status filter
      if (statusFilter !== "all" && case_.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          case_.title.toLowerCase().includes(search) ||
          case_.case_number.toLowerCase().includes(search) ||
          case_.case_type?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [cases, statusFilter, searchTerm]);

  const handleNewCase = () => {
    router.push("/cases/new");
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      open: t("cases.statuses.open"),
      in_progress: t("cases.statuses.in_progress"),
      pending_hearing: t("cases.statuses.pending_hearing"),
      closed: t("cases.statuses.closed"),
      archived: t("cases.statuses.archived"),
    };
    return statusMap[status] || status.replace(/_/g, " ");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500">
          {t("cases.unableToLoad")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
            {t("cases.title")}
          </h1>
          <p className="text-slate-500 mt-2">
            {t("cases.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleNewCase}
          className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold flex items-center gap-2"
        >
          <div className="bg-white/20 p-1 rounded-md">
            <Scale className="h-4 w-4" />
          </div>
          {t("cases.newCase")}
        </Button>
      </div>

      {/* Cases Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters & Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Status Filters */}
          <FilterPills>
            {STATUS_FILTERS.map((filter) => (
              <FilterPill
                key={filter.id}
                active={statusFilter === filter.id}
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}
              </FilterPill>
            ))}
          </FilterPills>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("cases.searchCases")}
                className={cn(
                  "w-full py-2 rounded-lg",
                  isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                  "border border-slate-200 bg-white",
                  "text-sm text-[#0F2942]",
                  "placeholder:text-slate-400",
                  "focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                )}
              />
            </div>
            <button
              className={cn(
                "p-2 rounded-lg",
                "border border-slate-200",
                "hover:bg-slate-50 text-slate-600",
                "transition-colors"
              )}
            >
              <Filter className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-400 h-7 w-7" />
            </div>
            <h3 className="font-bold text-lg text-[#0F2942] mb-2">
              {searchTerm ? t("cases.noResultsFound") : t("cases.noCases")}
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              {searchTerm ? t("cases.adjustFilters") : t("cases.noCasesDesc")}
            </p>
            {!searchTerm && (
              <Button onClick={handleNewCase}>
                <Plus className="mr-2 h-4 w-4" />
                {t("cases.createCase")}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("cases.caseDetails")}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("cases.type")}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("cases.status")}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("cases.lastUpdated")}
                  </th>
                  <th className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>
                    {t("cases.action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((case_) => (
                  <CaseRow
                    key={case_.id}
                    case_={case_}
                    onView={() => router.push(`/cases/${case_.id}`)}
                    formatStatus={formatStatus}
                    isRTL={isRTL}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =============================================================================
   CASE ROW COMPONENT
   ============================================================================= */

interface CaseRowProps {
  case_: Case;
  onView: () => void;
  formatStatus: (status: string) => string;
  isRTL: boolean;
}

function CaseRow({ case_, onView, formatStatus, isRTL }: CaseRowProps) {
  const statusStyles: Record<string, string> = {
    open: "bg-green-50 text-green-700 border-green-100",
    in_progress: "bg-orange-50 text-[#D97706] border-orange-100",
    pending_hearing: "bg-orange-50 text-[#D97706] border-orange-100",
    closed: "bg-slate-100 text-slate-500 border-slate-200",
    archived: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const formattedDate = case_.updated_at
    ? new Date(case_.updated_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, "-")
    : "N/A";

  return (
    <tr
      onClick={onView}
      className="hover:bg-slate-50 transition-colors group cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              "bg-[#0F2942] text-white shadow-sm",
              "group-hover:bg-[#D97706] transition-colors"
            )}
          >
            <FileText className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h4 className="font-bold text-[#0F2942] text-sm group-hover:text-[#D97706] transition-colors">
              {case_.title}
            </h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              #{case_.case_number}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
          {case_.case_type?.replace(/_/g, " ") || "General"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
            statusStyles[case_.status] || "bg-slate-100 text-slate-600 border-slate-200"
          )}
        >
          {formatStatus(case_.status)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
        {formattedDate}
      </td>
      <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
        <button
          className="text-slate-400 hover:text-[#0F2942] p-2 hover:bg-white rounded-full transition-colors"
        >
          <ChevronRight className={`h-[18px] w-[18px] ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </td>
    </tr>
  );
}