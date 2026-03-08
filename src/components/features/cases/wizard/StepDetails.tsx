/**
 * File: src/components/features/cases/wizard/StepDetails.tsx
 * Purpose: Step 2 — Description with AI assist, client info, court.
 * Fully i18n-aware.
 */

"use client";

import * as React from "react";
import {
    Sparkles,
    Lightbulb,
    User,
    Building,
    ChevronRight,
    X,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/hooks/use-i18n";
import { CaseType } from "@/lib/types/case";

export interface StepDetailsData {
    description: string;
    clientInfo: string;
    courtJurisdiction: string;
}

interface StepDetailsProps {
    data: StepDetailsData;
    caseType: CaseType | "";
    onChange: (data: StepDetailsData) => void;
    errors: Record<string, string>;
}

interface GuidingQuestion {
    id: string;
    questionKey: string;
    placeholderKey: string;
}

function getGuidingQuestions(caseType: CaseType | ""): GuidingQuestion[] {
    const common: GuidingQuestion[] = [
        {
            id: "parties",
            questionKey: "cases.wizard.qParties",
            placeholderKey: "cases.wizard.qPartiesPlaceholder",
        },
        {
            id: "facts",
            questionKey: "cases.wizard.qFacts",
            placeholderKey: "cases.wizard.qFactsPlaceholder",
        },
        {
            id: "relief",
            questionKey: "cases.wizard.qRelief",
            placeholderKey: "cases.wizard.qReliefPlaceholder",
        },
    ];

    const typeSpecific: Record<string, GuidingQuestion[]> = {
        [CaseType.GENERAL]: [
            {
                id: "dispute",
                questionKey: "cases.wizard.qDispute",
                placeholderKey: "cases.wizard.qDisputePlaceholder",
            },
        ],
        [CaseType.LABOR]: [
            {
                id: "employment",
                questionKey: "cases.wizard.qEmployment",
                placeholderKey: "cases.wizard.qEmploymentPlaceholder",
            },
        ],
        [CaseType.COMMERCIAL]: [
            {
                id: "contract",
                questionKey: "cases.wizard.qContract",
                placeholderKey: "cases.wizard.qContractPlaceholder",
            },
        ],
        [CaseType.CRIMINAL]: [
            {
                id: "offense",
                questionKey: "cases.wizard.qOffense",
                placeholderKey: "cases.wizard.qOffensePlaceholder",
            },
        ],
        [CaseType.PERSONAL_STATUS]: [
            {
                id: "relationship",
                questionKey: "cases.wizard.qFamily",
                placeholderKey: "cases.wizard.qFamilyPlaceholder",
            },
        ],
        [CaseType.ADMINISTRATIVE]: [
            {
                id: "government",
                questionKey: "cases.wizard.qGovernment",
                placeholderKey: "cases.wizard.qGovernmentPlaceholder",
            },
        ],
        [CaseType.ENFORCEMENT]: [
            {
                id: "judgment",
                questionKey: "cases.wizard.qJudgment",
                placeholderKey: "cases.wizard.qJudgmentPlaceholder",
            },
        ],
    };

    return [...(typeSpecific[caseType as string] || []), ...common];
}

export function StepDetails({
    data,
    caseType,
    onChange,
    errors,
}: StepDetailsProps) {
    const { t } = useI18n();
    const [showAiHelper, setShowAiHelper] = React.useState(false);
    const [aiAnswers, setAiAnswers] = React.useState<Record<string, string>>(
        {}
    );
    const [isGenerating, setIsGenerating] = React.useState(false);

    const update = (patch: Partial<StepDetailsData>) =>
        onChange({ ...data, ...patch });

    const questions = React.useMemo(
        () => getGuidingQuestions(caseType),
        [caseType]
    );

    const handleGenerateDescription = () => {
        setIsGenerating(true);

        const parts: string[] = [];
        for (const q of questions) {
            const answer = aiAnswers[q.id]?.trim();
            if (answer) {
                parts.push(answer);
            }
        }

        setTimeout(() => {
            const generated = parts.join("\n\n");
            if (generated) {
                update({
                    description: data.description
                        ? `${data.description}\n\n${generated}`
                        : generated,
                });
            }
            setShowAiHelper(false);
            setAiAnswers({});
            setIsGenerating(false);
        }, 600);
    };

    const answeredCount = Object.values(aiAnswers).filter(
        (v) => v.trim().length > 0
    ).length;

    return (
        <div className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Label
                            htmlFor="wizard-description"
                            className="text-sm font-bold text-[#0F2942]"
                        >
                            {t("cases.wizard.caseDescription")}
                        </Label>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {t("cases.wizard.caseDescriptionHint")}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAiHelper(!showAiHelper)}
                        className={cn(
                            "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all",
                            showAiHelper
                                ? "bg-[#D97706] text-white shadow-sm"
                                : "bg-amber-50 text-[#D97706] border border-amber-200 hover:bg-amber-100"
                        )}
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        {showAiHelper
                            ? t("cases.wizard.closeHelper")
                            : t("cases.wizard.helpMeDescribe")}
                    </button>
                </div>

                {/* AI Helper Panel */}
                {showAiHelper && (
                    <div className="rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#D97706] p-1.5 rounded-lg text-white">
                                <Lightbulb className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#0F2942]">
                                    {t("cases.wizard.aiHelper")}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    {t("cases.wizard.aiHelperDesc")}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {questions.map((q) => (
                                <div key={q.id} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <ChevronRight className="h-3 w-3 text-[#D97706]" />
                                        {t(q.questionKey as any)}
                                    </label>
                                    <textarea
                                        value={aiAnswers[q.id] || ""}
                                        onChange={(e) =>
                                            setAiAnswers((prev) => ({
                                                ...prev,
                                                [q.id]: e.target.value,
                                            }))
                                        }
                                        placeholder={t(q.placeholderKey as any)}
                                        rows={2}
                                        className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20 outline-none resize-none transition-colors"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-500">
                                {answeredCount} {t("cases.wizard.of")} {questions.length}{" "}
                                {t("cases.wizard.answered")}
                            </span>
                            <button
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={answeredCount === 0 || isGenerating}
                                className={cn(
                                    "flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all",
                                    answeredCount === 0
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-[#0F2942] text-white hover:bg-[#0a1c2e] shadow-sm"
                                )}
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="h-3.5 w-3.5" />
                                )}
                                {isGenerating
                                    ? t("cases.wizard.building")
                                    : t("cases.wizard.buildDescription")}
                            </button>
                        </div>
                    </div>
                )}

                <Textarea
                    id="wizard-description"
                    rows={8}
                    placeholder={t("cases.wizard.caseDescriptionPlaceholder")}
                    value={data.description}
                    onChange={(e) => update({ description: e.target.value })}
                    className="text-sm"
                />
                {data.description && (
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "h-1.5 flex-1 rounded-full overflow-hidden",
                                "bg-slate-100"
                            )}
                        >
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-300",
                                    data.description.length > 200
                                        ? "bg-emerald-500"
                                        : data.description.length > 100
                                            ? "bg-blue-500"
                                            : "bg-amber-500"
                                )}
                                style={{
                                    width: `${Math.min(100, (data.description.length / 300) * 100)}%`,
                                }}
                            />
                        </div>
                        <span
                            className={cn(
                                "text-[10px] font-bold shrink-0",
                                data.description.length > 200
                                    ? "text-emerald-600"
                                    : data.description.length > 100
                                        ? "text-blue-600"
                                        : "text-amber-600"
                            )}
                        >
                            {data.description.length > 200
                                ? t("cases.wizard.detailedDesc")
                                : data.description.length > 100
                                    ? t("cases.wizard.goodDesc")
                                    : t("cases.wizard.addMoreDetail")}
                        </span>
                    </div>
                )}
            </div>

            {/* Client & Court */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label
                        htmlFor="wizard-clientInfo"
                        className="text-sm font-bold text-[#0F2942] flex items-center gap-1.5"
                    >
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {t("cases.wizard.client")}
                    </Label>
                    <Input
                        id="wizard-clientInfo"
                        placeholder={t("cases.wizard.clientPlaceholder")}
                        value={data.clientInfo}
                        onChange={(e) => update({ clientInfo: e.target.value })}
                        className="text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="wizard-court"
                        className="text-sm font-bold text-[#0F2942] flex items-center gap-1.5"
                    >
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {t("cases.wizard.courtJurisdiction")}
                    </Label>
                    <Input
                        id="wizard-court"
                        placeholder={t("cases.wizard.courtPlaceholder")}
                        value={data.courtJurisdiction}
                        onChange={(e) =>
                            update({ courtJurisdiction: e.target.value })
                        }
                        className="text-sm"
                    />
                </div>
            </div>
        </div>
    );
}
