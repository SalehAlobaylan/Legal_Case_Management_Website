/*
 * File: src/lib/api/dashboard.ts
 * Purpose: API functions for dashboard statistics and recent activity
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";

// Types
export interface DashboardStats {
    activeCases: number;
    activeCasesTrend: string;
    pendingRegulations: number;
    pendingRegulationsTrend: string;
    aiDiscoveries: number;
    aiDiscoveriesTrend: string;
    casesUpdatedToday: number;
    upcomingHearings: number;
}

export interface RecentUpdate {
    id: number;
    type: "regulation_amendment" | "ai_suggestion" | "case_update" | "document_upload" | "system";
    title: string;
    description: string;
    regulationId?: number;
    caseId?: number;
    documentId?: number;
    createdAt: string;
}

export interface RecentActivityResponse {
    recentUpdates: RecentUpdate[];
}

export interface DailyTask {
    id: number;
    text: string;
    completed: boolean;
    position: number;
    createdAt: string;
    updatedAt: string;
}

export interface DailyOperationsResponse {
    upcomingHearings: Array<{
        id: number;
        title: string;
        nextHearing: string;
        courtJurisdiction?: string | null;
    }>;
    documentsForReview: Array<{
        id: number;
        caseId: number;
        caseTitle: string;
        documentName: string;
        uploadedBy: string;
        createdAt: string;
        reviewStatus: "pending" | "in_review";
        priorityLevel: "critical" | "high" | "normal";
        importanceScore: number;
        reasons: string[];
        hasRegulationChange: boolean;
        hearingSoon: boolean;
    }>;
    legalPortals: Array<{
        id: string;
        nameAr: string;
        nameEn: string;
        url: string;
        tone: "emerald" | "blue" | "amber";
    }>;
    dailyTasks: DailyTask[];
}

// API Functions
export const dashboardApi = {
    /**
     * Get dashboard statistics for the current user's organization
     */
    getStats: async (): Promise<DashboardStats> => {
        const response = await apiClient.get<DashboardStats>(endpoints.dashboard.stats);
        return response.data;
    },

    /**
     * Get recent activity and regulation updates for the dashboard
     */
    getRecentActivity: async (): Promise<RecentActivityResponse> => {
        const response = await apiClient.get<RecentActivityResponse>(
            endpoints.dashboard.recentActivity
        );
        return response.data;
    },

    getDailyOperations: async (): Promise<DailyOperationsResponse> => {
        const response = await apiClient.get<DailyOperationsResponse>(
            endpoints.dashboard.dailyOperations
        );
        return response.data;
    },

    createTask: async (text: string): Promise<DailyTask> => {
        const response = await apiClient.post<{ task: DailyTask }>(
            endpoints.dashboard.createTask,
            { text }
        );
        return response.data.task;
    },

    updateTask: async (
        id: number,
        patch: Partial<{ text: string; completed: boolean; position: number }>
    ): Promise<DailyTask> => {
        const response = await apiClient.patch<{ task: DailyTask }>(
            endpoints.dashboard.updateTask(id),
            patch
        );
        return response.data.task;
    },

    deleteTask: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.dashboard.deleteTask(id));
    },

    updateDocumentReview: async (
        id: number,
        input: { status: "pending" | "in_review" | "approved" | "rejected"; notes?: string }
    ): Promise<void> => {
        await apiClient.patch(endpoints.dashboard.updateDocumentReview(id), input);
    },
};
