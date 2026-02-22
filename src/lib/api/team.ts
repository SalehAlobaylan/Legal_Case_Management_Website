/*
 * File: src/lib/api/team.ts
 * Purpose: API functions for team management endpoints
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";

// Types
export interface TeamMember {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: "active" | "pending" | "inactive";
    joinedAt?: string;
    lastActiveAt?: string;
}

export interface TeamListResponse {
    members: TeamMember[];
    total: number;
    organization?: {
      id: number;
      name: string;
      isPersonal: boolean;
      contactInfo?: string | null;
      country?: string;
      subscriptionTier?: string;
    };
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
    invitationCode?: string;
    expiresAt?: string;
}

export interface TeamInvitation {
  id: number;
  organizationId: number;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    organizationId: number;
  };
  token: string;
  organization: {
    id: number;
    name: string;
  };
}

export interface CreateOrganizationResponse {
  organization: {
    id: number;
    name: string;
    isPersonal: boolean;
    country: string;
    subscriptionTier: string;
  };
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    organizationId: number;
  };
  token: string;
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

    listInvitations: async (): Promise<{ invitations: TeamInvitation[]; total: number }> => {
      const response = await apiClient.get<{ invitations: TeamInvitation[]; total: number }>(
        endpoints.settings.teamInvitations
      );
      return response.data;
    },

    acceptInvitationCode: async (code: string): Promise<AcceptInvitationResponse> => {
      const response = await apiClient.post<AcceptInvitationResponse>(
        endpoints.settings.teamAcceptInvitation,
        { code }
      );
      return response.data;
    },

    updateMemberRole: async (memberId: string, role: string) => {
      const response = await apiClient.put<{ success: boolean; member: TeamMember }>(
        endpoints.settings.teamUpdateRole(memberId),
        { role }
      );
      return response.data;
    },

    removeMember: async (memberId: string) => {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        endpoints.settings.teamRemoveMember(memberId)
      );
      return response.data;
    },

    leaveOrganization: async (): Promise<AcceptInvitationResponse> => {
      const response = await apiClient.post<AcceptInvitationResponse>(
        endpoints.settings.organizationLeave
      );
      return response.data;
    },

    createOrganizationAndSwitch: async (input: {
      name: string;
      country?: string;
      subscriptionTier?: string;
      contactInfo?: string;
    }): Promise<CreateOrganizationResponse> => {
      const response = await apiClient.post<CreateOrganizationResponse>(
        endpoints.organizations.create,
        input
      );
      return response.data;
    },
};
