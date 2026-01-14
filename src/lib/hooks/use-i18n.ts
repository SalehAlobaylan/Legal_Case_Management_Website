"use client";

/*
 * File: src/lib/hooks/use-i18n.ts
 * Purpose: React hook for accessing translations and locale state.
 * 
 * Usage:
 * const { t, locale, setLocale, isRTL, dir } = useI18n();
 * <h1>{t("dashboard.welcome", { name: "Ahmed" })}</h1>
 */

import { useCallback, useMemo } from "react";
import { useUIStore } from "@/lib/store/ui-store";
import { 
  t as translate, 
  isRTL as checkRTL, 
  getDirection,
  formatNumber as formatNum,
  formatDate as formatDt,
  type Locale, 
  type TranslationKey 
} from "@/lib/i18n";

export function useI18n() {
  const locale = useUIStore((state) => state.locale) as Locale;
  const setLocale = useUIStore((state) => state.setLocale);

  // Memoized translation function
  const t = useCallback(
    (key: TranslationKey, variables?: Record<string, string | number>) => {
      return translate(locale, key, variables);
    },
    [locale]
  );

  // Format number with locale
  const formatNumber = useCallback(
    (value: number) => formatNum(value, locale),
    [locale]
  );

  // Format date with locale
  const formatDate = useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions) => 
      formatDt(date, locale, options),
    [locale]
  );

  // Memoized RTL check
  const isRTL = useMemo(() => checkRTL(locale), [locale]);
  
  // Memoized direction
  const dir = useMemo(() => getDirection(locale), [locale]);

  // Toggle between locales
  const toggleLocale = useCallback(() => {
    setLocale(locale === "ar" ? "en" : "ar");
  }, [locale, setLocale]);

  return {
    locale,
    setLocale,
    toggleLocale,
    t,
    isRTL,
    dir,
    formatNumber,
    formatDate,
  };
}

// Re-export types for convenience
export type { Locale, TranslationKey };
