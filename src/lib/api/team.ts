/*
 * File: src/lib/api/team.ts
 * Purpose: API functions for team management endpoints
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";

// Types
export interface TeamMember {
    id: number;
    fullName: string;
    email: string;
    role: string;
    status: "active" | "pending" | "inactive";
    joinedAt: string;
    lastActiveAt?: string;
}

export interface TeamListResponse {
    members: TeamMember[];
    total: number;
}

export interface InviteTeamMemberInput {
    email: string;
    role: string;
    message?: string;
}

export interface InviteTeamMemberResponse {
    success: boolean;
    message: string;
    inviteId?: number;
}

// API Functions
export const teamApi = {
    /**
     * List all team members in the organization
     */
    getTeamMembers: async (): Promise<TeamListResponse> => {
        const response = await apiClient.get<TeamListResponse>(endpoints.settings.team);
        return response.data;
    },

    /**
     * Invite a new team member to the organization
     */
    inviteTeamMember: async (input: InviteTeamMemberInput): Promise<InviteTeamMemberResponse> => {
        const response = await apiClient.post<InviteTeamMemberResponse>(
            endpoints.settings.teamInvite,
            input
        );
        return response.data;
    },
};
