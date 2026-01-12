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
  Filter,
} from "lucide-react";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

// Mock data for regulations
const MOCK_REGULATIONS = [
  {
    id: "R-001",
    title: "Saudi Labor Law",
    category: "Labor",
    status: "Active",
    lastUpdated: "Dec 1, 2024",
    description: "Comprehensive labor regulations governing employment relationships, worker rights, and employer obligations in the Kingdom of Saudi Arabia.",
    versionsCount: 5,
    isSubscribed: true,
  },
  {
    id: "R-002",
    title: "Commercial Registration Law",
    category: "Commercial",
    status: "Active",
    lastUpdated: "Nov 15, 2024",
    description: "Regulations for business registration, commercial licenses, and corporate governance requirements.",
    versionsCount: 3,
    isSubscribed: false,
  },
  {
    id: "R-003",
    title: "Civil Transactions Law",
    category: "Civil",
    status: "Amended",
    lastUpdated: "Oct 28, 2024",
    description: "Laws governing civil contracts, property rights, and personal status matters.",
    versionsCount: 7,
    isSubscribed: true,
  },
  {
    id: "R-004",
    title: "Digital Economy Law",
    category: "Digital",
    status: "Active",
    lastUpdated: "Sep 20, 2024",
    description: "Framework for e-commerce, digital signatures, and electronic transactions.",
    versionsCount: 2,
    isSubscribed: false,
  },
  {
    id: "R-005",
    title: "Criminal Procedure Law",
    category: "Criminal",
    status: "Active",
    lastUpdated: "Aug 15, 2024",
    description: "Procedures for criminal investigations, prosecutions, and judicial proceedings.",
    versionsCount: 4,
    isSubscribed: false,
  },
  {
    id: "R-006",
    title: "Anti-Fraud Regulations",
    category: "Criminal",
    status: "Amended",
    lastUpdated: "Jul 10, 2024",
    description: "Regulations addressing financial fraud, embezzlement, and white-collar crimes.",
    versionsCount: 2,
    isSubscribed: true,
  },
];

const CATEGORIES = ["All", "Labor", "Commercial", "Civil", "Digital", "Criminal"];

export default function RegulationsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredRegs = React.useMemo(() => {
    return MOCK_REGULATIONS.filter((reg) => {
      const matchesCategory = activeFilter === "All" || reg.category === activeFilter;
      const matchesSearch =
        !searchTerm ||
        reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

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
            {cat}
          </FilterPill>
        ))}
      </FilterPills>

      {/* Regulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRegs.map((reg) => (
          <RegulationCard
            key={reg.id}
            regulation={reg}
            onClick={() => router.push(`/regulations/${reg.id}`)}
          />
        ))}
      </div>

      {filteredRegs.length === 0 && (
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
    id: string;
    title: string;
    category: string;
    status: string;
    lastUpdated: string;
    description: string;
    versionsCount: number;
    isSubscribed: boolean;
  };
  onClick: () => void;
}

function RegulationCard({ regulation, onClick }: RegulationCardProps) {
  const { title, status, lastUpdated, description, versionsCount, isSubscribed } = regulation;

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
          {isSubscribed && (
            <span className="text-[#D97706] bg-orange-50 p-1 rounded-md" title="Subscribed">
              <Bell className="h-3.5 w-3.5 fill-[#D97706]" />
            </span>
          )}
          <span
            className={cn(
              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
              status === "Active"
                ? "bg-green-50 text-green-700"
                : "bg-orange-50 text-[#D97706]"
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
      <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {lastUpdated}
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-[#0F2942]">
          {versionsCount} Versions
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
