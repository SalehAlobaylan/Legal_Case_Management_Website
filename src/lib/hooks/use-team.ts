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
} from "@/lib/api/team";
import { useToast } from "@/components/ui/use-toast";

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
