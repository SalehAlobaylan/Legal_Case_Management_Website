/*
 * File: src/lib/hooks/use-team.ts
 * Purpose: React hooks for team management using TanStack Query
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    teamApi,
    TeamListResponse,
    InviteTeamMemberInput,
    InviteTeamMemberResponse,
    TeamInvitation,
    AcceptInvitationResponse,
    CreateOrganizationResponse,
} from "@/lib/api/team";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Hook to fetch team members list
 */
export function useTeamMembers() {
    return useQuery<TeamListResponse>({
        queryKey: ["team", "members"],
        queryFn: () => teamApi.getTeamMembers(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to invite a new team member
 */
export function useInviteTeamMember() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<InviteTeamMemberResponse, Error, InviteTeamMemberInput>({
        mutationFn: (input) => teamApi.inviteTeamMember(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["team", "members"] });
            queryClient.invalidateQueries({ queryKey: ["team", "invitations"] });
            toast({
                title: "Invitation Sent",
                description: data.message || "Team member has been invited successfully.",
            });
        },
        onError: (error) => {
            toast({
                title: "Invitation Failed",
                description: error.message || "Failed to invite team member.",
                variant: "destructive",
            });
        },
    });
}

export function useTeamInvitations() {
  return useQuery<{ invitations: TeamInvitation[]; total: number }>({
    queryKey: ["team", "invitations"],
    queryFn: () => teamApi.listInvitations(),
    staleTime: 1000 * 60,
  });
}

export function useAcceptTeamInvitation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<AcceptInvitationResponse, Error, string>({
    mutationFn: (code) => teamApi.acceptInvitationCode(code),
    onSuccess: (data) => {
      setUser(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ["team", "members"] });
      queryClient.invalidateQueries({ queryKey: ["team", "invitations"] });
      toast({
        title: "Organization Joined",
        description: data.message || `You joined ${data.organization.name}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Invitation Failed",
        description: error.message || "Could not accept invitation code.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ success: boolean; member: unknown }, Error, { memberId: string; role: string }>({
    mutationFn: ({ memberId, role }) => teamApi.updateMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", "members"] });
      toast({
        title: "Role Updated",
        description: "Member role updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update member role.",
        variant: "destructive",
      });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (memberId) => teamApi.removeMember(memberId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", "members"] });
      toast({
        title: "Member Removed",
        description: data.message || "Member removed from organization.",
      });
    },
    onError: (error) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove member.",
        variant: "destructive",
      });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<AcceptInvitationResponse, Error, void>({
    mutationFn: () => teamApi.leaveOrganization(),
    onSuccess: (data) => {
      setUser(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ["team", "members"] });
      queryClient.invalidateQueries({ queryKey: ["team", "invitations"] });
      toast({
        title: "Organization Left",
        description: data.message || "You are now in your personal workspace.",
      });
    },
    onError: (error) => {
      toast({
        title: "Action Failed",
        description: error.message || "Could not leave organization.",
        variant: "destructive",
      });
    },
  });
}

export function useCreateOrganizationAndSwitch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<
    CreateOrganizationResponse,
    Error,
    { name: string; country?: string; subscriptionTier?: string; contactInfo?: string }
  >({
    mutationFn: (input) => teamApi.createOrganizationAndSwitch(input),
    onSuccess: (data) => {
      setUser(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ["team", "members"] });
      queryClient.invalidateQueries({ queryKey: ["team", "invitations"] });
      toast({
        title: "Organization Created",
        description: `Switched to ${data.organization.name}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Could not create organization.",
        variant: "destructive",
      });
    },
  });
}
