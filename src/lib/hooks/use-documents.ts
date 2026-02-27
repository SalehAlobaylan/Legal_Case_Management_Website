/*
 * File: src/lib/hooks/use-documents.ts
 * Purpose: TanStack Query hooks for document operations.
 * Used by: Document manager component in case details.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/lib/api/documents";
import type { DocumentInsights } from "@/lib/types/document";

/**
 * Hook for fetching documents for a case
 */
export function useDocuments(caseId: number) {
  return useQuery({
    queryKey: ["documents", caseId],
    queryFn: () => documentsApi.getDocuments(caseId),
    enabled: !!caseId,
  });
}

/**
 * Hook for uploading a document
 */
export function useUploadDocument(caseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => documentsApi.uploadDocument(caseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", caseId] });
    },
  });
}

/**
 * Hook for deleting a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docId: number) => documentsApi.deleteDocument(docId),
    onSuccess: () => {
      // Invalidate all document queries since we don't know the caseId
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

/**
 * Get the download URL for a document
 */
export function getDocumentDownloadUrl(docId: number): string {
  return documentsApi.getDownloadUrl(docId);
}

/**
 * Hook for fetching case-focused AI insights for a document
 */
export function useDocumentInsights(docId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["document-insights", docId],
    queryFn: () => documentsApi.getDocumentInsights(docId),
    enabled: Boolean(docId) && enabled,
    refetchInterval: (query) => {
      const state = query.state.data as DocumentInsights | undefined;
      if (!state) {
        return 10000;
      }
      return state.status === "pending" || state.status === "processing"
        ? 10000
        : false;
    },
  });
}

/**
 * Hook for forcing document insights regeneration
 */
export function useRefreshDocumentInsights(caseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docId: number) => documentsApi.refreshDocumentInsights(docId),
    onSuccess: (data) => {
      queryClient.setQueryData(["document-insights", data.documentId], data);
      queryClient.invalidateQueries({ queryKey: ["documents", caseId] });
    },
  });
}
