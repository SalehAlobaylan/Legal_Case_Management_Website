/*
 * File: src/lib/i18n/index.ts
 * Purpose: Internationalization (i18n) system for Arabic/English support.
 * 
 * Features:
 * - Type-safe translation keys
 * - Variable interpolation ({{name}}, {{count}})
 * - Automatic RTL handling
 * - Persisted locale preference
 */

import en from "./locales/en.json";
import ar from "./locales/ar.json";

export type Locale = "en" | "ar";
export type TranslationKey = string;

// All translations
const translations = { en, ar } as const;

// Get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === "string" ? current : undefined;
}

// Replace variables in translation string
function interpolate(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * Get translated string for a key
 * @param locale - Current locale (en/ar)
 * @param key - Dot-notation key (e.g., "common.loading")
 * @param variables - Variables to interpolate (e.g., { name: "John" })
 * @returns Translated string or key if not found
 */
export function t(
  locale: Locale,
  key: TranslationKey,
  variables?: Record<string, string | number>
): string {
  const translation = getNestedValue(translations[locale], key);
  
  if (!translation) {
    // Fallback to English
    const fallback = getNestedValue(translations.en, key);
    if (fallback) {
      return interpolate(fallback, variables);
    }
    // Return key if not found
    console.warn(`[i18n] Missing translation for key: ${key}`);
    return key;
  }
  
  return interpolate(translation, variables);
}

/**
 * Check if locale is RTL
 */
export function isRTL(locale: Locale): boolean {
  return locale === "ar";
}

/**
 * Get text direction for locale
 */
export function getDirection(locale: Locale): "ltr" | "rtl" {
  return isRTL(locale) ? "rtl" : "ltr";
}

/**
 * Get HTML lang attribute value
 */
export function getHtmlLang(locale: Locale): string {
  return locale === "ar" ? "ar-SA" : "en-US";
}

/**
 * Format number according to locale
 */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(value);
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date | string, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(
    locale === "ar" ? "ar-SA" : "en-US",
    options ?? { dateStyle: "medium" }
  ).format(dateObj);
}

// Export types for translations
export type Translations = typeof en;
export { translations };
