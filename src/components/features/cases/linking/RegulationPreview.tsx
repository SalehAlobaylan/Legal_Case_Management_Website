/**
 * File: src/components/features/cases/linking/RegulationPreview.tsx
 * Purpose: Full regulation text viewer with highlighted matched lines.
 * Used by: LinkDetailPanel in the Case Linking Studio.
 */

"use client";

import * as React from "react";
import {
    ChevronDown,
    ChevronUp,
    ExternalLink,
    FileText,
    Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import type { LinkLineMatch } from "@/lib/types/case";

interface RegulationPreviewProps {
    regulationId: number;
    regulationTitle: string;
    regulationNumber?: string;
    sourceUrl?: string;
    lineMatches?: LinkLineMatch[];
    className?: string;
}

interface RegulationVersionData {
    id: number;
    regulationId: number;
    versionNumber: number;
    contentText: string;
    effectiveDate?: string;
}

function useLatestRegulationVersion(regulationId: number) {
    return useQuery({
        queryKey: ["regulation-version-latest", regulationId],
        queryFn: async () => {
            const { data } = await apiClient.get<{
                versions: RegulationVersionData[];
            }>(`/api/regulations/${regulationId}/versions`);
            // Return the latest version (first in the array, ordered by version number desc)
            return data.versions?.[0] || null;
        },
        enabled: !!regulationId,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
}

function getHighlightedLineRanges(lineMatches: LinkLineMatch[]): Set<number> {
    const highlighted = new Set<number>();
    for (const match of lineMatches) {
        const start =
            typeof match.line_start === "number" ? match.line_start : null;
        const end = typeof match.line_end === "number" ? match.line_end : start;
        if (start !== null && end !== null) {
            for (let i = start; i <= end; i++) {
                highlighted.add(i);
            }
        }
    }
    return highlighted;
}

export function RegulationPreview({
    regulationId,
    regulationTitle,
    regulationNumber,
    sourceUrl,
    lineMatches = [],
    className,
}: RegulationPreviewProps) {
    const { t } = useI18n();
    const [isExpanded, setIsExpanded] = React.useState(false);
    const {
        data: version,
        isLoading,
        error,
    } = useLatestRegulationVersion(regulationId);

    const highlightedLines = React.useMemo(
        () => getHighlightedLineRanges(lineMatches),
        [lineMatches]
    );

    const contentLines = version?.contentText ? version.contentText.split("\n") : [];

    const displayLines = isExpanded ? contentLines : contentLines.slice(0, 30);
    const hasMore = contentLines.length > 30;

    return (
        <div
            className={cn(
                "rounded-xl border border-slate-200 bg-white overflow-hidden",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-[#0F2942] shrink-0" />
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#0F2942] truncate">
                            {regulationTitle}
                        </h4>
                        {regulationNumber && (
                            <p className="text-[10px] text-slate-500">{regulationNumber}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {version && (
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                            v{version.versionNumber}
                        </span>
                    )}
                    {sourceUrl && (
                        <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-[#0F2942] transition-colors"
                            title={t("ai.openSource")}
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-h-[500px] overflow-y-auto">
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-5 w-5 animate-spin text-[#D97706] mr-2" />
                        <span className="text-sm text-slate-500">
                            {t("ai.loadingRegulationText")}
                        </span>
                    </div>
                )}

                {error && (
                    <div className="text-center py-8 px-4">
                        <p className="text-sm text-red-600 font-medium">
                            {t("ai.unableToLoadRegulationContent")}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {t("ai.regulationTextMayNotBeAvailable")}
                        </p>
                    </div>
                )}

                {!isLoading && !error && contentLines.length === 0 && (
                    <div className="text-center py-8 px-4">
                        <p className="text-sm text-slate-500 font-medium">
                            {t("regulations.noContentAvailable")}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {t("ai.noExtractedTextContent")}
                        </p>
                    </div>
                )}

                {!isLoading && contentLines.length > 0 && (
                    <div className="text-sm font-mono">
                        {displayLines.map((line, index) => {
                            const lineNumber = index + 1;
                            const isHighlighted = highlightedLines.has(lineNumber);

                            return (
                                <div
                                    key={lineNumber}
                                    className={cn(
                                        "flex border-b border-slate-50 hover:bg-slate-50/50 transition-colors",
                                        isHighlighted &&
                                        "bg-amber-50 border-l-4 border-l-[#D97706] hover:bg-amber-100/50"
                                    )}
                                >
                                    <span className="px-3 py-1 text-[10px] text-slate-400 select-none shrink-0 w-12 text-right tabular-nums border-r border-slate-100">
                                        {lineNumber}
                                    </span>
                                    <span
                                        className={cn(
                                            "px-3 py-1 text-xs leading-relaxed flex-1 whitespace-pre-wrap break-words",
                                            isHighlighted
                                                ? "text-[#0F2942] font-medium"
                                                : "text-slate-600"
                                        )}
                                        dir="auto"
                                    >
                                        {line || "\u00A0"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Show more / less */}
                {hasMore && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-center gap-1 py-2.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] bg-slate-50 border-t border-slate-200 hover:bg-orange-50 transition-colors"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-3.5 w-3.5" />
                                {t("ai.showLess")}
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-3.5 w-3.5" />
                                {t("ai.showAllLines", { count: contentLines.length })}
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Highlight legend */}
            {highlightedLines.size > 0 && (
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
                    <div className="h-3 w-1 bg-[#D97706] rounded-full" />
                    <span className="text-[10px] font-semibold text-amber-700">
                        {t("ai.linesMatchedWithCase", { count: highlightedLines.size })}
                    </span>
                </div>
            )}
        </div>
    );
}
