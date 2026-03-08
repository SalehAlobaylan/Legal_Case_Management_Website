/**
 * File: src/components/features/cases/wizard/StepReview.tsx
 * Purpose: Step 3 — AI-powered review of the entered data.
 * Fully i18n-aware.
 */

"use client";

import * as React from "react";
import {
    CheckCircle,
    AlertTriangle,
    Lightbulb,
    FileText,
    User,
    Building,
    Tag,
    Calendar,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import { CaseType } from "@/lib/types/case";

interface ReviewData {
    caseType: CaseType | "";
    title: string;
    caseNumber: string;
    description: string;
    clientInfo: string;
    courtJurisdiction: string;
}

interface StepReviewProps {
    data: ReviewData;
    mode: "create" | "edit";
}

interface ReviewItem {
    labelKey: string;
    status: "pass" | "warning" | "suggestion";
    messageKey: string;
}

function analyzeCase(data: ReviewData): ReviewItem[] {
    const items: ReviewItem[] = [];

    // Title check
    if (data.title.length > 10) {
        items.push({
            labelKey: "cases.wizard.labelCaseTitle",
            status: "pass",
            messageKey: "cases.wizard.reviewTitlePass",
        });
    } else if (data.title.length > 0) {
        items.push({
            labelKey: "cases.wizard.labelCaseTitle",
            status: "warning",
            messageKey: "cases.wizard.reviewTitleWarn",
        });
    }

    // Description analysis
    const desc = data.description.toLowerCase();
    const descLength = data.description.length;

    if (descLength === 0) {
        items.push({
            labelKey: "cases.wizard.labelCaseDesc",
            status: "warning",
            messageKey: "cases.wizard.reviewDescNone",
        });
    } else if (descLength < 50) {
        items.push({
            labelKey: "cases.wizard.labelCaseDesc",
            status: "warning",
            messageKey: "cases.wizard.reviewDescBrief",
        });
    } else if (descLength < 150) {
        items.push({
            labelKey: "cases.wizard.labelCaseDesc",
            status: "suggestion",
            messageKey: "cases.wizard.reviewDescAdequate",
        });
    } else {
        items.push({
            labelKey: "cases.wizard.labelCaseDesc",
            status: "pass",
            messageKey: "cases.wizard.reviewDescGood",
        });
    }

    // Check for key elements in description
    const hasParties =
        desc.includes("plaintiff") ||
        desc.includes("defendant") ||
        desc.includes("employee") ||
        desc.includes("employer") ||
        desc.includes("company") ||
        desc.includes("client") ||
        desc.includes("المدعي") ||
        desc.includes("المدعى عليه");
    const hasFacts =
        desc.includes("on ") ||
        desc.includes("dated") ||
        desc.includes("after") ||
        desc.includes("before") ||
        desc.includes("بتاريخ") ||
        desc.includes("في تاريخ");
    const hasClaims =
        desc.includes("compensation") ||
        desc.includes("payment") ||
        desc.includes("damages") ||
        desc.includes("relief") ||
        desc.includes("تعويض") ||
        desc.includes("مطالبة");

    if (descLength > 30 && !hasParties) {
        items.push({
            labelKey: "cases.wizard.labelParties",
            status: "suggestion",
            messageKey: "cases.wizard.reviewPartiesSugg",
        });
    }
    if (descLength > 30 && !hasFacts) {
        items.push({
            labelKey: "cases.wizard.labelTimeline",
            status: "suggestion",
            messageKey: "cases.wizard.reviewTimelineSugg",
        });
    }
    if (descLength > 30 && !hasClaims) {
        items.push({
            labelKey: "cases.wizard.labelClaims",
            status: "suggestion",
            messageKey: "cases.wizard.reviewClaimsSugg",
        });
    }

    // Client info check
    if (data.clientInfo) {
        items.push({
            labelKey: "cases.wizard.labelClientInfo",
            status: "pass",
            messageKey: "cases.wizard.reviewClientPass",
        });
    } else {
        items.push({
            labelKey: "cases.wizard.labelClientInfo",
            status: "suggestion",
            messageKey: "cases.wizard.reviewClientSugg",
        });
    }

    // Court check
    if (data.courtJurisdiction) {
        items.push({
            labelKey: "cases.wizard.labelCourtJurisdiction",
            status: "pass",
            messageKey: "cases.wizard.reviewCourtPass",
        });
    } else {
        items.push({
            labelKey: "cases.wizard.labelCourtJurisdiction",
            status: "suggestion",
            messageKey: "cases.wizard.reviewCourtSugg",
        });
    }

    return items;
}

const TYPE_LABEL_KEYS: Record<string, string> = {
    [CaseType.GENERAL]: "cases.wizard.typeGeneral",
    [CaseType.CRIMINAL]: "cases.wizard.typeCriminal",
    [CaseType.PERSONAL_STATUS]: "cases.wizard.typePersonalStatus",
    [CaseType.COMMERCIAL]: "cases.wizard.typeCommercial",
    [CaseType.LABOR]: "cases.wizard.typeLabor",
    [CaseType.ADMINISTRATIVE]: "cases.wizard.typeAdministrative",
    [CaseType.ENFORCEMENT]: "cases.wizard.typeEnforcement",
};

export function StepReview({ data, mode }: StepReviewProps) {
    const { t } = useI18n();
    const reviewItems = React.useMemo(() => analyzeCase(data), [data]);

    const passCount = reviewItems.filter((i) => i.status === "pass").length;
    const warningCount = reviewItems.filter(
        (i) => i.status === "warning"
    ).length;
    const suggestionCount = reviewItems.filter(
        (i) => i.status === "suggestion"
    ).length;
    const totalChecks = reviewItems.length;
    const scorePercent = Math.round((passCount / totalChecks) * 100);

    return (
        <div className="space-y-6">
            {/* AI Review Header */}
            <div className="rounded-xl bg-gradient-to-r from-[#0F2942] to-[#1a3a5c] p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">
                            {t("cases.wizard.aiCaseReview")}
                        </p>
                        <p className="text-[10px] text-white/70">
                            {t("cases.wizard.analyzingDetails")}
                        </p>
                    </div>
                </div>

                {/* Score bar */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-700 ease-out",
                                scorePercent > 70
                                    ? "bg-emerald-400"
                                    : scorePercent > 40
                                        ? "bg-amber-400"
                                        : "bg-red-400"
                            )}
                            style={{ width: `${scorePercent}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold tabular-nums">
                        {passCount}/{totalChecks} {t("cases.wizard.checks")}
                    </span>
                </div>

                <div className="flex items-center gap-4 mt-3">
                    {warningCount > 0 && (
                        <span className="text-[10px] font-bold flex items-center gap-1 bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="h-3 w-3" /> {warningCount}{" "}
                            {warningCount !== 1
                                ? t("cases.wizard.warningsPlural")
                                : t("cases.wizard.warnings")}
                        </span>
                    )}
                    {suggestionCount > 0 && (
                        <span className="text-[10px] font-bold flex items-center gap-1 bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-md">
                            <Lightbulb className="h-3 w-3" /> {suggestionCount}{" "}
                            {suggestionCount !== 1
                                ? t("cases.wizard.suggestionsPlural")
                                : t("cases.wizard.suggestions")}
                        </span>
                    )}
                    {passCount > 0 && (
                        <span className="text-[10px] font-bold flex items-center gap-1 bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle className="h-3 w-3" /> {passCount}{" "}
                            {t("cases.wizard.passed")}
                        </span>
                    )}
                </div>
            </div>

            {/* Review Items */}
            <div className="space-y-2">
                {reviewItems.map((item) => (
                    <div
                        key={item.labelKey}
                        className={cn(
                            "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                            item.status === "pass"
                                ? "border-emerald-200 bg-emerald-50/50"
                                : item.status === "warning"
                                    ? "border-amber-200 bg-amber-50/50"
                                    : "border-blue-200 bg-blue-50/50"
                        )}
                    >
                        {item.status === "pass" ? (
                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : item.status === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                            <Lightbulb className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p
                                className={cn(
                                    "text-xs font-bold",
                                    item.status === "pass"
                                        ? "text-emerald-800"
                                        : item.status === "warning"
                                            ? "text-amber-800"
                                            : "text-blue-800"
                                )}
                            >
                                {t(item.labelKey as any)}
                            </p>
                            <p
                                className={cn(
                                    "text-[11px] mt-0.5",
                                    item.status === "pass"
                                        ? "text-emerald-700"
                                        : item.status === "warning"
                                            ? "text-amber-700"
                                            : "text-blue-700"
                                )}
                            >
                                {t(item.messageKey as any)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {t("cases.wizard.caseSummary")}
                    </p>
                </div>
                <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                        <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                {t("cases.wizard.type")}
                            </p>
                            <p className="text-sm font-bold text-[#0F2942]">
                                {TYPE_LABEL_KEYS[data.caseType]
                                    ? t(TYPE_LABEL_KEYS[data.caseType] as any)
                                    : t("cases.wizard.notSelected")}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                {t("cases.wizard.title")}
                            </p>
                            <p className="text-sm font-bold text-[#0F2942] truncate">
                                {data.title || "—"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                {t("cases.wizard.caseNumberLabel")}
                            </p>
                            <p className="text-sm font-bold text-[#0F2942]">
                                {data.caseNumber || "—"}
                            </p>
                        </div>
                    </div>
                    {data.clientInfo && (
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-slate-400 shrink-0" />
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    {t("cases.wizard.client")}
                                </p>
                                <p className="text-sm font-bold text-[#0F2942]">
                                    {data.clientInfo}
                                </p>
                            </div>
                        </div>
                    )}
                    {data.courtJurisdiction && (
                        <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-slate-400 shrink-0" />
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    {t("cases.wizard.court")}
                                </p>
                                <p className="text-sm font-bold text-[#0F2942]">
                                    {data.courtJurisdiction}
                                </p>
                            </div>
                        </div>
                    )}
                    {data.description && (
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                                {t("cases.wizard.descriptionPreview")}
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                                {data.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Ready message */}
            <div className="text-center py-2">
                <p className="text-xs text-slate-500">
                    {mode === "create"
                        ? t("cases.wizard.readyToCreate")
                        : t("cases.wizard.readyToUpdate")}
                </p>
            </div>
        </div>
    );
}
