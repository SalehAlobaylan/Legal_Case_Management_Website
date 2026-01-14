/*
 * File: src/components/layout/language-toggle.tsx
 * Purpose: Button to toggle between Arabic and English locales.
 * Used by: Header or settings page for language switching.
 */

"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface LanguageToggleProps {
    variant?: "icon" | "text" | "full";
    className?: string;
}

export function LanguageToggle({ variant = "icon", className }: LanguageToggleProps) {
    const { locale, toggleLocale } = useI18n();

    const labels = {
        ar: { short: "ع", full: "العربية" },
        en: { short: "EN", full: "English" },
    };

    const currentLabel = labels[locale];
    const nextLocale = locale === "ar" ? "en" : "ar";
    const nextLabel = labels[nextLocale];

    if (variant === "icon") {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleLocale}
                className={cn(
                    "p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10",
                    className
                )}
                title={`Switch to ${nextLabel.full}`}
            >
                <Languages className="h-5 w-5" />
            </Button>
        );
    }

    if (variant === "text") {
        return (
            <button
                onClick={toggleLocale}
                className={cn(
                    "px-2 py-1 rounded-md text-sm font-bold",
                    "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    "dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                    "transition-colors",
                    className
                )}
                title={`Switch to ${nextLabel.full}`}
            >
                {currentLabel.short}
            </button>
        );
    }

    // Full variant with dropdown-like appearance
    return (
        <button
            onClick={toggleLocale}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                "border border-slate-200 bg-white",
                "hover:border-slate-300 hover:bg-slate-50",
                "dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700",
                "transition-colors text-sm font-medium",
                className
            )}
        >
            <Languages className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700 dark:text-slate-300">{currentLabel.full}</span>
        </button>
    );
}
