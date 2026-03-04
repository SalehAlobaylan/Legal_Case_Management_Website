/**
 * File: src/app/(dashboard)/regulations/page.tsx
 * Purpose: Regulations library page with Silah design system.
 *
 * Layout:
 * - Page header with search and Discover New button
 * - Stats overview
 * - Category filter pills (horizontal scroll)
 * - Regulations grid (responsive)
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Globe,
  BookOpen,
  ChevronRight,
  Calendar,
  Bell,
  Loader2,
  AlertCircle,
  Scale,
  Clock3,
  Gavel,
  Hash,
} from "lucide-react";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { useRegulations, useSyncMojSource } from "@/lib/hooks/use-regulations";
import { useI18n } from "@/lib/hooks/use-i18n";
import { formatDate } from "@/lib/utils/format";
import { Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/* ── Status color helper ── */
const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  amended: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  in_progress: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  repealed: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", border: "border-rose-200" },
  draft: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", border: "border-slate-200" },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status.toLowerCase()] || STATUS_STYLES.draft;
}

export default function RegulationsPage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const CATEGORIES = [
    "All",
    "labor_law",
    "commercial_law",
    "civil_law",
    "criminal_law",
    "procedural_law",
  ];

  const CATEGORY_LABELS: Record<string, string> = {
    All: t("common.all"),
    labor_law: t("regulations.categories.labor"),
    commercial_law: t("regulations.categories.commercial"),
    civil_law: t("regulations.categories.civil"),
    criminal_law: t("regulations.categories.criminal"),
    procedural_law: t("regulations.categories.administrative"),
  };

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: regulationsData, isLoading, error, refetch } = useRegulations({
    category: activeFilter !== "All" ? activeFilter : undefined,
    search: debouncedSearch || undefined,
  });
  const syncMojSource = useSyncMojSource();

  const regulations = regulationsData?.regulations || [];

  const getApiErrorMessage = (error: unknown): string => {
    if (!error || typeof error !== "object") {
      return t("regulations.syncFailed");
    }

    const candidate = error as {
      response?: { data?: { message?: string; error?: string } };
      message?: string;
    };
    return (
      candidate.response?.data?.message ||
      candidate.response?.data?.error ||
      candidate.message ||
      t("regulations.syncFailed")
    );
  };

  // Apply local filtering to mock data
  const filteredRegulations = regulations.filter((reg) => {
    if (activeFilter !== "All" && reg.category?.toLowerCase() !== activeFilter.toLowerCase()) {
      return false;
    }
    if (debouncedSearch) {
      return reg.title.toLowerCase().includes(debouncedSearch.toLowerCase());
    }
    return true;
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: t("regulations.statuses.active"),
      amended: t("regulations.statuses.amended"),
      repealed: t("regulations.statuses.repealed"),
      draft: t("regulations.statuses.draft"),
      in_progress: t("regulations.statuses.review"),
    };
    return labels[status.toLowerCase()] || status.toUpperCase();
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
        title={t("regulations.unableToLoad")}
        variant="error"
        action={{
          label: t("common.retry"),
          onClick: () => refetch(),
        }}
      />
    );
  }

  // Compute quick stats
  const totalCount = filteredRegulations.length;
  const activeCount = filteredRegulations.filter((r) => r.status?.toLowerCase() === "active").length;
  const amendedCount = filteredRegulations.filter((r) => r.status?.toLowerCase() === "amended").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
            {t("regulations.title")}
          </h1>
          <p className="text-slate-500 mt-2">
            {t("regulations.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#D97706] transition-colors`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("regulations.searchRegulations")}
              className={cn(
                "py-2.5 rounded-xl",
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                "border border-slate-200 bg-white",
                "text-sm w-64",
                "focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20",
                "transition-all shadow-sm"
              )}
            />
          </div>

          {/* Discover New Button */}
          <Button
            className="bg-[#D97706] hover:bg-[#B45309] text-white px-4 py-2.5 h-auto rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 flex items-center gap-2 transition-all"
            onClick={() =>
              syncMojSource.mutate(
                { extractContent: true, runInBackground: true },
                {
                  onSuccess: () => {
                    refetch();
                    toast({
                      title: t("common.success"),
                      description: t("regulations.syncStarted"),
                    });
                  },
                  onError: (error) => {
                    toast({
                      title: t("common.error"),
                      description: getApiErrorMessage(error),
                    });
                  },
                }
              )
            }
            disabled={syncMojSource.isPending}
          >
            {syncMojSource.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            {t("regulations.discoverNew")}
          </Button>

          {/* Filter Button */}
          <Button variant="secondary" className="bg-[#0F2942] hover:bg-[#1E3A56] text-white px-4 py-2.5 h-auto rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
            <Filter className="h-4 w-4" />
            {t("common.filter")}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#0F2942]/5 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-[#0F2942]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0F2942]">{totalCount}</p>
            <p className="text-xs text-slate-500 font-medium">{t("regulations.title")}</p>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Scale className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
            <p className="text-xs text-emerald-600 font-medium">{t("regulations.statuses.active")}</p>
          </div>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Gavel className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{amendedCount}</p>
            <p className="text-xs text-amber-600 font-medium">{t("regulations.statuses.amended")}</p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <FilterPills className="pb-2">
        {CATEGORIES.map((cat) => (
          <FilterPill
            key={cat}
            active={activeFilter === cat}
            onClick={() => setActiveFilter(cat)}
          >
            {CATEGORY_LABELS[cat] || cat}
          </FilterPill>
        ))}
      </FilterPills>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filteredRegulations.length} {filteredRegulations.length === 1 ? "regulation" : "regulations"} found
        </p>
      </div>

      {/* Regulations Grid or Empty State */}
      {filteredRegulations.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t("regulations.noRegulations")}
          description={t("regulations.noRegulationsDesc")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRegulations.map((reg) => (
            <RegulationCard
              key={reg.id}
              regulation={reg}
              onClick={() => router.push(`/regulations/${reg.id}`)}
              t={t}
              isRTL={isRTL}
              getStatusLabel={getStatusLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   REGULATION CARD COMPONENT — Enhanced
   ============================================================================= */

interface RegulationCardProps {
  regulation: {
    id: number;
    title: string;
    category?: string;
    status: string;
    updatedAt: string;
    regulationNumber?: string;
    description?: string;
    summary?: string;
    versionsCount?: number;
    subscribed?: boolean;
    sourceProvider?: string;
    jurisdiction?: string;
  };
  onClick: () => void;
  t: (key: string) => string;
  isRTL: boolean;
  getStatusLabel: (status: string) => string;
}

function RegulationCard({ regulation, onClick, t, isRTL, getStatusLabel }: RegulationCardProps) {
  const { title, status, updatedAt, description, summary, versionsCount, subscribed, regulationNumber, category, sourceProvider } = regulation;
  const preview = description || summary;
  const statusStyle = getStatusStyle(status);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl overflow-hidden",
        "border border-slate-200 shadow-sm",
        "hover:shadow-xl hover:border-[#D97706]/40 hover:-translate-y-1",
        "transition-all duration-200 cursor-pointer group",
        "flex flex-col h-full"
      )}
    >
      {/* Status Strip on top */}
      <div className={cn("h-1", statusStyle.dot === "bg-emerald-500" ? "bg-emerald-500" : statusStyle.dot === "bg-amber-500" ? "bg-amber-500" : statusStyle.dot === "bg-rose-500" ? "bg-rose-500" : "bg-slate-300")} />

      <div className="p-5 flex flex-col h-full">
        {/* Header: icon + status + bell */}
        <div className="flex justify-between items-start mb-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-[#0F2942]/5 text-[#0F2942]",
              "group-hover:bg-[#D97706] group-hover:text-white transition-colors duration-200"
            )}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            {/* Subscription Bell */}
            {subscribed && (
              <div className="p-1.5 rounded-lg bg-[#D97706]/10 text-[#D97706]">
                <Bell className="h-3.5 w-3.5" />
              </div>
            )}
            {/* Status Badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                statusStyle.bg, statusStyle.text, statusStyle.border, "border"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
              {getStatusLabel(status)}
            </span>
          </div>
        </div>

        {/* Regulation Number */}
        {regulationNumber && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Hash className="h-3 w-3 text-slate-400" />
            <span className="text-xs font-mono text-slate-400">{regulationNumber}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-bold text-[#0F2942] mb-2 group-hover:text-[#D97706] transition-colors leading-snug line-clamp-2">
          {title}
        </h3>

        {/* Preview */}
        {preview && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed">
            {preview}
          </p>
        )}

        {/* Tags Row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {category && (
            <span className="inline-flex items-center bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-semibold">
              {category}
            </span>
          )}
          {sourceProvider && (
            <span className="inline-flex items-center bg-sky-50 text-sky-600 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-sky-100">
              {sourceProvider}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(updatedAt)}
          </div>
          {typeof versionsCount === "number" && versionsCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] group-hover:underline">
              <Clock3 className="h-3 w-3" />
              {versionsCount} {t("regulations.versions")}
              <ChevronRight className={cn("h-3.5 w-3.5 group-hover:translate-x-1 transition-transform", isRTL && "rotate-180")} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
