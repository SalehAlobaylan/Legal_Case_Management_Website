/*
 * File: src/lib/api/ai.ts
 * Purpose: API functions for AI features - chat (streaming + non-streaming),
 *          case analysis, document summarization, and session management.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import { useAuthStore } from "@/lib/store/auth-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: string;
}

export interface ChatRequest {
    message: string;
    conversationHistory?: ChatMessage[];
    context?: {
        caseId?: number;
        regulationId?: number;
    };
}

export interface ChatResponse {
    response: string;
    sources?: {
        type: "regulation" | "case" | "document";
        id: number;
        title: string;
        relevance: number;
    }[];
    conversationId?: string;
}

export interface ChatCitation {
    regulation_id: number;
    regulation_title: string;
    article_ref?: string | null;
    chunk_id?: number | null;
}

export interface ChatSession {
    id: number;
    title: string | null;
    caseId?: number | null;
    language: string;
    createdAt: string;
    updatedAt: string;
    messages?: {
        id: number;
        role: string;
        content: string;
        citations: ChatCitation[];
        createdAt: string;
    }[];
}

export interface StreamChatRequest {
    message: string;
    sessionId?: number | null;
    caseId?: number | null;
    language?: string;
}

export interface CaseAnalysisRequest {
    analysisType?: "full" | "strengths" | "weaknesses" | "strategy" | "risks";
}

export interface CaseAnalysisResponse {
    analysis: {
        summary: string;
        strengths: string[];
        weaknesses: string[];
        risks: string[];
        recommendations: string[];
        relevantRegulations: {
            id: number;
            title: string;
            relevance: string;
        }[];
        suggestedStrategy?: string;
    };
    confidence: number;
    generatedAt: string;
}

export interface DocumentSummaryRequest {
    summaryType?: "brief" | "detailed" | "key-points";
    language?: "ar" | "en";
}

export interface DocumentSummaryResponse {
    summary: string;
    keyPoints: string[];
    documentType?: string;
    pageCount?: number;
    generatedAt: string;
}

// ---------------------------------------------------------------------------
// SSE Streaming
// ---------------------------------------------------------------------------

/**
 * Stream a chat response from the backend via SSE.
 * Returns an AbortController to cancel the stream.
 */
/** Default timeout for streaming chat requests (60 seconds). */
const STREAM_TIMEOUT_MS = 60_000;

export function streamChat(
    request: StreamChatRequest,
    callbacks: {
        onToken: (token: string) => void;
        onCitations: (citations: ChatCitation[]) => void;
        onSessionId: (sessionId: number) => void;
        onDone: () => void;
        onError: (message: string) => void;
    }
): AbortController {
    const controller = new AbortController();
    const token = useAuthStore.getState().token;

    // Track whether the abort was user-initiated vs timeout
    let userAborted = false;
    const originalAbort = controller.abort.bind(controller);
    controller.abort = () => { userAborted = true; originalAbort(); };

    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

    (async () => {
        try {
            const response = await fetch(endpoints.ai.chatStream, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(request),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "Unknown error");
                callbacks.onError(`Server error: ${response.status} ${errorText}`);
                return;
            }

            // Read session ID from header
            const sessionIdHeader = response.headers.get("X-Chat-Session-Id");
            if (sessionIdHeader) {
                callbacks.onSessionId(parseInt(sessionIdHeader, 10));
            }

            const reader = response.body?.getReader();
            if (!reader) {
                callbacks.onError("No response stream available");
                return;
            }

            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const data = line.slice(6).trim();

                    if (data === "[DONE]") {
                        callbacks.onDone();
                        return;
                    }

                    try {
                        const event = JSON.parse(data);
                        if (event.type === "token" && typeof event.content === "string") {
                            callbacks.onToken(event.content);
                        } else if (event.type === "citations" && Array.isArray(event.citations)) {
                            callbacks.onCitations(event.citations);
                        } else if (event.type === "error") {
                            callbacks.onError(event.message || "Unknown error");
                            return;
                        }
                    } catch {
                        // Non-JSON SSE data, skip
                    }
                }
            }

            // Stream ended without [DONE]
            callbacks.onDone();
        } catch (err: any) {
            if (err.name === "AbortError") {
                if (userAborted) {
                    // User clicked stop — silently finish
                    return;
                }
                // Timeout
                callbacks.onError("Request timed out. Please try again.");
                return;
            }
            callbacks.onError(err.message || "Connection failed");
        } finally {
            clearTimeout(timeoutId);
        }
    })();

    return controller;
}

// ---------------------------------------------------------------------------
// Session management
// ---------------------------------------------------------------------------

export const chatSessionsApi = {
    list: async (limit = 20, offset = 0): Promise<{ sessions: ChatSession[] }> => {
        const response = await apiClient.get<{ sessions: ChatSession[] }>(
            `${endpoints.ai.chatSessions}?limit=${limit}&offset=${offset}`
        );
        return response.data;
    },

    get: async (sessionId: number): Promise<ChatSession> => {
        const response = await apiClient.get<ChatSession>(
            endpoints.ai.chatSession(sessionId)
        );
        return response.data;
    },

    delete: async (sessionId: number): Promise<void> => {
        await apiClient.delete(endpoints.ai.chatSession(sessionId));
    },
};

// ---------------------------------------------------------------------------
// Non-streaming API (backward compat)
// ---------------------------------------------------------------------------

export const aiApi = {
    chat: async (request: ChatRequest): Promise<ChatResponse> => {
        const response = await apiClient.post<ChatResponse>(endpoints.ai.chat, request);
        return response.data;
    },

    analyzeCase: async (
        caseId: number,
        request?: CaseAnalysisRequest
    ): Promise<CaseAnalysisResponse> => {
        const response = await apiClient.post<CaseAnalysisResponse>(
            endpoints.ai.analyzeCase(caseId),
            request || {},
            // LLM-bound: needs more than the default 30s axios budget.
            { timeout: 60000 }
        );
        return response.data;
    },

    summarizeDocument: async (
        docId: number,
        request?: DocumentSummaryRequest
    ): Promise<DocumentSummaryResponse> => {
        const response = await apiClient.post<DocumentSummaryResponse>(
            endpoints.ai.summarizeDocument(docId),
            request || {}
        );
        return response.data;
    },
};
