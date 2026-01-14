/*
 * File: src/lib/utils/format.ts
 * Purpose: Consistent date, file size, and currency formatting with locale support.
 * Used by: UI components displaying dates, file sizes, and monetary values.
 */

type Locale = "ar" | "en";

/**
 * Format a date string or Date object
 */
export function formatDate(
  date: Date | string | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  },
  locale: Locale = "en"
): string {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "-";
  
  const localeCode = locale === "ar" ? "ar-SA" : "en-US";
  return dateObj.toLocaleDateString(localeCode, options);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | undefined,
  locale: Locale = "en"
): string {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "-";

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    numeric: "auto",
  });

  if (diffSec < 60) return rtf.format(-diffSec, "second");
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  if (diffHour < 24) return rtf.format(-diffHour, "hour");
  if (diffDay < 30) return rtf.format(-diffDay, "day");
  
  return formatDate(dateObj, undefined, locale);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format currency (Saudi Riyals)
 */
export function formatCurrency(
  amount: number,
  locale: Locale = "en"
): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
}

/**
 * Format case number with prefix
 */
export function formatCaseNumber(caseNumber: string | number): string {
  return `#${caseNumber}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format similarity score for AI suggestions
 */
export function formatSimilarityScore(score: number): string {
  return formatPercentage(score, 1);
}
