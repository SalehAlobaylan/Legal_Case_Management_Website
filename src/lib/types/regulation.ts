/*
 * File: src/lib/types/regulation.ts
 * Purpose: TypeScript types for regulations and their versions.
 * Used by: API hooks and UI components dealing with regulations.
 */

export enum RegulationStatus {
  ACTIVE = "active",
  AMENDED = "amended",
  REPEALED = "repealed",
  DRAFT = "draft",
}

export interface Regulation {
  id: number;
  title: string;
  regulationNumber?: string;
  category?: string;
  jurisdiction: string;
  status: RegulationStatus;
  currentVersionId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegulationVersion {
  id: number;
  regulationId: number;
  versionNumber: number;
  effectiveDate?: string;
  sourceUrl?: string;
  contentText: string;
  contentHash: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface RegulationSubscription {
  id: number;
  organizationId: number;
  regulationId: number;
  sourceUrl: string;
  lastCheckedAt?: string;
  lastContentHash?: string;
  checkIntervalHours: number;
  isActive: boolean;
  createdAt: string;
}

// UI-specific types
export const REGULATION_STATUS_CONFIG = {
  active: {
    label: { ar: "نشط", en: "Active" },
    color: "green" as const,
  },
  amended: {
    label: { ar: "معدل", en: "Amended" },
    color: "yellow" as const,
  },
  repealed: {
    label: { ar: "ملغى", en: "Repealed" },
    color: "red" as const,
  },
  draft: {
    label: { ar: "مسودة", en: "Draft" },
    color: "gray" as const,
  },
};

export const REGULATION_CATEGORIES = [
  { value: "labor", label: { ar: "العمل", en: "Labor" } },
  { value: "commercial", label: { ar: "التجاري", en: "Commercial" } },
  { value: "civil", label: { ar: "المدني", en: "Civil" } },
  { value: "criminal", label: { ar: "الجنائي", en: "Criminal" } },
  { value: "administrative", label: { ar: "الإداري", en: "Administrative" } },
  { value: "family", label: { ar: "الأحوال الشخصية", en: "Family" } },
  { value: "digital", label: { ar: "الرقمي", en: "Digital" } },
] as const;
