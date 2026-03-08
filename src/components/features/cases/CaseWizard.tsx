/**
 * File: src/components/features/cases/CaseWizard.tsx
 * Purpose: Multi-step form orchestrator for creating/editing cases.
 * Manages step navigation, form state, and submission.
 * Fully i18n-aware via useI18n().
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight,
    ChevronLeft,
    Loader2,
    CheckCircle,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useCreateCase, useUpdateCase } from "@/lib/hooks/use-cases";
import { useI18n } from "@/lib/hooks/use-i18n";
import { CaseType, CaseStatus } from "@/lib/types/case";
import type { Case, CreateCaseInput } from "@/lib/types/case";
import { StepBasics } from "./wizard/StepBasics";
import type { StepBasicsData } from "./wizard/StepBasics";
import { StepDetails } from "./wizard/StepDetails";
import type { StepDetailsData } from "./wizard/StepDetails";
import { StepReview } from "./wizard/StepReview";

interface CaseWizardProps {
    mode: "create" | "edit";
    existingCase?: Case;
}

interface WizardFormData {
    basics: StepBasicsData;
    details: StepDetailsData;
}

function getInitialData(existingCase?: Case): WizardFormData {
    if (existingCase) {
        return {
            basics: {
                caseType: existingCase.case_type || "",
                title: existingCase.title || "",
                caseNumber: existingCase.case_number || "",
            },
            details: {
                description: existingCase.description || "",
                clientInfo: existingCase.client_info || "",
                courtJurisdiction: existingCase.court_jurisdiction || "",
            },
        };
    }
    return {
        basics: { caseType: "", title: "", caseNumber: "" },
        details: { description: "", clientInfo: "", courtJurisdiction: "" },
    };
}

export function CaseWizard({ mode, existingCase }: CaseWizardProps) {
    const router = useRouter();
    const { t } = useI18n();
    const [currentStep, setCurrentStep] = React.useState(0);
    const [formData, setFormData] = React.useState<WizardFormData>(() =>
        getInitialData(existingCase)
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const { mutate: createCase, isPending: isCreating } = useCreateCase();
    const { mutate: updateCase, isPending: isUpdating } = useUpdateCase(
        existingCase?.id || 0
    );

    const isPending = isCreating || isUpdating;

    const STEPS = [
        { key: "basics", label: t("cases.wizard.basics") },
        { key: "details", label: t("cases.wizard.details") },
        { key: "review", label: t("cases.wizard.review") },
    ];

    // Validate current step
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 0) {
            if (!formData.basics.caseType) {
                newErrors.caseType = t("cases.wizard.errSelectType");
            }
            if (!formData.basics.title.trim()) {
                newErrors.title = t("cases.wizard.errTitleRequired");
            }
            if (!formData.basics.caseNumber.trim()) {
                newErrors.caseNumber = t("cases.wizard.errCaseNumberRequired");
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const handleBack = () => {
        setErrors({});
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = () => {
        const input: CreateCaseInput = {
            caseNumber: formData.basics.caseNumber,
            title: formData.basics.title,
            caseType: formData.basics.caseType as CaseType,
            description: formData.details.description || undefined,
            clientInfo: formData.details.clientInfo || undefined,
            courtJurisdiction: formData.details.courtJurisdiction || undefined,
            status: existingCase?.status
                ? (existingCase.status as CaseStatus)
                : CaseStatus.OPEN,
            filingDate:
                existingCase?.filing_date ||
                new Date().toISOString().split("T")[0],
        };

        if (mode === "edit" && existingCase) {
            updateCase(input, {
                onSuccess: () => {
                    router.push(`/cases/${existingCase.id}`);
                },
            });
        } else {
            createCase(input, {
                onSuccess: () => {
                    router.push("/cases");
                },
            });
        }
    };

    const reviewData = {
        caseType: formData.basics.caseType,
        title: formData.basics.title,
        caseNumber: formData.basics.caseNumber,
        description: formData.details.description,
        clientInfo: formData.details.clientInfo,
        courtJurisdiction: formData.details.courtJurisdiction,
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 px-4">
                {STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <React.Fragment key={step.key}>
                            <button
                                type="button"
                                onClick={() => {
                                    if (index < currentStep) {
                                        setErrors({});
                                        setCurrentStep(index);
                                    }
                                }}
                                className={cn(
                                    "flex items-center gap-2 transition-all group",
                                    index <= currentStep
                                        ? "cursor-pointer"
                                        : "cursor-default opacity-50"
                                )}
                            >
                                <div
                                    className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                        isActive
                                            ? "bg-[#0F2942] text-white shadow-lg shadow-[#0F2942]/30 scale-110"
                                            : isCompleted
                                                ? "bg-emerald-500 text-white"
                                                : "bg-slate-200 text-slate-500"
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        String(index + 1)
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-bold hidden sm:block",
                                        isActive
                                            ? "text-[#0F2942]"
                                            : isCompleted
                                                ? "text-emerald-600"
                                                : "text-slate-400"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </button>

                            {index < STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        "flex-1 h-0.5 mx-2 rounded-full transition-colors",
                                        index < currentStep ? "bg-emerald-400" : "bg-slate-200"
                                    )}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                    {currentStep === 0 && (
                        <StepBasics
                            data={formData.basics}
                            onChange={(basics) =>
                                setFormData((prev) => ({ ...prev, basics }))
                            }
                            errors={errors}
                        />
                    )}
                    {currentStep === 1 && (
                        <StepDetails
                            data={formData.details}
                            caseType={formData.basics.caseType}
                            onChange={(details) =>
                                setFormData((prev) => ({ ...prev, details }))
                            }
                            errors={errors}
                        />
                    )}
                    {currentStep === 2 && (
                        <StepReview data={reviewData} mode={mode} />
                    )}
                </div>

                {/* Navigation */}
                <div className="px-6 md:px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    {currentStep > 0 ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            className="text-sm"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {t("cases.wizard.back")}
                        </Button>
                    ) : (
                        <div />
                    )}

                    {currentStep < STEPS.length - 1 ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="bg-[#0F2942] hover:bg-[#0a1c2e] text-white text-sm font-bold"
                        >
                            {t("cases.wizard.continue")}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-bold min-w-[160px]"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            {isPending
                                ? mode === "edit"
                                    ? t("cases.wizard.updating")
                                    : t("cases.wizard.creating")
                                : mode === "edit"
                                    ? t("cases.wizard.updateCase")
                                    : t("cases.wizard.createCase")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
