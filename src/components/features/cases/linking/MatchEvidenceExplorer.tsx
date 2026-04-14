/**
 * File: src/components/features/cases/linking/MatchEvidenceExplorer.tsx
 * Purpose: Display all line matches between a case and regulation as side-by-side comparison cards.
 * Used by: LinkDetailPanel in the Case Linking Studio.
 */

"use client";

import * as React from "react";
import { ArrowRight, FileText, Hash } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import type { LinkLineMatch, LinkEvidence } from "@/lib/types/case";

interface MatchEvidenceExplorerProps {
    lineMatches: LinkLineMatch[];
    documentEvidence: LinkEvidence[];
    className?: string;
}

interface LineMatchCardProps {
    match: LinkLineMatch;
    index: number;
    t: (key: string, values?: Record<string, string | number>) => string;
}

function LineMatchCard({ match, index, t }: LineMatchCardProps) {
    const lineStart =
        typeof match.line_start === "number" ? match.line_start : null;
    const lineEnd = typeof match.line_end === "number" ? match.line_end : null;
    const lineLabel =
        lineStart && lineEnd
            ? `${t("ai.lines")} ${lineStart}-${lineEnd}`
            : lineStart
                ? `${t("ai.lines")} ${lineStart}`
                : null;

    const pairScore = Math.round((match.pair_score || 0) * 100);
    const contribution = Math.round((match.contribution || 0) * 100);

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 transition-colors">
            {/* Match header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {t("ai.matchNumber", { index: index + 1 })}
                    </span>
                    {match.article_ref && (
                        <span className="rounded-md bg-[#0F2942]/10 px-2 py-0.5 text-[10px] font-bold text-[#0F2942]">
                            {match.article_ref}
                        </span>
                    )}
                    {lineLabel && (
                        <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {lineLabel}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">
                        {t("ai.pairScore")}: <span className="text-[#0F2942]">{pairScore}%</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                        {t("ai.weight")}: <span className="text-amber-600">{contribution}%</span>
                    </span>
                </div>
            </div>

            {/* Side-by-side snippets */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {/* Case snippet */}
                <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {t("ai.caseText")}
                        </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {match.case_snippet || "—"}
                    </p>
                </div>

                {/* Regulation snippet */}
                <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            {t("ai.regulationText")}
                        </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {match.regulation_snippet || "—"}
                    </p>
                </div>
            </div>

            {/* Contribution bar */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                        {t("ai.contribution")}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#D97706] rounded-full transition-all duration-500"
                            style={{ width: `${contribution}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-[#D97706] tabular-nums shrink-0">
                        {contribution}%
                    </span>
                </div>
            </div>
        </div>
    );
}

interface DocumentEvidenceCardProps {
    evidence: LinkEvidence;
    t: (key: string, values?: Record<string, string | number>) => string;
}

function DocumentEvidenceCard({ evidence, t }: DocumentEvidenceCardProps) {
    const score = Math.round((evidence.score || 0) * 100);

    return (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#0F2942] truncate">
                    {evidence.document_name || t("ai.documentNumber", { id: evidence.document_id || "?" })}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">
                        {t("ai.fragment")}: <span className="font-mono">{evidence.fragment_id}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] font-bold text-slate-600">
                        {t("ai.source")}: {evidence.source}
                    </span>
                </div>
            </div>
            <div className="text-right shrink-0">
                <span
                    className={cn(
                        "text-xs font-bold tabular-nums",
                        score > 80
                            ? "text-emerald-600"
                            : score > 60
                                ? "text-blue-600"
                                : "text-slate-600"
                    )}
                >
                    {score}%
                </span>
                <p className="text-[10px] text-slate-400">{t("ai.relevance")}</p>
            </div>
        </div>
    );
}

export function MatchEvidenceExplorer({
    lineMatches,
    documentEvidence,
    className,
}: MatchEvidenceExplorerProps) {
    const { t } = useI18n();
    const [showAll, setShowAll] = React.useState(false);
    const displayedMatches = showAll ? lineMatches : lineMatches.slice(0, 5);
    const hasMore = lineMatches.length > 5;

    return (
        <div className={cn("space-y-6", className)}>
            {/* Line Matches */}
            {lineMatches.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-[#0F2942]" />
                            <h4 className="text-sm font-bold text-[#0F2942]">
                                {t("ai.whyThisMatch")}
                            </h4>
                            <span className="text-[10px] font-bold bg-[#0F2942]/10 text-[#0F2942] px-2 py-0.5 rounded-md">
                                {t("ai.matchesCount", { count: lineMatches.length })}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {displayedMatches.map((match, index) => (
                            <LineMatchCard
                                key={`${match.case_fragment_id || "m"}-${index}`}
                                match={match}
                                index={index}
                                t={t}
                            />
                        ))}
                    </div>
                    {hasMore && !showAll && (
                        <button
                            onClick={() => setShowAll(true)}
                            className="mt-3 w-full text-center text-xs font-bold text-[#D97706] hover:text-[#B45309] py-2 rounded-lg border border-dashed border-[#D97706]/30 hover:border-[#D97706] hover:bg-orange-50 transition-all"
                        >
                            {t("ai.showAllMatches", { count: lineMatches.length })}
                        </button>
                    )}
                </div>
            )}

            {/* Document Evidence */}
            {documentEvidence.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Hash className="h-4 w-4 text-[#0F2942]" />
                        <h4 className="text-sm font-bold text-[#0F2942]">
                            {t("ai.documentEvidence")}
                        </h4>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                            {t("ai.sourcesCount", { count: documentEvidence.length })}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {documentEvidence.map((evidence, index) => (
                            <DocumentEvidenceCard
                                key={`${evidence.fragment_id || index}`}
                                evidence={evidence}
                                t={t}
                            />
                        ))}
                    </div>
                </div>
            )}

            {lineMatches.length === 0 && documentEvidence.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium">
                        {t("ai.noDetailedMatchEvidence")}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        {t("ai.noDetailedMatchEvidenceDesc")}
                    </p>
                </div>
            )}
        </div>
    );
}
