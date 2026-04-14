/**
 * File: src/components/features/cases/linking/ScoreBreakdownChart.tsx
 * Purpose: Visual horizontal bar chart showing the breakdown of an AI link's similarity score.
 * Used by: LinkDetailPanel in the Case Linking Studio.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import type { LinkScoreBreakdown } from "@/lib/types/case";

interface ScoreBreakdownChartProps {
    breakdown: LinkScoreBreakdown;
    className?: string;
}

interface BarItemProps {
    label: string;
    value: number;
    color: string;
    bgColor: string;
    delay: number;
}

function BarItem({ label, value, color, bgColor, delay }: BarItemProps) {
    const [animated, setAnimated] = React.useState(false);
    const percentage = Math.round(value * 100);

    React.useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{label}</span>
                <span className={cn("text-xs font-bold tabular-nums", color)}>
                    {percentage}%
                </span>
            </div>
            <div className={cn("h-2.5 rounded-full overflow-hidden", bgColor)}>
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        color.replace("text-", "bg-")
                    )}
                    style={{ width: animated ? `${percentage}%` : "0%" }}
                />
            </div>
        </div>
    );
}

export function ScoreBreakdownChart({
    breakdown,
    className,
}: ScoreBreakdownChartProps) {
    const { t } = useI18n();
    const bars = [
        {
            label: t("ai.scoreSemanticMatch"),
            value: breakdown.semantic_max || 0,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            label: t("ai.scoreSupportCoverage"),
            value: breakdown.support_coverage || 0,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
        },
        {
            label: t("ai.scoreLexicalOverlap"),
            value: breakdown.lexical_overlap || 0,
            color: "text-violet-600",
            bgColor: "bg-violet-100",
        },
        {
            label: t("ai.scoreCategoryPrior"),
            value: breakdown.category_prior || 0,
            color: "text-amber-600",
            bgColor: "bg-amber-100",
        },
    ];

    const finalScore = Math.round((breakdown.final_score || 0) * 100);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Individual score bars */}
            <div className="space-y-3">
                {bars.map((bar, index) => (
                    <BarItem key={bar.label} {...bar} delay={index * 100} />
                ))}
            </div>

            {/* Final score separator */}
            <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#0F2942]">{t("ai.finalScore")}</span>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-24 rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-700 ease-out",
                                    finalScore > 80
                                        ? "bg-emerald-500"
                                        : finalScore > 60
                                            ? "bg-blue-500"
                                            : "bg-amber-500"
                                )}
                                style={{ width: `${finalScore}%` }}
                            />
                        </div>
                        <span
                            className={cn(
                                "text-sm font-bold tabular-nums",
                                finalScore > 80
                                    ? "text-emerald-600"
                                    : finalScore > 60
                                        ? "text-blue-600"
                                        : "text-amber-600"
                            )}
                        >
                            {finalScore}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
