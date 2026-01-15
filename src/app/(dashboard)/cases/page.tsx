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
import Link from "next/link";
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
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Case } from "@/lib/types/case";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Active" },
  { id: "in_progress", label: "In Progress" },
  { id: "pending_hearing", label: "Pending" },
  { id: "closed", label: "Closed" },
];

export default function CasesPage() {
  const router = useRouter();
  const { data: cases, isLoading, error } = useCases();
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");

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
          Unable to load cases. Please try again.
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
            Case Management
          </h1>
          <p className="text-slate-500 mt-2">
            Manage and track your organization&apos;s legal cases.
          </p>
        </div>
        <Button
          onClick={handleNewCase}
          className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold flex items-center gap-2"
        >
          <div className="bg-white/20 p-1 rounded-md">
            <Scale className="h-4 w-4" />
          </div>
          New Case
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cases..."
                className={cn(
                  "w-full pl-10 pr-4 py-2 rounded-lg",
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
          <EmptyState searchTerm={searchTerm} onNewCase={handleNewCase} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Case Details
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((case_) => (
                  <CaseRow
                    key={case_.id}
                    case_={case_}
                    onView={() => router.push(`/cases/${case_.id}`)}
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
}

function CaseRow({ case_, onView }: CaseRowProps) {
  const statusStyles: Record<string, string> = {
    open: "bg-[#0F2942]/10 text-[#0F2942]",
    in_progress: "bg-[#D97706]/10 text-[#D97706]",
    pending_hearing: "bg-orange-100 text-orange-700",
    closed: "bg-green-100 text-green-700",
    archived: "bg-slate-200 text-slate-600",
  };

  const formattedDate = case_.updated_at
    ? new Date(case_.updated_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              "bg-[#0F2942] text-white",
              "group-hover:bg-[#D97706] transition-colors"
            )}
          >
            <FileText className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h4 className="font-bold text-[#0F2942] text-sm">{case_.title}</h4>
            <p className="text-xs text-slate-500">#{case_.case_number}</p>
          </div>
        </div>
      </td>
      <td className="p-4 text-sm text-slate-600">
        {case_.case_type?.replace(/_/g, " ") || "General"}
      </td>
      <td className="p-4">
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            statusStyles[case_.status] || "bg-slate-100 text-slate-600"
          )}
        >
          {formatStatus(case_.status)}
        </span>
      </td>
      <td className="p-4 text-sm text-slate-600">{formattedDate}</td>
      <td className="p-4">
        <button
          onClick={onView}
          className="text-[#D97706] text-sm font-bold hover:underline flex items-center gap-1"
        >
          View Details <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

/* =============================================================================
   EMPTY STATE COMPONENT
   ============================================================================= */

interface EmptyStateProps {
  searchTerm: string;
  onNewCase: () => void;
}

function EmptyState({ searchTerm, onNewCase }: EmptyStateProps) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <FileText className="text-slate-400 h-7 w-7" />
      </div>
      <h3 className="font-bold text-lg text-[#0F2942] mb-2">
        {searchTerm ? "No cases found" : "No cases yet"}
      </h3>
      <p className="text-slate-500 text-sm mb-4">
        {searchTerm
          ? "Try adjusting your filters or search term."
          : "Create your first case to get started."}
      </p>
      {!searchTerm && (
        <Button onClick={onNewCase}>
          <Plus className="mr-2 h-4 w-4" />
          Create Case
        </Button>
      )}
    </div>
  );
}

/* =============================================================================
   UTILITY FUNCTIONS
   ============================================================================= */

function formatStatus(status: string) {
  const statusMap: Record<string, string> = {
    open: "Active",
    in_progress: "In Progress",
    pending_hearing: "Pending",
    closed: "Closed",
    archived: "Archived",
  };
  return statusMap[status] || status.replace(/_/g, " ");
}