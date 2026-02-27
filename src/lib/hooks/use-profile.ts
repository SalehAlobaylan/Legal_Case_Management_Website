/*
 * File: src/lib/hooks/use-profile.ts
 * Purpose: React hooks for user profile, stats, and activities
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    profileApi,
    ProfileStats,
    ProfileActivity,
    UpdateProfileRequest,
    ActivitiesQueryParams,
    ActivitiesResponse,
} from "@/lib/api/profile";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "@/components/ui/use-toast";

export function useProfileStats() {
    return useQuery<{ stats: ProfileStats }>({
        queryKey: ["profile", "stats"],
        queryFn: () => profileApi.getStats(),
        staleTime: 1000 * 60 * 5,
    });
}

export function useProfileActivities(params: ActivitiesQueryParams = {}) {
    const { limit = 10, offset = 0, type, from, to } = params;

    return useQuery<ActivitiesResponse>({
        queryKey: ["profile", "activities", limit, offset, type, from, to],
        queryFn: () => profileApi.getActivities(params),
        staleTime: 1000 * 60 * 2,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { updateUser } = useAuthStore();

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
        onSuccess: (data) => {
            updateUser(data.user);
            queryClient.invalidateQueries({ queryKey: ["profile", "me"] });

            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile",
                variant: "destructive",
            });
        },
    });
}

export function useUploadAvatar() {
    const queryClient = useQueryClient();
    const { user, updateUser } = useAuthStore();

    return useMutation({
        mutationFn: (file: File) => profileApi.uploadAvatar(file),
        onSuccess: (data) => {
            if (user) {
                updateUser({ ...user, avatarUrl: data.avatarUrl });
            }
            queryClient.invalidateQueries({ queryKey: ["profile", "me"] });

            toast({
                title: "Success",
                description: "Profile picture updated",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: "Failed to upload image",
                variant: "destructive",
            });
        },
    });
}
