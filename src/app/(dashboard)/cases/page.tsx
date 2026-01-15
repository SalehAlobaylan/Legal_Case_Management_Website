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
import { type Case, CaseType, CaseStatus } from "@/lib/types/case";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Active" },
  { id: "in_progress", label: "Review" },
  { id: "pending_hearing", label: "Draft" },
  { id: "closed", label: "Closed" },
];

// Mock cases matching target mockup
const MOCK_CASES: Case[] = [
  {
    id: 1,
    organization_id: 1,
    title: "Al-Amoudi vs. TechSolutions Ltd",
    case_number: "C-2024-001",
    case_type: CaseType.LABOR,
    status: CaseStatus.OPEN,
    created_at: "2024-12-01",
    updated_at: "2024-12-25",
  },
  {
    id: 2,
    organization_id: 1,
    title: "Estate of Sheikh H. Al-Rahman",
    case_number: "C-2024-002",
    case_type: CaseType.CIVIL,
    status: CaseStatus.IN_PROGRESS,
    created_at: "2024-11-15",
    updated_at: "2024-12-24",
  },
  {
    id: 3,
    organization_id: 1,
    title: "Construction Liability Case",
    case_number: "C-2024-003",
    case_type: CaseType.COMMERCIAL,
    status: CaseStatus.PENDING_HEARING,
    created_at: "2024-10-20",
    updated_at: "2024-12-20",
  },
  {
    id: 4,
    organization_id: 1,
    title: "StartUp Inc. IP Infringement",
    case_number: "C-2024-004",
    case_type: CaseType.COMMERCIAL,
    status: CaseStatus.OPEN,
    created_at: "2024-09-10",
    updated_at: "2024-12-18",
  },
  {
    id: 5,
    organization_id: 1,
    title: "Al-Fulani Real Estate Dispute",
    case_number: "C-2024-005",
    case_type: CaseType.CIVIL,
    status: CaseStatus.CLOSED,
    created_at: "2024-08-01",
    updated_at: "2024-11-30",
  },
  {
    id: 6,
    organization_id: 1,
    title: "Global Corp Merger Review",
    case_number: "C-2024-006",
    case_type: CaseType.COMMERCIAL,
    status: CaseStatus.IN_PROGRESS,
    created_at: "2024-07-15",
    updated_at: "2024-12-15",
  },
];

export default function CasesPage() {
  const router = useRouter();
  const { data: cases, isLoading, error } = useCases();
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Use mock data if API returns nothing
  const displayCases = (cases && cases.length > 0) ? cases : MOCK_CASES;

  const filteredCases = React.useMemo(() => {
    if (!displayCases) return [];

    return displayCases.filter((case_) => {
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
  }, [displayCases, statusFilter, searchTerm]);

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
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Case Details
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
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
      <td className="px-6 py-4 text-right">
        <button
          className="text-slate-400 hover:text-[#0F2942] p-2 hover:bg-white rounded-full transition-colors"
        >
          <ChevronRight className="h-[18px] w-[18px]" />
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