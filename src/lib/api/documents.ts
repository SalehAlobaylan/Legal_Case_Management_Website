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
   * Get download URL for a document
   */
  getDownloadUrl(docId: number): string {
    return endpoints.documents.download(docId);
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
