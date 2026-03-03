/*
 * File: src/lib/api/documents.ts
 * Purpose: API methods for document operations.
 * Used by: TanStack Query hooks for documents.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Document, DocumentInsights } from "@/lib/types/document";

export interface DocumentsResponse {
  documents: Document[];
}

export const documentsApi = {
  /**
   * Get list of documents for a case
   */
  async getDocuments(caseId: number): Promise<Document[]> {
    const { data } = await apiClient.get<DocumentsResponse>(endpoints.documents.list(caseId));
    return data.documents;
  },

  /**
   * Upload a document to a case
   */
  async uploadDocument(caseId: number, file: File): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<{ document: Document }>(
      endpoints.documents.upload(caseId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data.document;
  },

  /**
   * Get download URL for a document (raw URL, no auth header - not suitable for direct use)
   * @deprecated Use openDocument() or downloadDocument() instead
   */
  getDownloadUrl(docId: number): string {
    return endpoints.documents.download(docId);
  },

  /**
   * Fetch a document with auth headers and open it in a new browser tab for preview.
   * @deprecated Use openDocumentInModal() instead
   */
  async openDocument(docId: number): Promise<void> {
    const response = await apiClient.get(endpoints.documents.download(docId), {
      responseType: "blob",
    });
    const contentType =
      (response.headers["content-type"] as string) || "application/octet-stream";
    const blob = new Blob([response.data as BlobPart], { type: contentType });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  },

  /**
   * Fetch a document blob for use in in-app document viewer.
   */
  async getDocumentBlobUrl(docId: number): Promise<string> {
    const response = await apiClient.get(endpoints.documents.download(docId), {
      responseType: "blob",
    });
    const contentType =
      (response.headers["content-type"] as string) || "application/octet-stream";
    const blob = new Blob([response.data as BlobPart], { type: contentType });
    return URL.createObjectURL(blob);
  },

  /**
   * Fetch a document with auth headers and trigger a file download.
   */
  async downloadDocument(docId: number, fileName: string): Promise<void> {
    const response = await apiClient.get(endpoints.documents.download(docId), {
      responseType: "blob",
    });
    const contentType =
      (response.headers["content-type"] as string) || "application/octet-stream";
    const blob = new Blob([response.data as BlobPart], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Delete a document
   */
  async deleteDocument(docId: number): Promise<void> {
    await apiClient.delete(endpoints.documents.delete(docId));
  },

  /**
   * Get AI insights for a specific document
   */
  async getDocumentInsights(docId: number): Promise<DocumentInsights> {
    const { data } = await apiClient.get<DocumentInsights>(
      endpoints.documents.insights(docId)
    );
    return data;
  },

  /**
   * Queue AI insights refresh for a specific document
   */
  async refreshDocumentInsights(docId: number): Promise<DocumentInsights> {
    const { data } = await apiClient.post<DocumentInsights>(
      endpoints.documents.refreshInsights(docId)
    );
    return data;
  },
};
