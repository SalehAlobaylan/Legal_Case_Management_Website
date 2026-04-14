/**
 * File: src/app/(dashboard)/cases/[id]/linking/page.tsx
 * Purpose: Case Linking Studio — dedicated full-page review for AI-suggested regulation links.
 *
 * Layout:
 * - Header with case context and navigation
 * - Left sidebar: sortable/filterable link list
 * - Right panel: full link detail with score breakdown, evidence, regulation preview, and actions
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight,
    Sparkles,
    Loader2,
    RefreshCw,
    FileText,
    LayoutGrid,
} from "lucide-react";
import { useCase } from "@/lib/hooks/use-cases";
import {
    useAILinks,
    useGenerateAILinks,
    useVerifyLink,
    useDismissLink,
    useBulkSubscribeRegulations,
} from "@/lib/hooks/use-ai-links";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/use-toast";
import { LinkListSidebar } from "@/components/features/cases/linking/LinkListSidebar";
import { LinkDetailPanel } from "@/components/features/cases/linking/LinkDetailPanel";
import { ProgressSteps } from "@/components/ui/progress-steps";
import type { CaseRegulationLink } from "@/lib/types/case";

function useAILinkingSteps() {
    const { t } = useI18n();
    return React.useMemo(() => [
        { label: t("ai.progress.analyzingCase"), description: t("ai.progress.analyzingCaseDesc"), estimatedMs: 8000 },
        { label: t("ai.progress.processingDocs"), description: t("ai.progress.processingDocsDesc"), estimatedMs: 15000 },
        { label: t("ai.progress.searchingRegs"), description: t("ai.progress.searchingRegsDesc"), estimatedMs: 20000 },
        { label: t("ai.progress.computingScores"), description: t("ai.progress.computingScoresDesc"), estimatedMs: 25000 },
        { label: t("ai.progress.rankingMatches"), description: t("ai.progress.rankingMatchesDesc"), estimatedMs: 10000 },
        { label: t("ai.progress.buildingEvidence"), description: t("ai.progress.buildingEvidenceDesc"), estimatedMs: 15000 },
        { label: t("ai.progress.finalizingResults"), description: t("ai.progress.finalizingResultsDesc"), estimatedMs: 5000 },
    ], [t]);
}

function useProgressI18n() {
    const { t } = useI18n();
    return React.useMemo(() => ({
        doneLabel: t("ai.progress.done"),
        stepLabel: t("ai.progress.step"),
        defaultTitle: t("ai.progress.processing"),
        footerTip: t("ai.progress.footerTip"),
    }), [t]);
}

interface LinkingStudioPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function LinkingStudioPage({ params }: LinkingStudioPageProps) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const caseId = Number(resolvedParams.id);
    const { t } = useI18n();
    const { toast } = useToast();
    const aiLinkingSteps = useAILinkingSteps();
    const progressI18n = useProgressI18n();

    const [selectedLinkId, setSelectedLinkId] = React.useState<number | null>(
        null
    );

    // Data fetching
    const { data: case_, isLoading: isLoadingCase } = useCase(caseId);
    const { data: aiLinks, isLoading: isLoadingLinks } = useAILinks(caseId);

    // Mutations
    const { mutate: generateLinks, isPending: isGenerating } =
        useGenerateAILinks(caseId);
    const verifyLink = useVerifyLink();
    const dismissLink = useDismissLink();
    const bulkSubscribe = useBulkSubscribeRegulations();

    // Auto-select first link when data loads
    React.useEffect(() => {
        if (aiLinks && aiLinks.length > 0 && selectedLinkId === null) {
            setSelectedLinkId(aiLinks[0].id);
        }
    }, [aiLinks, selectedLinkId]);

    // Find the currently selected link
    const selectedLink = React.useMemo(() => {
        if (!aiLinks || selectedLinkId === null) return null;
        return aiLinks.find((l: CaseRegulationLink) => l.id === selectedLinkId) || null;
    }, [aiLinks, selectedLinkId]);

    const handleVerify = (linkId: number) => {
        verifyLink.mutate(linkId, {
            onSuccess: () => {
                toast({
                    title: t("ai.linkVerified"),
                    description: t("ai.linkVerifiedDesc"),
                });
            },
        });
    };

    const handleDismiss = (linkId: number) => {
        dismissLink.mutate(linkId, {
            onSuccess: () => {
                // Select next link if available
                if (aiLinks) {
                    const remaining = aiLinks.filter(
                        (l: CaseRegulationLink) => l.id !== linkId
                    );
                    setSelectedLinkId(remaining.length > 0 ? remaining[0].id : null);
                }
                toast({
                    title: t("ai.linkDismissed"),
                    description: t("ai.linkDismissedDesc"),
                });
            },
        });
    };

    const handleSubscribe = (regulationId: number) => {
        bulkSubscribe.mutate(
            { caseId, regulationIds: [regulationId] },
            {
                onSuccess: (result) => {
                    if (result.created > 0) {
                        toast({
                            title: t("ai.subscribedTitle"),
                            description: t("ai.subscribedDesc"),
                        });
                    }
                },
            }
        );
    };

    const handleGenerate = () => {
        generateLinks(undefined, {
            onSuccess: (result) => {
                const count = result.links?.length || 0;
                toast({
                    title: t("ai.suggestionsGeneratedTitle"),
                    description: t("ai.suggestionsGeneratedDesc", { count }),
                });
            },
            onError: () => {
                toast({
                    title: t("ai.generationFailedTitle"),
                    description: t("ai.generationFailedDesc"),
                    variant: "destructive",
                });
            },
        });
    };

    // Loading state
    if (isLoadingCase) {
        return (
            <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
            </div>
        );
    }

    if (!case_) {
        return (
            <EmptyState
                icon={FileText}
                title={t("cases.caseNotFound")}
                variant="notFound"
                action={{
                    label: t("cases.backToCases"),
                    onClick: () => router.push("/cases"),
                }}
            />
        );
    }

    const pendingCount =
        aiLinks?.filter((l: CaseRegulationLink) => !l.verified)?.length || 0;
    const verifiedCount =
        aiLinks?.filter((l: CaseRegulationLink) => l.verified)?.length || 0;

    return (
        <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
            {/* ── Top Header ── */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Back button */}
                        <button
                            onClick={() => router.push(`/cases/${caseId}`)}
                            className={cn(
                                "flex items-center text-slate-500 hover:text-[#0F2942]",
                                "text-sm font-medium group transition-colors shrink-0"
                            )}
                        >
                            <div
                                className={cn(
                                    "bg-slate-100 p-1 rounded-md mr-2",
                                    "group-hover:bg-[#0F2942] group-hover:text-white transition-colors"
                                )}
                            >
                                <ChevronRight className="rotate-180 h-3.5 w-3.5" />
                            </div>
                            {t("ai.backToCase")}
                        </button>

                        <div className="h-6 w-px bg-slate-200 shrink-0" />

                        {/* Case info */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="bg-[#0F2942] p-1.5 rounded-lg text-white shrink-0">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-base font-bold text-[#0F2942] truncate">
                                        {t("ai.linkingStudio")}
                                    </h1>
                                    <p className="text-[10px] text-slate-500 truncate">
                                        {case_.title} • #{case_.case_number}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-3 mr-2">
                            <div className="text-center">
                                <p className="text-lg font-bold text-[#0F2942] leading-none">
                                    {aiLinks?.length || 0}
                                </p>
                                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                                    {t("ai.totalLinks")}
                                </p>
                            </div>
                            <div className="h-8 w-px bg-slate-200" />
                            <div className="text-center">
                                <p className="text-lg font-bold text-amber-600 leading-none">
                                    {pendingCount}
                                </p>
                                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                                    {t("ai.pendingLinks")}
                                </p>
                            </div>
                            <div className="h-8 w-px bg-slate-200" />
                            <div className="text-center">
                                <p className="text-lg font-bold text-green-600 leading-none">
                                    {verifiedCount}
                                </p>
                                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                                    {t("ai.verifiedLinks")}
                                </p>
                            </div>
                        </div>

                        <Button
                            size="sm"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold"
                        >
                            {isGenerating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            ) : (
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            {isGenerating
                                ? t("ai.generatingStudio")
                                : t("ai.generateSuggestionsStudio")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Compact Progress Bar (when generating with existing links) ── */}
            {isGenerating && aiLinks && aiLinks.length > 0 && (
                <div className="px-6 py-2 shrink-0 border-b border-slate-200">
                    <ProgressSteps
                        isActive={isGenerating}
                        steps={aiLinkingSteps}
                        title={t("ai.progress.generatingTitle")}
                        subtitle={t("ai.progress.generatingSubtitle")}
                        variant="compact"
                        i18nTexts={progressI18n}
                    />
                </div>
            )}

            {/* ── Main Content ── */}
            <div className="flex-1 flex overflow-hidden">
                {isLoadingLinks ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#D97706] mx-auto mb-3" />
                            <p className="text-sm text-slate-500 font-medium">
                                {t("ai.loadingRegulationLinks")}
                            </p>
                        </div>
                    </div>
                ) : !aiLinks || aiLinks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        {isGenerating ? (
                            <div className="max-w-md w-full px-4">
                                <ProgressSteps
                                    isActive={isGenerating}
                                    steps={aiLinkingSteps}
                                    title={t("ai.progress.generatingTitle")}
                                    subtitle={t("ai.progress.generatingSubtitle")}
                                    i18nTexts={progressI18n}
                                />
                            </div>
                        ) : (
                            <div className="text-center max-w-sm">
                                <div className="bg-slate-100 p-5 rounded-full w-fit mx-auto mb-4">
                                    <LayoutGrid className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-[#0F2942] mb-2">
                                    {t("ai.noRegulationLinks")}
                                </h3>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                    {t("ai.noRegulationLinksDesc")}
                                </p>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    {t("ai.generateSuggestionsStudio")}
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Left Sidebar: Link List */}
                        <LinkListSidebar
                            links={aiLinks}
                            selectedLinkId={selectedLinkId}
                            onSelectLink={setSelectedLinkId}
                            className="w-[300px] shrink-0"
                        />

                        {/* Right Panel: Detail View */}
                        <div className="flex-1 bg-slate-50/30 overflow-hidden">
                            {selectedLink ? (
                                <LinkDetailPanel
                                    link={selectedLink}
                                    onVerify={handleVerify}
                                    onDismiss={handleDismiss}
                                    onSubscribe={handleSubscribe}
                                    isVerifying={verifyLink.isPending}
                                    isDismissing={dismissLink.isPending}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="bg-slate-100 p-4 rounded-full w-fit mx-auto mb-3">
                                            <Sparkles className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">
                                            {t("ai.selectLinkToReview")}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {t("ai.selectLinkToReviewDesc")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
