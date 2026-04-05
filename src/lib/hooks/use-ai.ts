/*
 * File: src/lib/hooks/use-ai.ts
 * Purpose: React hooks for AI features — streaming chat, case analysis, document summarization.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import {
    aiApi,
    streamChat,
    chatSessionsApi,
    type ChatRequest,
    type ChatResponse,
    type ChatMessage,
    type CaseAnalysisRequest,
    type CaseAnalysisResponse,
    type DocumentSummaryRequest,
    type DocumentSummaryResponse,
    type StreamChatRequest,
} from "@/lib/api/ai";
import { useChatStore } from "@/lib/store/chat-store";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook for streaming AI chat with Zustand store integration.
 *
 * Uses `useChatStore.getState()` inside callbacks to always read the
 * latest store values (avoids stale closures from render-time snapshots).
 */
export function useAiChat() {
    const store = useChatStore();
    const { toast } = useToast();
    const abortRef = useRef<AbortController | null>(null);
    const queryClient = useQueryClient();

    const sendMessage = useCallback(
        (message: string, caseId?: number) => {
            const state = useChatStore.getState();

            // Add user message to store
            state.addUserMessage(message);
            state.startStreaming();

            // Consume pendingCaseId so it doesn't leak into future messages
            const effectiveCaseId = caseId ?? state.consumePendingCaseId() ?? undefined;

            const request: StreamChatRequest = {
                message,
                sessionId: state.activeSessionId,
                caseId: effectiveCaseId,
            };

            const controller = streamChat(request, {
                onToken: (token) => {
                    useChatStore.getState().appendStreamToken(token);
                },
                onCitations: (citations) => {
                    useChatStore.getState().setStreamingCitations(citations);
                },
                onSessionId: (sessionId) => {
                    if (!useChatStore.getState().activeSessionId) {
                        useChatStore.getState().setSessionId(sessionId);
                    }
                },
                onDone: () => {
                    try {
                        useChatStore.getState().finalizeStream();
                    } catch (e) {
                        console.error("[useAiChat] finalizeStream error:", e);
                    }
                    // Refresh session list so new conversations appear in history
                    queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
                },
                onError: (errorMsg) => {
                    try {
                        useChatStore.getState().finalizeStream();
                    } catch (e) {
                        console.error("[useAiChat] finalizeStream error:", e);
                    }
                    toast({
                        title: "Chat Error",
                        description: errorMsg,
                        variant: "destructive",
                    });
                },
            });

            abortRef.current = controller;
        },
        [toast, queryClient]
    );

    const stopStreaming = useCallback(() => {
        abortRef.current?.abort();
        useChatStore.getState().finalizeStream();
    }, []);

    return {
        sendMessage,
        stopStreaming,
        messages: store.messages,
        isStreaming: store.isStreaming,
        streamingContent: store.streamingContent,
        streamingCitations: store.streamingCitations,
        isOpen: store.isOpen,
        openChat: store.openChat,
        closeChat: store.closeChat,
        clearSession: store.clearSession,
        activeSessionId: store.activeSessionId,
    };
}

/**
 * Hook for listing chat sessions.
 */
export function useChatSessions() {
    return useQuery({
        queryKey: ["chat-sessions"],
        queryFn: () => chatSessionsApi.list(),
        select: (data) => data.sessions,
    });
}

/**
 * Hook for loading a specific chat session.
 */
export function useChatSession(sessionId: number | null) {
    return useQuery({
        queryKey: ["chat-session", sessionId],
        queryFn: () => chatSessionsApi.get(sessionId!),
        enabled: !!sessionId,
    });
}

/**
 * Hook for deleting a chat session.
 */
export function useDeleteChatSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: number) => chatSessionsApi.delete(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        },
    });
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

    return { summarize, isLoading, getSummary, summaries };
}
