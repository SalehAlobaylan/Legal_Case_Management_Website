/*
 * File: src/lib/types/alert.ts
 * Purpose: TypeScript types for alerts and notifications.
 * Used by: API hooks and UI components for the alerts panel.
 */

export type AlertType = "case_update" | "ai_suggestion" | "regulation_update" | "document_upload" | "system";

export interface Alert {
  id: number;
  userId: string | number;
  type: AlertType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    caseId?: number;
    regulationId?: number;
    documentId?: number;
    linkUrl?: string;
  };
  createdAt: string;
}

// UI-specific types
export const ALERT_TYPE_CONFIG = {
  case_update: {
    label: { ar: "تحديث قضية", en: "Case Update" },
    icon: "Briefcase",
    color: "blue",
  },
  ai_suggestion: {
    label: { ar: "اقتراح ذكي", en: "AI Suggestion" },
    icon: "Sparkles",
    color: "purple",
  },
  regulation_update: {
    label: { ar: "تحديث نظام", en: "Regulation Update" },
    icon: "Scale",
    color: "yellow",
  },
  document_upload: {
    label: { ar: "مستند جديد", en: "Document Upload" },
    icon: "FileText",
    color: "green",
  },
  system: {
    label: { ar: "إشعار النظام", en: "System" },
    icon: "Bell",
    color: "gray",
  },
} as const;
