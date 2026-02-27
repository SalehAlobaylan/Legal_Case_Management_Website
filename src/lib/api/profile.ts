/*
 * File: src/lib/api/profile.ts
 * Purpose: API functions for user profile, stats, and activities
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import { User } from "@/lib/store/auth-store";

export interface ProfileStats {
    activeCases: number;
    totalCases: number;
    closedCases: number;
    pendingCases: number;
    totalClients: number;
    winRate: number;
    avgCaseDuration: number;
    winRateChange: number;
    avgDurationChange: number;
    clientSatisfaction: number;
    satisfactionChange: number;
    regulationsReviewed: number;
    aiSuggestionsAccepted: number;
    documentsProcessed: number;
    thisMonthHours: number;
    hoursChange: number;
}

export type ActivityType = "case" | "regulation" | "document" | "client";
export type ActivityAction = "created" | "updated" | "closed" | "reviewed" | "uploaded";

export interface ProfileActivity {
    id: number;
    type: ActivityType;
    action: ActivityAction;
    title: string;
    referenceId: number | null;
    createdAt: string;
}

export interface ActivitiesResponse {
    activities: ProfileActivity[];
    total: number;
    hasMore: boolean;
}

export interface ActivitiesQueryParams {
    limit?: number;
    offset?: number;
    type?: ActivityType;
    from?: string;
    to?: string;
}

export interface UpdateProfileRequest {
    fullName?: string;
    phone?: string;
    location?: string;
    bio?: string;
    specialization?: string;
}

export interface ProfileUser extends User {
    organizationName?: string;
    createdAt?: string;
}

export const profileApi = {
    getProfile: async (): Promise<{ user: ProfileUser }> => {
        const response = await apiClient.get<{ user: ProfileUser }>(endpoints.profile.get);
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<{ user: User }> => {
        const response = await apiClient.put<{ user: User }>(endpoints.profile.update, data);
        return response.data;
    },

    getStats: async (): Promise<{ stats: ProfileStats }> => {
        const response = await apiClient.get<{ stats: ProfileStats }>(endpoints.profile.stats);
        return response.data;
    },

    getActivities: async (params: ActivitiesQueryParams = {}): Promise<ActivitiesResponse> => {
        const response = await apiClient.get<ActivitiesResponse>(endpoints.profile.activities, {
            params,
        });
        return response.data;
    },

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
