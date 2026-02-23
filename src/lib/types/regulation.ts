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
  jurisdiction?: string;
  status: RegulationStatus;
  sourceUrl?: string;
  versionsCount?: number;
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

export interface RegulationDiffBlock {
  type: "equal" | "insert" | "delete";
  leftSegment: string;
  rightSegment: string;
}

export interface RegulationComparison {
  regulationId: number;
  fromVersion: number;
  toVersion: number;
  leftText: string;
  rightText: string;
  diffBlocks: RegulationDiffBlock[];
  summary: {
    addedLines: number;
    deletedLines: number;
    changed: boolean;
  };
}

export interface MojSourceSyncHealth {
  hasRun: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
  minutesSinceLastRun: number | null;
  scannedLastRun: number;
  versionsCreatedLastRun: number;
  failedLastRun: number;
  trackedRegulations: number;
  trackedWithVersions: number;
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
  { value: "labor_law", label: { ar: "العمل", en: "Labor" } },
  { value: "commercial_law", label: { ar: "التجاري", en: "Commercial" } },
  { value: "civil_law", label: { ar: "المدني", en: "Civil" } },
  { value: "criminal_law", label: { ar: "الجنائي", en: "Criminal" } },
  { value: "procedural_law", label: { ar: "الإجراءات", en: "Procedural" } },
] as const;
