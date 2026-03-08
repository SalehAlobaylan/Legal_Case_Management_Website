/**
 * File: src/app/(dashboard)/cases/page.tsx
 * Purpose: Cases management page — redesigned with horizontal rich cards,
 *          status pipeline, enhanced search/filter, and inline previews.
 *
 * Design differentiation from /regulations:
 * - Horizontal card list (not 3-col grid)
 * - Status pipeline bar (kanban-style counts)
 * - Warm color palette with amber/gold accents, minimal blue
 * - Inline data preview (description, client, court, dates)
 * - Quick action buttons on each card
 * - View toggle (cards vs compact list)
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ChevronRight,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  Clock,
  Edit2,
  Sparkles,
  LayoutList,
  LayoutGrid,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  Briefcase,
} from "lucide-react";
import { useCases } from "@/lib/hooks/use-cases";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { type Case, CaseType, CaseStatus } from "@/lib/types/case";
import { formatDate } from "@/lib/utils/format";

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ═══════════════════════════════════════════════════════════════════ */

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; dot: string; accent: string }
> = {
  open: {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    accent: "border-l-emerald-500",
  },
  in_progress: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    accent: "border-l-amber-500",
  },
  pending_hearing: {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
    accent: "border-l-orange-500",
  },
  closed: {
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "bg-slate-400",
    accent: "border-l-slate-400",
  },
  archived: {
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-300",
    accent: "border-l-slate-300",
  },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.closed;
}

const CASE_TYPE_ICONS: Record<string, string> = {
  general: "⚖️",
  criminal: "🔒",
  personal_status: "👨‍👩‍👧",
  commercial: "🏢",
  labor: "👷",
  administrative: "🏛️",
  enforcement: "📋",
};

