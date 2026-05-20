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
      restrictCaseVisibility?: boolean;
      settings?: {
        privacy?: {
          documents?: boolean;
          clients?: boolean;
          teamDirectory?: boolean;
          adminClosureRequired?: boolean;
        };
        [k: string]: unknown;
      };
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

    /**
     * Toggle a member's on-leave flag (admin only).
     */
    setMemberOnLeave: async (memberId: string, isOnLeave: boolean) => {
      const response = await apiClient.patch<{
        success: boolean;
        member: { id: string; fullName: string | null; email: string; isOnLeave: boolean };
      }>(endpoints.settings.teamMemberLeave(memberId), { isOnLeave });
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

    /**
     * Revoke a pending invitation (admin only). The code stops working.
     */
    revokeInvitation: async (
      id: number
    ): Promise<{ success: boolean; invitation: TeamInvitation }> => {
      const response = await apiClient.delete<{ success: boolean; invitation: TeamInvitation }>(
        endpoints.settings.teamInvitationRevoke(id)
      );
      return response.data;
    },

    /**
     * Resend (rotate) an invitation code (admin only). Returns the new code.
     */
    resendInvitation: async (
      id: number
    ): Promise<{ success: boolean; invitation: TeamInvitation; invitationCode: string; expiresAt: string }> => {
      const response = await apiClient.post<{
        success: boolean;
        invitation: TeamInvitation;
        invitationCode: string;
        expiresAt: string;
      }>(endpoints.settings.teamInvitationResend(id));
      return response.data;
    },

    /**
     * List granted permissions for a team member (admin only).
     */
    getMemberPermissions: async (
      memberId: string
    ): Promise<{ permissions: string[]; grantable: string[] }> => {
      const response = await apiClient.get<{ permissions: string[]; grantable: string[] }>(
        endpoints.settings.teamMemberPermissions(memberId)
      );
      return response.data;
    },

    /**
     * Grant a permission to a team member (admin only).
     */
    grantMemberPermission: async (
      memberId: string,
      permission: string
    ): Promise<{ permissions: string[] }> => {
      const response = await apiClient.post<{ permissions: string[] }>(
        endpoints.settings.teamMemberPermissions(memberId),
        { permission }
      );
      return response.data;
    },

    /**
     * Revoke a permission from a team member (admin only).
     */
    revokeMemberPermission: async (
      memberId: string,
      permission: string
    ): Promise<{ permissions: string[] }> => {
      const response = await apiClient.delete<{ permissions: string[] }>(
        endpoints.settings.teamMemberPermission(memberId, permission)
      );
      return response.data;
    },
};

/**
 * Privacy & sharing toggles live under `organizations.settings.privacy`.
 * Each one is a boolean tag; the matching `delegated.*.viewAll` permission
 * exempts an individual user from the policy.
 */
export interface OrgPrivacySettings {
  documents?: boolean;
  clients?: boolean;
  teamDirectory?: boolean;
  adminClosureRequired?: boolean;
}

export interface OrgSettings {
  privacy?: OrgPrivacySettings;
  [k: string]: unknown;
}

export interface UpdateOrganizationInput {
  name?: string;
  contactInfo?: string;
  restrictCaseVisibility?: boolean;
  settings?: OrgSettings;
}

export interface OrganizationDto {
  id: number;
  name: string;
  isPersonal?: boolean;
  restrictCaseVisibility?: boolean;
  settings?: OrgSettings;
  contactInfo?: string | null;
}

/**
 * Settings API — organization metadata patching (admin only).
 */
export const organizationSettingsApi = {
  async updateOrganization(patch: UpdateOrganizationInput): Promise<OrganizationDto> {
    const response = await apiClient.patch<{ organization: OrganizationDto }>(
      endpoints.settings.organization,
      patch
    );
    return response.data.organization;
  },
};
