/**
 * File: src/components/features/cases/linking/LinkListSidebar.tsx
 * Purpose: Sidebar component showing all AI links with filter/sort controls and selection.
 * Used by: Case Linking Studio page.
 */

"use client";

import * as React from "react";
import {
    Search,
    SlidersHorizontal,
    CheckCircle,
    Clock,
    AlertTriangle,
    Filter,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CaseRegulationLink } from "@/lib/types/case";

type FilterType = "all" | "pending" | "verified";
type SortType = "score" | "date";

interface LinkListSidebarProps {
    links: CaseRegulationLink[];
    selectedLinkId: number | null;
    onSelectLink: (linkId: number) => void;
    className?: string;
}

function normalizeSimilarityScore(link: CaseRegulationLink): number {
    const rawScore = link.similarity_score ?? link.similarityScore ?? 0;
    const score =
        typeof rawScore === "number" ? rawScore : Number.parseFloat(rawScore);
    if (Number.isNaN(score)) return 0;
    if (score > 1) return Math.max(0, Math.min(1, score / 100));
    return Math.max(0, Math.min(1, score));
}

function getLinkRegulationTitle(link: CaseRegulationLink): string {
    const id = link.regulation_id ?? link.regulationId;
    return (
        link.regulation?.title ||
        (id ? `Regulation #${id}` : "Regulation")
    );
}

export function LinkListSidebar({
    links,
    selectedLinkId,
    onSelectLink,
    className,
}: LinkListSidebarProps) {
    const [filter, setFilter] = React.useState<FilterType>("all");
    const [sort, setSort] = React.useState<SortType>("score");
    const [searchQuery, setSearchQuery] = React.useState("");

    // Filter links
    const filteredLinks = React.useMemo(() => {
        let result = [...links];

        // Apply filter
        if (filter === "pending") {
            result = result.filter((l) => !l.verified);
        } else if (filter === "verified") {
            result = result.filter((l) => l.verified);
        }

        // Apply search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (l) =>
                    getLinkRegulationTitle(l).toLowerCase().includes(q) ||
                    (l.regulation?.regulation_number || "").toLowerCase().includes(q) ||
                    (l.regulation?.regulationNumber || "").toLowerCase().includes(q)
            );
        }

        // Apply sort
        result.sort((a, b) => {
            if (sort === "score") {
                return normalizeSimilarityScore(b) - normalizeSimilarityScore(a);
            }
            return (
                new Date(b.created_at || b.createdAt || 0).getTime() -
                new Date(a.created_at || a.createdAt || 0).getTime()
            );
        });

        return result;
    }, [links, filter, sort, searchQuery]);

    const pendingCount = links.filter((l) => !l.verified).length;
    const verifiedCount = links.filter((l) => l.verified).length;

    const filterButtons: { key: FilterType; label: string; count: number }[] = [
        { key: "all", label: "All", count: links.length },
        { key: "pending", label: "Pending", count: pendingCount },
        { key: "verified", label: "Verified", count: verifiedCount },
    ];

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-white border-r border-slate-200",
                className
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0F2942]">Regulation Links</h3>
                    <span className="text-[10px] font-bold bg-[#0F2942]/10 text-[#0F2942] px-2 py-0.5 rounded-md">
                        {links.length} total
                    </span>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search regulations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 outline-none transition-all"
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1">
                    {filterButtons.map((btn) => (
                        <button
                            key={btn.key}
                            onClick={() => setFilter(btn.key)}
                            className={cn(
                                "flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all",
                                filter === btn.key
                                    ? "bg-[#0F2942] text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                        >
                            {btn.label} ({btn.count})
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-1">
                    <SlidersHorizontal className="h-3 w-3 text-slate-400" />
                    <span className="text-[10px] text-slate-500">Sort:</span>
                    <button
                        onClick={() => setSort("score")}
                        className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded transition-colors",
                            sort === "score"
                                ? "bg-[#D97706]/10 text-[#D97706]"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Score
                    </button>
                    <button
                        onClick={() => setSort("date")}
                        className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded transition-colors",
                            sort === "date"
                                ? "bg-[#D97706]/10 text-[#D97706]"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Date
                    </button>
                </div>
            </div>

            {/* Link list */}
            <div className="flex-1 overflow-y-auto">
                {filteredLinks.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <Filter className="h-5 w-5 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">
                            No links match your filters
                        </p>
                    </div>
                ) : (
                    <div className="py-1">
                        {filteredLinks.map((link) => {
                            const confidence = Math.round(
                                normalizeSimilarityScore(link) * 100
                            );
                            const isSelected = selectedLinkId === link.id;
                            const isVerified = link.verified;

                            return (
                                <button
                                    key={link.id}
                                    onClick={() => onSelectLink(link.id)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 border-b border-slate-100 transition-all relative",
                                        isSelected
                                            ? "bg-[#0F2942]/5 border-l-4 border-l-[#D97706]"
                                            : "hover:bg-slate-50 border-l-4 border-l-transparent"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={cn(
                                                    "text-xs font-bold truncate",
                                                    isSelected ? "text-[#0F2942]" : "text-slate-700"
                                                )}
                                            >
                                                {getLinkRegulationTitle(link)}
                                            </p>
                                            {(link.regulation?.regulation_number ||
                                                link.regulation?.regulationNumber) && (
                                                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                                        {link.regulation?.regulation_number ||
                                                            link.regulation?.regulationNumber}
                                                    </p>
                                                )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span
                                                className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums",
                                                    confidence > 90
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : confidence > 70
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-slate-100 text-slate-600"
                                                )}
                                            >
                                                {confidence}%
                                            </span>
                                            {isVerified ? (
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Clock className="h-3 w-3 text-amber-500" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Warnings indicator */}
                                    {(
                                        (link.match_explanation || link.matchExplanation) as
                                        | { warnings?: string[] }
                                        | undefined
                                    )?.warnings?.length ? (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
                                            <span className="text-[9px] text-amber-600">
                                                Has warnings
                                            </span>
                                        </div>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