type SortKey = "updated" | "created" | "title" | "status";
type SortDir = "asc" | "desc";

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function CasesPage() {
  const router = useRouter();
  const { data: cases, isLoading, error, refetch } = useCases();
  const { t, isRTL } = useI18n();

  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"cards" | "compact">("cards");
  const [sortKey, setSortKey] = React.useState<SortKey>("updated");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Status labels
  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      open: t("cases.statuses.open"),
      in_progress: t("cases.statuses.in_progress"),
      pending_hearing: t("cases.statuses.pending_hearing"),
      closed: t("cases.statuses.closed"),
      archived: t("cases.statuses.archived"),
    };
    return map[status] || status;
  };

  const formatCaseType = (caseType: string) => {
    const map: Record<string, string> = {
      general: t("cases.types.general"),
      criminal: t("cases.types.criminal"),
      personal_status: t("cases.types.personal_status"),
      commercial: t("cases.types.commercial"),
      labor: t("cases.types.labor"),
      administrative: t("cases.types.administrative"),
      enforcement: t("cases.types.enforcement"),
    };
    return map[caseType] || caseType?.replace(/_/g, " ") || t("cases.types.general");
  };

  // Filter + Sort
  const filteredCases = React.useMemo(() => {
    if (!cases) return [];

    let result = cases.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (typeFilter !== "all" && c.case_type !== typeFilter) return false;
      if (debouncedSearch) {
        const s = debouncedSearch.toLowerCase();
        return (
          c.title?.toLowerCase().includes(s) ||
          c.case_number?.toLowerCase().includes(s) ||
          c.description?.toLowerCase().includes(s) ||
          c.client_info?.toLowerCase().includes(s)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "updated":
          cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "created":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [cases, statusFilter, typeFilter, debouncedSearch, sortKey, sortDir]);

  // Pipeline counts
  const counts = React.useMemo(() => {
    if (!cases) return { all: 0, open: 0, in_progress: 0, pending_hearing: 0, closed: 0 };
    return {
      all: cases.length,
      open: cases.filter((c) => c.status === "open").length,
      in_progress: cases.filter((c) => c.status === "in_progress").length,
      pending_hearing: cases.filter((c) => c.status === "pending_hearing").length,
      closed: cases.filter((c) => c.status === "closed").length,
    };
  }, [cases]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
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
      <EmptyState
        icon={AlertCircle}
        title={t("cases.unableToLoad")}
        variant="error"
        action={{ label: t("common.retry"), onClick: () => refetch() }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
            {t("cases.title")}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">{t("cases.subtitle")}</p>
        </div>
        <Button
          onClick={() => router.push("/cases/new")}
          className="bg-[#D97706] hover:bg-[#B45309] text-white px-5 py-2.5 h-auto rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 font-bold flex items-center gap-2 transition-all text-sm"
        >
          <Plus className="h-4 w-4" />
          {t("cases.newCase")}
        </Button>
      </div>

      {/* ── Status Pipeline ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {([
          { key: "all", label: t("cases.filters.all"), count: counts.all, color: "slate" },
          { key: "open", label: t("cases.statuses.open"), count: counts.open, color: "emerald" },
          { key: "in_progress", label: t("cases.statuses.in_progress"), count: counts.in_progress, color: "amber" },
          { key: "pending_hearing", label: t("cases.statuses.pending_hearing"), count: counts.pending_hearing, color: "orange" },
          { key: "closed", label: t("cases.statuses.closed"), count: counts.closed, color: "slate" },
        ] as const).map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={cn(
              "relative rounded-xl px-4 py-3 text-left transition-all border",
              statusFilter === item.key
                ? item.color === "emerald"
                  ? "bg-emerald-50 border-emerald-300 shadow-sm"
                  : item.color === "amber"
                    ? "bg-amber-50 border-amber-300 shadow-sm"
                    : item.color === "orange"
                      ? "bg-orange-50 border-orange-300 shadow-sm"
                      : "bg-white border-slate-300 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
            )}
          >
            <p className={cn(
              "text-2xl font-bold tabular-nums leading-none",
              statusFilter === item.key
                ? item.color === "emerald"
                  ? "text-emerald-700"
                  : item.color === "amber"
                    ? "text-amber-700"
                    : item.color === "orange"
                      ? "text-orange-700"
                      : "text-[#1a1a1a]"
                : "text-[#1a1a1a]"
            )}>
              {item.count}
            </p>
            <p className="text-[11px] font-medium text-slate-500 mt-1">{item.label}</p>
            {statusFilter === item.key && (
              <div className={cn(
                "absolute bottom-0 left-3 right-3 h-0.5 rounded-full",
                item.color === "emerald" ? "bg-emerald-500"
                  : item.color === "amber" ? "bg-amber-500"
                    : item.color === "orange" ? "bg-orange-500"
                      : "bg-[#D97706]"
              )} />
            )}
          </button>
        ))}
      </div>

      {/* ── Toolbar: Search + Type Filter + Sort + View Toggle ── */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-sm group">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#D97706] transition-colors",
            isRTL ? "right-3" : "left-3"
          )} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("cases.searchCases")}
            className={cn(
              "w-full py-2.5 rounded-xl border border-slate-200 bg-white text-sm",
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
              "focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20",
              "transition-all shadow-sm"
            )}
          />
        </div>

        {/* Type filter dropdown */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 shadow-sm cursor-pointer"
        >
          <option value="all">{t("cases.filters.all")} {t("cases.type")}</option>
          {Object.values(CaseType).map((ct) => (
            <option key={ct} value={ct}>
              {CASE_TYPE_ICONS[ct] || "⚖️"} {formatCaseType(ct)}
            </option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1 shadow-sm">
          {([
            { key: "updated" as SortKey, label: isRTL ? "تحديث" : "Updated" },
            { key: "created" as SortKey, label: isRTL ? "إنشاء" : "Created" },
            { key: "title" as SortKey, label: isRTL ? "عنوان" : "Title" },
          ]).map((s) => (
            <button
              key={s.key}
              onClick={() => toggleSort(s.key)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1",
                sortKey === s.key
                  ? "bg-[#D97706]/10 text-[#D97706]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              {s.label}
              {sortKey === s.key && (
                sortDir === "desc"
                  ? <SortDesc className="h-3 w-3" />
                  : <SortAsc className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1 shadow-sm">
          <button
            onClick={() => setViewMode("cards")}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              viewMode === "cards" ? "bg-[#D97706]/10 text-[#D97706]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("compact")}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              viewMode === "compact" ? "bg-[#D97706]/10 text-[#D97706]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium">
          {filteredCases.length} {filteredCases.length === 1 ? (isRTL ? "قضية" : "case") : (isRTL ? "قضايا" : "cases")}
          {statusFilter !== "all" && (
            <span className="text-[#D97706] ml-1">
              • {formatStatus(statusFilter)}
            </span>
          )}
        </p>
        {(statusFilter !== "all" || typeFilter !== "all" || debouncedSearch) && (
          <button
            onClick={() => {
              setStatusFilter("all");
              setTypeFilter("all");
              setSearchTerm("");
            }}
            className="text-xs text-[#D97706] font-bold hover:underline"
          >
            {isRTL ? "مسح الفلاتر" : "Clear filters"}
          </button>
        )}
      </div>

      {/* ── Cases List / Empty ── */}
      {filteredCases.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={debouncedSearch ? t("cases.noResultsFound") : t("cases.noCases")}
          description={debouncedSearch ? t("cases.adjustFilters") : t("cases.noCasesDesc")}
          action={
            !debouncedSearch
              ? { label: t("cases.createCase"), onClick: () => router.push("/cases/new") }
              : undefined
          }
        />
      ) : viewMode === "cards" ? (
        <div className="space-y-3">
          {filteredCases.map((c) => (
            <CaseCard
              key={c.id}
              case_={c}
              formatStatus={formatStatus}
              formatCaseType={formatCaseType}
              isRTL={isRTL}
              onView={() => router.push(`/cases/${c.id}`)}
              onEdit={() => router.push(`/cases/${c.id}/edit`)}
              onLinkStudio={() => router.push(`/cases/${c.id}/linking`)}
            />
          ))}
        </div>
      ) : (
        <CompactTable
          cases={filteredCases}
          formatStatus={formatStatus}
          formatCaseType={formatCaseType}
          isRTL={isRTL}
          onView={(id) => router.push(`/cases/${id}`)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CASE CARD — Rich horizontal card with inline data preview
   ═══════════════════════════════════════════════════════════════════ */

interface CaseCardProps {
  case_: Case;
  formatStatus: (s: string) => string;
  formatCaseType: (s: string) => string;
  isRTL: boolean;
  onView: () => void;
  onEdit: () => void;
  onLinkStudio: () => void;
}

function CaseCard({ case_, formatStatus, formatCaseType, isRTL, onView, onEdit, onLinkStudio }: CaseCardProps) {
  const sc = getStatusConfig(case_.status);
  const typeEmoji = CASE_TYPE_ICONS[case_.case_type] || "⚖️";

  return (
    <div
      onClick={onView}
      className={cn(
        "bg-white rounded-2xl border border-slate-200 overflow-hidden",
        "hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5",
        "transition-all duration-200 cursor-pointer group",
        "border-l-4",
        sc.accent
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Main content */}
        <div className="flex-1 p-5">
          {/* Top row: type emoji + title + number */}
          <div className="flex items-start gap-3">
            <div className="text-xl leading-none mt-0.5 shrink-0">{typeEmoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#1a1a1a] group-hover:text-[#D97706] transition-colors leading-snug">
                  {case_.title}
                </h3>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  sc.bg, sc.color, sc.border
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                  {formatStatus(case_.status)}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs font-mono text-slate-400">#{case_.case_number}</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formatCaseType(case_.case_type)}
                </span>
              </div>
            </div>
          </div>

          {/* Description preview */}
          {case_.description && (
            <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {case_.description}
            </p>
          )}

          {/* Metadata chips */}
          <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-slate-500">
            {case_.client_info && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3 w-3 text-slate-400" />
                <span className="font-medium truncate max-w-32">{case_.client_info}</span>
              </span>
            )}
            {case_.court_jurisdiction && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span className="font-medium truncate max-w-32">{case_.court_jurisdiction}</span>
              </span>
            )}
            {case_.filing_date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span className="font-medium">{formatDate(case_.filing_date)}</span>
              </span>
            )}
            {case_.next_hearing && (
              <span className="inline-flex items-center gap-1.5 text-[#D97706]">
                <Clock className="h-3 w-3" />
                <span className="font-bold">{formatDate(case_.next_hearing)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right side: actions + last updated */}
        <div className="sm:w-48 shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 px-5 py-3 sm:py-5 border-t sm:border-t-0 sm:border-l border-slate-100 bg-slate-50/50">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              {isRTL ? "آخر تحديث" : "Updated"}
            </p>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {formatDate(case_.updated_at)}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-lg text-slate-400 hover:text-[#D97706] hover:bg-[#D97706]/10 transition-colors"
              title={isRTL ? "تعديل" : "Edit"}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onLinkStudio(); }}
              className="p-2 rounded-lg text-slate-400 hover:text-[#D97706] hover:bg-[#D97706]/10 transition-colors"
              title={isRTL ? "ربط بالأنظمة" : "Link Studio"}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onView(); }}
              className="p-2 rounded-lg text-slate-400 hover:text-[#1a1a1a] hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPACT TABLE — Denser view for power users
   ═══════════════════════════════════════════════════════════════════ */

interface CompactTableProps {
  cases: Case[];
  formatStatus: (s: string) => string;
  formatCaseType: (s: string) => string;
  isRTL: boolean;
  onView: (id: number) => void;
}

function CompactTable({ cases, formatStatus, formatCaseType, isRTL, onView }: CompactTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50/80 border-b border-slate-200">
          <tr>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? "القضية" : "Case"}
            </th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">
              {isRTL ? "العميل" : "Client"}
            </th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? "النوع" : "Type"}
            </th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? "الحالة" : "Status"}
            </th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
              {isRTL ? "آخر تحديث" : "Updated"}
            </th>
            <th className="px-5 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {cases.map((c) => {
            const sc = getStatusConfig(c.status);
            return (
              <tr
                key={c.id}
                onClick={() => onView(c.id)}
                className="hover:bg-amber-50/30 transition-colors cursor-pointer group"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{CASE_TYPE_ICONS[c.case_type] || "⚖️"}</span>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#D97706] transition-colors truncate max-w-xs">
                        {c.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">#{c.case_number}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className="text-xs text-slate-600 truncate max-w-28 block">
                    {c.client_info || "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {formatCaseType(c.case_type)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    sc.bg, sc.color, sc.border
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                    {formatStatus(c.status)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500 hidden sm:table-cell">
                  {formatDate(c.updated_at)}
                </td>
                <td className="px-5 py-3.5">
                  <ChevronRight className={cn("h-4 w-4 text-slate-300 group-hover:text-[#D97706] transition-colors", isRTL && "rotate-180")} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}