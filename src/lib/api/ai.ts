/*
 * File: src/lib/api/ai.ts
 * Purpose: API functions for AI features - chat, case analysis, document summarization
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";

// Types
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

// API Functions
export const aiApi = {
    /**
     * Send a message to the Legal Chat Assistant
     */
    chat: async (request: ChatRequest): Promise<ChatResponse> => {
        const response = await apiClient.post<ChatResponse>(endpoints.ai.chat, request);
        return response.data;
    },

    /**
     * Analyze a case for strategy, strengths, weaknesses, and risks
     */
    analyzeCase: async (
        caseId: number,
        request?: CaseAnalysisRequest
    ): Promise<CaseAnalysisResponse> => {
        const response = await apiClient.post<CaseAnalysisResponse>(
            endpoints.ai.analyzeCase(caseId),
            request || {}
        );
        return response.data;
    },

    /**
     * Summarize a document using AI
     */
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
