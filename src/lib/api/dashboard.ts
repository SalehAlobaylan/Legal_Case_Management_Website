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
};
