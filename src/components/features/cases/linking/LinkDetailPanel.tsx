/**
 * File: src/components/features/cases/linking/LinkDetailPanel.tsx
 * Purpose: Main detail panel for reviewing a single AI link with all expanded sections.
 * Used by: Case Linking Studio page.
 */

"use client";

import * as React from "react";
import {
    CheckCircle,
    X,
    Bell,
    ExternalLink,
    Sparkles,
    AlertTriangle,
    Loader2,
    Clock,
    FileText,
    Shield,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ScoreBreakdownChart } from "./ScoreBreakdownChart";
import { MatchEvidenceExplorer } from "./MatchEvidenceExplorer";
import { RegulationPreview } from "./RegulationPreview";
import type {
    CaseRegulationLink,
    LinkLineMatch,
    LinkMatchExplanation,
    LinkScoreBreakdown,
    LinkEvidence,
} from "@/lib/types/case";

interface LinkDetailPanelProps {
    link: CaseRegulationLink;
    onVerify: (linkId: number) => void;
    onDismiss: (linkId: number) => void;
    onSubscribe?: (regulationId: number) => void;
    isVerifying: boolean;
    isDismissing: boolean;
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
    return link.regulation?.title || (id ? `Regulation #${id}` : "Regulation");
}

export function LinkDetailPanel({
    link,
    onVerify,
    onDismiss,
    onSubscribe,
    isVerifying,
    isDismissing,
    className,
}: LinkDetailPanelProps) {
    const confidence = Math.round(normalizeSimilarityScore(link) * 100);
    const isVerified = link.verified;
    const regulationId = link.regulation_id ?? link.regulationId;
    const regulationTitle = getLinkRegulationTitle(link);
    const regulationNumber =
        link.regulation?.regulation_number || link.regulation?.regulationNumber;
    const sourceUrl =
        link.regulation?.source_url || link.regulation?.sourceUrl;

    // Parse match explanation
    const matchExplanation: LinkMatchExplanation = (link.match_explanation ||
        link.matchExplanation ||
        {}) as LinkMatchExplanation;
    const lineMatches: LinkLineMatch[] =
        matchExplanation.line_matches || matchExplanation.lineMatches || [];
    const scoreBreakdown: LinkScoreBreakdown | null =
        matchExplanation.score_breakdown || matchExplanation.scoreBreakdown || null;
    const warnings: string[] = (matchExplanation.warnings || []).filter(
        (item) => typeof item === "string"
    );

    // Parse evidence
    const evidence: LinkEvidence[] = (
        link.evidence_sources ||
        link.evidenceSources ||
        []
    ).filter((item) => item && typeof item === "object") as LinkEvidence[];
    const documentEvidence = evidence.filter(
        (item) => item.source === "document"
    );

    const isSubscribed = Boolean(link.isSubscribed || link.is_subscribed);
    const matchedWithDocs = Boolean(
        link.matchedWithDocuments || link.matched_with_documents
    );

    const confidenceColor =
        confidence > 90
            ? "text-emerald-600 bg-emerald-50 border-emerald-200"
            : confidence > 70
                ? "text-blue-600 bg-blue-50 border-blue-200"
                : "text-amber-600 bg-amber-50 border-amber-200";

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* ── Header ── */}
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-bold text-[#0F2942] leading-tight">
                                    {regulationTitle}
                                </h2>
                                {regulationNumber && (
                                    <p className="text-sm text-slate-500 mt-1">
                                        {regulationNumber}
                                    </p>
                                )}
                            </div>
                            <div
                                className={cn(
                                    "text-lg font-bold px-3 py-1.5 rounded-xl border tabular-nums shrink-0",
                                    confidenceColor
                                )}
                            >
                                {confidence}%
                            </div>
                        </div>

                        {/* Status badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            {isVerified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-lg border border-green-200">
                                    <CheckCircle className="h-3 w-3" />
                                    Verified & Linked
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">
                                    <Clock className="h-3 w-3" />
                                    Pending Review
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#0F2942]/10 text-[#0F2942] px-2.5 py-1 rounded-lg">
                                <Sparkles className="h-3 w-3" />
                                {link.method === "ai"
                                    ? "AI Matched"
                                    : link.method === "manual"
                                        ? "Manual"
                                        : "Hybrid"}
                            </span>
                            {matchedWithDocs && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                                    <FileText className="h-3 w-3" />
                                    Document Evidence
                                </span>
                            )}
                            {isSubscribed && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200">
                                    <Bell className="h-3 w-3" />
                                    Subscribed
                                </span>
                            )}
                            {sourceUrl && (
                                <a
                                    href={sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Source
                                </a>
                            )}
                        </div>
                    </div>

                    {/* ── Warnings ── */}
                    {warnings.length > 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <span className="text-xs font-bold text-amber-800">
                                    Warnings
                                </span>
                            </div>
                            <ul className="space-y-1">
                                {warnings.map((warning) => (
                                    <li
                                        key={warning}
                                        className="text-xs text-amber-700 flex items-start gap-1.5"
                                    >
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                                        {warning === "regulation_chunk_index_fallback_used"
                                            ? "Using fallback text matching (chunk index unavailable)"
                                            : warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* ── Score Breakdown ── */}
                    {scoreBreakdown && (
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="h-4 w-4 text-[#0F2942]" />
                                <h3 className="text-sm font-bold text-[#0F2942]">
                                    Score Breakdown
                                </h3>
                            </div>
                            <ScoreBreakdownChart breakdown={scoreBreakdown} />
                        </div>
                    )}

                    {/* ── Match Evidence ── */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                        <MatchEvidenceExplorer
                            lineMatches={lineMatches}
                            documentEvidence={documentEvidence}
                        />
                    </div>

                    {/* ── Regulation Full Text Preview ── */}
                    {regulationId && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-4 w-4 text-[#0F2942]" />
                                <h3 className="text-sm font-bold text-[#0F2942]">
                                    Regulation Content
                                </h3>
                            </div>
                            <RegulationPreview
                                regulationId={regulationId}
                                regulationTitle={regulationTitle}
                                regulationNumber={regulationNumber}
                                sourceUrl={sourceUrl}
                                lineMatches={lineMatches}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Sticky Action Bar ── */}
            <div className="border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                {isVerified ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-bold">
                                Linked to Case Evidence
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isSubscribed && onSubscribe && regulationId && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onSubscribe(regulationId)}
                                    className="text-xs"
                                >
                                    <Bell className="h-3.5 w-3.5 mr-1" />
                                    Subscribe to Updates
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onDismiss(link.id)}
                                disabled={isDismissing}
                                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                            >
                                {isDismissing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <X className="h-3.5 w-3.5 mr-1" />
                                        Unlink
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => onVerify(link.id)}
                            disabled={isVerifying}
                            className="flex-1 bg-[#0F2942] hover:bg-[#0a1c2e] text-white font-bold"
                        >
                            {isVerifying ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Verify & Link to Case
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onDismiss(link.id)}
                            disabled={isDismissing}
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-bold"
                        >
                            {isDismissing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <X className="h-4 w-4 mr-2" />
                            )}
                            Dismiss
                        </Button>
                        {!isSubscribed && onSubscribe && regulationId && (
                            <Button
                                variant="outline"
                                onClick={() => onSubscribe(regulationId)}
                                className="shrink-0 text-xs"
                            >
                                <Bell className="h-3.5 w-3.5 mr-1" />
                                Subscribe
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
