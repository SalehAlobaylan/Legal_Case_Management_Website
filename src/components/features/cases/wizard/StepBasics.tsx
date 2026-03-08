/**
 * File: src/components/features/cases/wizard/StepBasics.tsx
 * Purpose: Step 1 — Case type (visual cards), title, and case number.
 * Fully i18n-aware.
 */

"use client";

import * as React from "react";
import {
    Scale,
    ShieldAlert,
    Heart,
    Building2,
    Briefcase,
    Landmark,
    FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/hooks/use-i18n";
import { CaseType } from "@/lib/types/case";

export interface StepBasicsData {
    caseType: CaseType | "";
    title: string;
    caseNumber: string;
}

interface StepBasicsProps {
    data: StepBasicsData;
    onChange: (data: StepBasicsData) => void;
    errors: Record<string, string>;
}

function generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CASE-${year}-${rand}`;
}

export function StepBasics({ data, onChange, errors }: StepBasicsProps) {
    const { t } = useI18n();
    const [suggestedNumber] = React.useState(() => generateCaseNumber());

    const update = (patch: Partial<StepBasicsData>) =>
        onChange({ ...data, ...patch });

    const CASE_TYPES = [
        {
            type: CaseType.GENERAL,
            label: t("cases.wizard.typeGeneral"),
            description: t("cases.wizard.typeGeneralDesc"),
            icon: Scale,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            activeBg: "bg-blue-600",
        },
        {
            type: CaseType.CRIMINAL,
            label: t("cases.wizard.typeCriminal"),
            description: t("cases.wizard.typeCriminalDesc"),
            icon: ShieldAlert,
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            activeBg: "bg-red-600",
        },
        {
            type: CaseType.PERSONAL_STATUS,
            label: t("cases.wizard.typePersonalStatus"),
            description: t("cases.wizard.typePersonalStatusDesc"),
            icon: Heart,
            color: "text-pink-600",
            bgColor: "bg-pink-50",
            borderColor: "border-pink-200",
            activeBg: "bg-pink-600",
        },
        {
            type: CaseType.COMMERCIAL,
            label: t("cases.wizard.typeCommercial"),
            description: t("cases.wizard.typeCommercialDesc"),
            icon: Building2,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200",
            activeBg: "bg-emerald-600",
        },
        {
            type: CaseType.LABOR,
            label: t("cases.wizard.typeLabor"),
            description: t("cases.wizard.typeLaborDesc"),
            icon: Briefcase,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            activeBg: "bg-amber-600",
        },
        {
            type: CaseType.ADMINISTRATIVE,
            label: t("cases.wizard.typeAdministrative"),
            description: t("cases.wizard.typeAdministrativeDesc"),
            icon: Landmark,
            color: "text-violet-600",
            bgColor: "bg-violet-50",
            borderColor: "border-violet-200",
            activeBg: "bg-violet-600",
        },
        {
            type: CaseType.ENFORCEMENT,
            label: t("cases.wizard.typeEnforcement"),
            description: t("cases.wizard.typeEnforcementDesc"),
            icon: FileCheck,
            color: "text-slate-600",
            bgColor: "bg-slate-50",
            borderColor: "border-slate-200",
            activeBg: "bg-slate-700",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Case Type Selection */}
            <div>
                <Label className="text-sm font-bold text-[#0F2942] mb-1 block">
                    {t("cases.wizard.whatType")}
                </Label>
                <p className="text-xs text-slate-500 mb-4">
                    {t("cases.wizard.selectCourtType")}
                </p>
                {errors.caseType && (
                    <p className="text-xs font-medium text-red-600 mb-3">
                        {errors.caseType}
                    </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {CASE_TYPES.map((ct) => {
                        const Icon = ct.icon;
                        const isSelected = data.caseType === ct.type;
                        return (
                            <button
                                key={ct.type}
                                type="button"
                                onClick={() => update({ caseType: ct.type })}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all text-center group",
                                    isSelected
                                        ? `${ct.activeBg} text-white border-transparent shadow-lg scale-[1.02]`
                                        : `${ct.bgColor} ${ct.borderColor} border hover:shadow-md hover:scale-[1.01]`
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isSelected ? "bg-white/20" : "bg-white shadow-sm"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-5 w-5",
                                            isSelected ? "text-white" : ct.color
                                        )}
                                    />
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-bold leading-tight",
                                        isSelected ? "text-white" : "text-slate-700"
                                    )}
                                >
                                    {ct.label}
                                </span>
                                <span
                                    className={cn(
                                        "text-[9px] leading-tight",
                                        isSelected ? "text-white/70" : "text-slate-400"
                                    )}
                                >
                                    {ct.description}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <Label
                    htmlFor="wizard-title"
                    className="text-sm font-bold text-[#0F2942]"
                >
                    {t("cases.wizard.caseTitle")}{" "}
                    <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-slate-500">
                    {t("cases.wizard.caseTitleHint")}
                </p>
                <Input
                    id="wizard-title"
                    placeholder={t("cases.wizard.caseTitlePlaceholder")}
                    value={data.title}
                    onChange={(e) => update({ title: e.target.value })}
                    error={Boolean(errors.title)}
                    className="text-sm"
                />
                {errors.title && (
                    <p className="text-xs font-medium text-red-600">{errors.title}</p>
                )}
            </div>

            {/* Case Number */}
            <div className="space-y-2">
                <Label
                    htmlFor="wizard-caseNumber"
                    className="text-sm font-bold text-[#0F2942]"
                >
                    {t("cases.wizard.caseNumberLabel")}{" "}
                    <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-slate-500">
                    {t("cases.wizard.caseNumberHint")}
                </p>
                <div className="flex gap-2">
                    <Input
                        id="wizard-caseNumber"
                        placeholder={t("cases.wizard.caseNumberPlaceholder")}
                        value={data.caseNumber}
                        onChange={(e) => update({ caseNumber: e.target.value })}
                        error={Boolean(errors.caseNumber)}
                        className="text-sm flex-1"
                    />
                    {!data.caseNumber && (
                        <button
                            type="button"
                            onClick={() => update({ caseNumber: suggestedNumber })}
                            className="text-[10px] font-bold text-[#D97706] bg-amber-50 border border-amber-200 px-3 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap"
                        >
                            {t("cases.wizard.useSuggested")} {suggestedNumber}
                        </button>
                    )}
                </div>
                {errors.caseNumber && (
                    <p className="text-xs font-medium text-red-600">
                        {errors.caseNumber}
                    </p>
                )}
            </div>
        </div>
    );
}
