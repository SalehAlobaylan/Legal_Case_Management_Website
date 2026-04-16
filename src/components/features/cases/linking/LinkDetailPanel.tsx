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
import { useI18n } from "@/lib/hooks/use-i18n";
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
    return link.regulation?.title || (id ? `#${id}` : "");
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
    const { t } = useI18n();
    const [activeTab, setActiveTab] = React.useState<"overview" | "evidence" | "regulation">(
        "overview"
    );
    // Reset tab when switching links
    React.useEffect(() => {
        setActiveTab("overview");
    }, [link.id]);

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
    const rawSimilarityScore =
        matchExplanation.diagnostics?.raw_similarity_score ??
        normalizeSimilarityScore(link);
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
    const hasFallbackWarning = warnings.includes(
        "regulation_chunk_index_fallback_used"
    );

    const confidenceColor =
        confidence > 90
            ? "text-emerald-600 bg-emerald-50 border-emerald-200"
            : confidence > 70
                ? "text-blue-600 bg-blue-50 border-blue-200"
                : "text-amber-600 bg-amber-50 border-amber-200";
    const confidenceLabel = hasFallbackWarning
        ? t("ai.confidenceEstimated")
        : t("ai.confidencePercent");

    const actionBar = isVerified ? (
        <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
                <CheckCircle className="h-4 w-4" />
                {t("ai.linkedToEvidence")}
            </span>
            {!isSubscribed && onSubscribe && regulationId && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSubscribe(regulationId)}
                    className="text-xs"
                >
                    <Bell className="h-3.5 w-3.5 mr-1" />
                    {t("ai.subscribeToUpdates")}
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
                        {t("ai.unlinkFromCase")}
                    </>
                )}
            </Button>
        </div>
    ) : (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                onClick={() => onVerify(link.id)}
                disabled={isVerifying}
                className="bg-[#0F2942] hover:bg-[#0a1c2e] text-white font-bold text-xs"
            >
                {isVerifying ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                )}
                {t("ai.verifyAndLink")}
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onDismiss(link.id)}
                disabled={isDismissing}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-bold"
            >
                {isDismissing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                    <X className="h-3.5 w-3.5 mr-1.5" />
                )}
                {t("ai.dismiss")}
            </Button>
            {!isSubscribed && onSubscribe && regulationId && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSubscribe(regulationId)}
                    className="shrink-0 text-xs"
                >
                    <Bell className="h-3.5 w-3.5 mr-1" />
                    {t("ai.subscribe")}
                </Button>
            )}
        </div>
    );

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* ── Sticky Header with Actions ── */}
            <div className="sticky top-0 z-10 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                            <h2 className="text-xl font-bold text-[#0F2942] leading-tight truncate">
                                {regulationTitle}
                            </h2>
                            {sourceUrl && (
                                <a
                                    href={sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={t("ai.openSource")}
                                    className="shrink-0 p-1 rounded text-slate-400 hover:text-[#0F2942] hover:bg-slate-100 transition-colors"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {regulationNumber && (
                                <span className="text-xs text-slate-500 truncate">
                                    {regulationNumber}
                                </span>
                            )}
                            {/* Status — consolidated into a single pill combining verification + method */}
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                    isVerified
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                )}
                            >
                                {isVerified ? (
                                    <CheckCircle className="h-3 w-3" />
                                ) : (
                                    <Clock className="h-3 w-3" />
                                )}
                                {isVerified ? t("ai.verifiedAndLinked") : t("ai.pendingReview")}
                                <span className="opacity-60">·</span>
                                <Sparkles className="h-2.5 w-2.5" />
                                {link.method === "ai"
                                    ? t("ai.aiMatched")
                                    : link.method === "manual"
                                        ? t("ai.manual")
                                        : t("ai.hybrid")}
                            </span>
                            {matchedWithDocs && (
                                <span
                                    title={t("ai.documentEvidence")}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600"
                                >
                                    <FileText className="h-3 w-3" />
                                </span>
                            )}
                            {isSubscribed && (
                                <span
                                    title={t("ai.subscribed")}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600"
                                >
                                    <Bell className="h-3 w-3" />
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div
                            className={cn(
                                "text-lg font-bold px-3 py-1.5 rounded-xl border tabular-nums",
                                confidenceColor
                            )}
                        >
                            {confidence} {confidenceLabel}
                        </div>
                        <div className="text-[10px] text-slate-500 tabular-nums text-right">
                            raw: {Number(rawSimilarityScore || 0).toFixed(4)}
                        </div>
                    </div>
                </div>

                {/* Actions + Tabs on one row */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex rounded-lg bg-slate-100 p-0.5">
                        {([
                            { key: "overview", label: t("ai.tabOverview") },
                            { key: "evidence", label: t("ai.tabEvidence") },
                            { key: "regulation", label: t("ai.tabRegulation") },
                        ] as const).map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "text-[11px] font-bold px-3 py-1 rounded-md transition-all",
                                    activeTab === tab.key
                                        ? "bg-white text-[#0F2942] shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {actionBar}
                </div>
            </div>

            {/* Scrollable content — one tab at a time */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Warnings surface on every tab because they're actionable */}
                    {warnings.length > 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <span className="text-xs font-bold text-amber-800">
                                    {t("ai.warnings")}
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
                                            ? t("ai.warningFallback")
                                            : warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {activeTab === "overview" && scoreBreakdown && (
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="h-4 w-4 text-[#0F2942]" />
                                <h3 className="text-sm font-bold text-[#0F2942]">
                                    {t("ai.scoreBreakdown")}
                                </h3>
                            </div>
                            <ScoreBreakdownChart breakdown={scoreBreakdown} />
                        </div>
                    )}

                    {activeTab === "overview" && !scoreBreakdown && (
                        <div className="text-center py-12 text-sm text-slate-500">
                            {t("ai.noScoreBreakdown")}
                        </div>
                    )}

                    {activeTab === "evidence" && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                            <MatchEvidenceExplorer
                                lineMatches={lineMatches}
                                documentEvidence={documentEvidence}
                            />
                        </div>
                    )}

                    {activeTab === "regulation" && regulationId && (
                        <RegulationPreview
                            regulationId={regulationId}
                            regulationTitle={regulationTitle}
                            regulationNumber={regulationNumber}
                            sourceUrl={sourceUrl}
                            lineMatches={lineMatches}
                        />
                    )}
                </div>
            </div>

        </div>
    );
}
