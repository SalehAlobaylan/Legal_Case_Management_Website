/**
 * File: src/app/(dashboard)/regulations/page.tsx
 * Purpose: Regulations library page with Madar design system.
 *
 * Layout:
 * - Page header with search and Discover New button
 * - Category filter pills (horizontal scroll)
 * - Regulations grid (3 columns)
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
} from "lucide-react";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useRegulations } from "@/lib/hooks/use-regulations";
import { formatDate } from "@/lib/utils/format";

const CATEGORIES = ["All", "labor", "commercial", "civil", "digital", "criminal"];

const CATEGORY_LABELS: Record<string, string> = {
  All: "All",
  labor: "Labor",
  commercial: "Commercial",
  civil: "Civil",
  digital: "Digital",
  criminal: "Criminal",
};

export default function RegulationsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: regulationsData, isLoading, error } = useRegulations({
    category: activeFilter !== "All" ? activeFilter : undefined,
    search: debouncedSearch || undefined,
  });

  const regulations = regulationsData?.regulations || [];

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
          Unable to load regulations. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
            Regulation Library
          </h1>
          <p className="text-slate-500 mt-2">
            Browse active laws and track legislative history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#D97706]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search regulations..."
              className={cn(
                "pl-10 pr-4 py-2.5 rounded-xl",
                "border border-slate-200 bg-white",
                "text-sm w-64",
                "focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
              )}
            />
          </div>

          {/* Discover New Button */}
          <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-4 py-2.5 h-auto rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Discover New
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <FilterPills className="pb-4">
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

      {/* Regulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regulations.map((reg) => (
          <RegulationCard
            key={reg.id}
            regulation={reg}
            onClick={() => router.push(`/regulations/${reg.id}`)}
          />
        ))}
      </div>

      {regulations.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="font-bold text-lg text-[#0F2942] mb-2">
            No regulations found
          </h3>
          <p className="text-slate-500 text-sm">
            Try adjusting your filters or search term.
          </p>
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   REGULATION CARD COMPONENT
   ============================================================================= */

interface RegulationCardProps {
  regulation: {
    id: number;
    title: string;
    category?: string;
    status: string;
    updatedAt: string;
    regulationNumber?: string;
  };
  onClick: () => void;
}

function RegulationCard({ regulation, onClick }: RegulationCardProps) {
  const { title, status, updatedAt, category, regulationNumber } = regulation;

  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    amended: "bg-orange-50 text-[#D97706]",
    repealed: "bg-red-50 text-red-700",
    draft: "bg-slate-100 text-slate-600",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl p-6",
        "border border-slate-200 shadow-sm",
        "hover:shadow-lg hover:border-[#D97706]/30",
        "transition-all cursor-pointer group",
        "flex flex-col h-full"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-slate-50 text-[#0F2942]",
            "group-hover:bg-[#0F2942] group-hover:text-white transition-colors"
          )}
        >
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
              statusColors[status.toLowerCase()] || "bg-slate-100 text-slate-600"
            )}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-[#0F2942] mb-2 group-hover:text-[#D97706] transition-colors">
        {title}
      </h3>
      {regulationNumber && (
        <p className="text-sm text-slate-500 mb-2">#{regulationNumber}</p>
      )}
      {category && (
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md w-fit mb-4">
          {category}
        </span>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(updatedAt)}
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-[#0F2942]">
          View Details
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
