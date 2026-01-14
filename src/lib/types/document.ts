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
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Allowed file types for upload
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
] as const;

export const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png"] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper to check if a file type is allowed
export function isAllowedFileType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimeType as typeof ALLOWED_FILE_TYPES[number]);
}

// Helper to get file extension
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.substring(lastDot).toLowerCase();
}
