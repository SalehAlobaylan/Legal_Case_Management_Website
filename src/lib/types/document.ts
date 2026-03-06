/*
 * File: src/lib/types/document.ts
 * Purpose: TypeScript types for case documents.
 * Used by: API hooks and UI components for document management.
 */

export interface Document {
  id: number;
  caseId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: number;
  uploadedByName?: string;
  createdAt: string;
  extractionStatus?: "pending" | "processing" | "ready" | "failed" | "unsupported";
  extractionMethod?: string | null;
  extractionErrorCode?: string | null;
  extractionWarnings?: string[];
  insightsStatus?: "pending" | "processing" | "ready" | "failed" | "unsupported";
  insightsUpdatedAt?: string | null;
  hasInsights?: boolean;
}

export interface DocumentInsightHighlight {
  snippet: string;
  score: number;
  sentenceStart: number;
  sentenceEnd: number;
}

export interface DocumentInsights {
  documentId: number;
  status: "pending" | "processing" | "ready" | "failed" | "unsupported";
  summary: string | null;
  highlights: DocumentInsightHighlight[];
  method: string | null;
  errorCode: string | null;
  warnings: string[];
  updatedAt: string | null;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Allowed file types for upload
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
  "text/csv",
  "text/tab-separated-values",
  "text/markdown",
  "application/rtf",
  "image/jpeg",
  "image/png",
] as const;

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".xlsx",
  ".xls",
  ".csv",
  ".tsv",
  ".dsv",
  ".txt",
  ".md",
  ".rtf",
  ".jpg",
  ".jpeg",
  ".png",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper to check if a file type is allowed (by MIME type or extension)
export function isAllowedFileType(mimeType: string, fileName?: string): boolean {
  if (ALLOWED_FILE_TYPES.includes(mimeType as typeof ALLOWED_FILE_TYPES[number])) {
    return true;
  }
  // Browsers may send generic MIME for unusual extensions (.dsv, .tsv, .rtf, etc.)
  if (fileName) {
    const ext = getFileExtension(fileName);
    if (ext && ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number])) {
      return true;
    }
  }
  return false;
}

// Helper to get file extension
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.substring(lastDot).toLowerCase();
}
