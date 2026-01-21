/*
 * File: src/lib/hooks/use-ai.ts
 * Purpose: React hooks for AI features using TanStack Query
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
    aiApi,
    ChatRequest,
    ChatResponse,
    ChatMessage,
    CaseAnalysisRequest,
    CaseAnalysisResponse,
    DocumentSummaryRequest,
    DocumentSummaryResponse,
} from "@/lib/api/ai";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook for AI Chat with conversation history management
 */
export function useAiChat() {
    const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const sendMessage = async (message: string, context?: ChatRequest["context"]) => {
        setIsLoading(true);

        // Add user message to history
        const userMessage: ChatMessage = {
            role: "user",
            content: message,
            timestamp: new Date().toISOString(),
        };
        setConversationHistory((prev) => [...prev, userMessage]);

        try {
            const response = await aiApi.chat({
                message,
                conversationHistory,
                context,
            });

            // Add assistant response to history
            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.response,
                timestamp: new Date().toISOString(),
            };
            setConversationHistory((prev) => [...prev, assistantMessage]);

            return response;
        } catch (error) {
            toast({
                title: "Chat Error",
                description: "Failed to get a response from the AI assistant.",
                variant: "destructive",
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        setConversationHistory([]);
    };

    return {
        sendMessage,
        conversationHistory,
        clearHistory,
        isLoading,
    };
}

/**
 * Hook for case analysis
 */
export function useAnalyzeCase(caseId: number) {
    const { toast } = useToast();

    return useMutation<CaseAnalysisResponse, Error, CaseAnalysisRequest | undefined>({
        mutationFn: (request) => aiApi.analyzeCase(caseId, request),
        onSuccess: () => {
            toast({
                title: "Analysis Complete",
                description: "Case analysis has been generated successfully.",
            });
        },
        onError: (error) => {
            toast({
                title: "Analysis Failed",
                description: error.message || "Failed to analyze the case.",
                variant: "destructive",
            });
        },
    });
}

/**
 * Hook for document summarization
 */
export function useSummarizeDocument(docId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<DocumentSummaryResponse, Error, DocumentSummaryRequest | undefined>({
        mutationFn: (request) => aiApi.summarizeDocument(docId, request),
        onSuccess: (data) => {
            // Optionally cache the summary
            queryClient.setQueryData(["document-summary", docId], data);
            toast({
                title: "Summary Generated",
                description: "Document summary has been created successfully.",
            });
        },
        onError: (error) => {
            toast({
                title: "Summarization Failed",
                description: error.message || "Failed to summarize the document.",
                variant: "destructive",
            });
        },
    });
}

/**
 * Hook to trigger document summarization by document ID
 * Returns a callable function for on-demand summarization
 */
export function useDocumentSummarizer() {
    const { toast } = useToast();
    const [summaries, setSummaries] = useState<Record<number, DocumentSummaryResponse>>({});
    const [loadingDocs, setLoadingDocs] = useState<Set<number>>(new Set());

    const summarize = async (docId: number, request?: DocumentSummaryRequest) => {
        setLoadingDocs((prev) => new Set(prev).add(docId));

        try {
            const response = await aiApi.summarizeDocument(docId, request);
            setSummaries((prev) => ({ ...prev, [docId]: response }));
            return response;
        } catch (error) {
            toast({
                title: "Summarization Failed",
                description: "Failed to summarize the document.",
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoadingDocs((prev) => {
                const next = new Set(prev);
                next.delete(docId);
                return next;
            });
        }
    };

    const isLoading = (docId: number) => loadingDocs.has(docId);
    const getSummary = (docId: number) => summaries[docId];

    return {
        summarize,
        isLoading,
        getSummary,
        summaries,
    };
}
