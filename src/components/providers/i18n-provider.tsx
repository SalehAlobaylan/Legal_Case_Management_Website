/*
 * File: src/components/providers/i18n-provider.tsx
 * Purpose: Provider that sets HTML lang and dir attributes based on locale.
 * Used by: Root layout to ensure RTL/LTR is applied globally.
 */

"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store/ui-store";
import { getDirection, getHtmlLang } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

interface I18nProviderProps {
    children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
    const locale = useUIStore((state) => state.locale) as Locale;

    useEffect(() => {
        // Update document attributes when locale changes
        document.documentElement.lang = getHtmlLang(locale);
        document.documentElement.dir = getDirection(locale);

        // Update body class for RTL-specific styles
        if (locale === "ar") {
            document.body.classList.add("rtl");
            document.body.classList.remove("ltr");
        } else {
            document.body.classList.add("ltr");
            document.body.classList.remove("rtl");
        }
    }, [locale]);

    return <>{children}</>;
}
