/*
 * File: src/lib/api/profile.ts
 * Purpose: API functions for user profile, stats, and activities
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import { User } from "@/lib/store/auth-store";

// Types
export interface ProfileStats {
    activeCases: number;
    totalClients: number;
    winRate: number;
    avgCaseDuration: number;
    // Additional metrics for compatibility with existing UI
    winRateChange?: number;
    avgDurationChange?: number;
    clientSatisfaction?: number;
    satisfactionChange?: number;
    regulationsReviewed?: number;
    aiSuggestionsAccepted?: number;
    documentsProcessed?: number;
    thisMonthHours?: number;
    hoursChange?: number;
}

export interface ProfileActivity {
    id: number;
    type: "case" | "regulation" | "document" | "login" | "other";
    title?: string;
    description: string;
    date: string; // ISO date
    action?: string; // Optional action name
}

export interface ProfileHearing {
    id: number;
    caseId: number;
    caseName: string;
    caseNumber: string;
    date: string;
    time: string;
    location: string;
}

export interface UpdateProfileRequest {
    fullName?: string;
    phone?: string;
    location?: string;
    bio?: string;
    specialization?: string;
}

// API Functions
export const profileApi = {
    /**
     * Get current user profile
     */
    getProfile: async (): Promise<{ user: User }> => {
        const response = await apiClient.get<{ user: User }>(endpoints.profile.get);
        return response.data;
    },

    /**
     * Update user profile
     */
    updateProfile: async (data: UpdateProfileRequest): Promise<{ user: User }> => {
        const response = await apiClient.put<{ user: User }>(endpoints.profile.update, data);
        return response.data;
    },

    /**
     * Get profile statistics (KPIs)
     */
    getStats: async (): Promise<{ stats: ProfileStats }> => {
        const response = await apiClient.get<{ stats: ProfileStats }>(endpoints.profile.stats);
        return response.data;
    },

    /**
     * Get recent activities
     */
    getActivities: async (limit: number = 5): Promise<{ activities: ProfileActivity[] }> => {
        const response = await apiClient.get<{ activities: ProfileActivity[] }>(endpoints.profile.activities, {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Get upcoming hearings
     */
    getHearings: async (): Promise<{ hearings: ProfileHearing[] }> => {
        const response = await apiClient.get<{ hearings: ProfileHearing[] }>(endpoints.profile.hearings);
        return response.data;
    },

    /**
     * Upload profile avatar
     */
    uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post<{ avatarUrl: string }>(
            endpoints.profile.avatar,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },
};
