/**
 * File: src/components/ui/progress-steps.tsx
 * Purpose: Animated multi-step progress indicator for long-running operations.
 * Shows succession of steps with estimated timing to keep users comfortable while waiting.
 */

"use client";

import * as React from "react";
import {
    CheckCircle,
    Loader2,
    Circle,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ProgressStep {
    label: string;
    description?: string;
    /** Approximate duration in milliseconds for this step */
    estimatedMs: number;
}

interface ProgressStepsProps {
    /** Whether the operation is currently in progress */
    isActive: boolean;
    /** List of steps to display */
    steps: ProgressStep[];
    /** Title shown above the progress */
    title?: string;
    /** Subtitle / context */
    subtitle?: string;
    /** Variant for styling */
    variant?: "default" | "compact";
    /** Called when all steps finish (the timer completes, not the actual operation) */
    onStepsComplete?: () => void;
    /** i18n text overrides */
    i18nTexts?: {
        doneLabel?: string;
        stepLabel?: string;  // e.g. "Step" or "خطوة"
        defaultTitle?: string; // e.g. "Processing..." or "جارٍ المعالجة..."
        footerTip?: string; // e.g. "This may take a minute..."
    };
}

export function ProgressSteps({
    isActive,
    steps,
    title,
    subtitle,
    variant = "default",
    onStepsComplete,
    i18nTexts,
}: ProgressStepsProps) {
    const doneLabel = i18nTexts?.doneLabel || "Done";
    const stepLabel = i18nTexts?.stepLabel || "Step";
    const defaultTitle = i18nTexts?.defaultTitle || "Processing...";
    const footerTip = i18nTexts?.footerTip || "This may take a minute or two. Please don\u0027t close this page.";
    const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
    const [stepProgress, setStepProgress] = React.useState(0);
    const [allDone, setAllDone] = React.useState(false);
    const startTimeRef = React.useRef<number>(Date.now());
    const animFrameRef = React.useRef<number>(0);

    // Reset when operation starts
    React.useEffect(() => {
        if (isActive) {
            setCurrentStepIndex(0);
            setStepProgress(0);
            setAllDone(false);
            startTimeRef.current = Date.now();
        }
    }, [isActive]);

    // Animate progress through steps
    React.useEffect(() => {
        if (!isActive || allDone) return;

        const totalMs = steps.reduce((sum, s) => sum + s.estimatedMs, 0);

        const tick = () => {
            const elapsed = Date.now() - startTimeRef.current;

            // Find which step we're on
            let accum = 0;
            let stepIdx = 0;
            for (let i = 0; i < steps.length; i++) {
                if (elapsed < accum + steps[i].estimatedMs) {
                    stepIdx = i;
                    break;
                }
                accum += steps[i].estimatedMs;
                if (i === steps.length - 1) {
                    stepIdx = steps.length - 1;
                }
            }

            setCurrentStepIndex(stepIdx);

            // Progress within current step
            const stepStart = steps
                .slice(0, stepIdx)
                .reduce((sum, s) => sum + s.estimatedMs, 0);
            const stepElapsed = elapsed - stepStart;
            const stepDuration = steps[stepIdx].estimatedMs;
            // Cap at 95% so it doesn't look "done" before the real operation finishes
            const progress = Math.min(0.95, stepElapsed / stepDuration);
            setStepProgress(progress);

            if (elapsed >= totalMs) {
                setAllDone(true);
                onStepsComplete?.();
                return;
            }

            animFrameRef.current = requestAnimationFrame(tick);
        };

        animFrameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [isActive, allDone, steps, onStepsComplete]);

    if (!isActive) return null;

    const totalEstimated = steps.reduce((sum, s) => sum + s.estimatedMs, 0);
    const elapsed = Date.now() - startTimeRef.current;
    const overallProgress = Math.min(1, elapsed / totalEstimated);

    if (variant === "compact") {
        return (
            <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <div className="bg-[#D97706] p-1.5 rounded-lg text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0F2942] truncate">
                            {title || defaultTitle}
                        </p>
                        {subtitle && (
                            <p className="text-[10px] text-slate-500 truncate">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Overall progress bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#D97706] to-amber-400 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${overallProgress * 100}%` }}
                    />
                </div>

                {/* Current step */}
                <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-[#D97706]" />
                    <span className="text-[11px] text-slate-600 font-medium">
                        {steps[currentStepIndex]?.label}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                        {stepLabel} {currentStepIndex + 1}/{steps.length}
                    </span>
                </div>
            </div>
        );
    }

    // Default (full) variant
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
            {/* Gradient header */}
            <div className="bg-gradient-to-r from-[#0F2942] to-[#1a3a5c] px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm animate-pulse">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">
                            {title || defaultTitle}
                        </p>
                        {subtitle && (
                            <p className="text-[11px] text-white/60 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Overall progress */}
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#D97706] to-amber-400 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${overallProgress * 100}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-white/80 tabular-nums whitespace-nowrap">
                        {Math.round(overallProgress * 100)}%
                    </span>
                </div>
            </div>

            {/* Steps list */}
            <div className="px-6 py-4 space-y-1">
                {steps.map((step, i) => {
                    const isCompleted = i < currentStepIndex || (allDone && isActive);
                    const isCurrent = i === currentStepIndex && !allDone;
                    const isPending = i > currentStepIndex;

                    return (
                        <div
                            key={i}
                            className={cn(
                                "flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300",
                                isCurrent && "bg-amber-50 border border-amber-100",
                                isCompleted && "opacity-60"
                            )}
                        >
                            {/* Icon */}
                            {isCompleted ? (
                                <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                            ) : isCurrent ? (
                                <Loader2 className="h-4.5 w-4.5 text-[#D97706] animate-spin shrink-0" />
                            ) : (
                                <Circle className="h-4.5 w-4.5 text-slate-300 shrink-0" />
                            )}

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className={cn(
                                        "text-xs font-bold",
                                        isCompleted
                                            ? "text-emerald-700"
                                            : isCurrent
                                                ? "text-[#0F2942]"
                                                : "text-slate-400"
                                    )}
                                >
                                    {step.label}
                                </p>
                                {step.description && isCurrent && (
                                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                        {step.description}
                                    </p>
                                )}
                            </div>

                            {/* Step progress bar (current step only) */}
                            {isCurrent && (
                                <div className="w-20 h-1.5 bg-amber-100 rounded-full overflow-hidden shrink-0">
                                    <div
                                        className="h-full bg-[#D97706] rounded-full transition-all duration-300"
                                        style={{ width: `${stepProgress * 100}%` }}
                                    />
                                </div>
                            )}

                            {isCompleted && (
                                <span className="text-[10px] font-bold text-emerald-600 shrink-0">
                                    {doneLabel}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer tip */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 text-center">
                    {footerTip}
                </p>
            </div>
        </div>
    );
}
