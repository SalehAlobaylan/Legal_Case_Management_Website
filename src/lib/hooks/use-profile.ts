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
    ProfileHearing,
    UpdateProfileRequest,
} from "@/lib/api/profile";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook to fetch profile statistics
 */
export function useProfileStats() {
    return useQuery<{ stats: ProfileStats }>({
        queryKey: ["profile", "stats"],
        queryFn: () => profileApi.getStats(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch profile recent activities
 */
export function useProfileActivities(limit: number = 5) {
    return useQuery<{ activities: ProfileActivity[] }>({
        queryKey: ["profile", "activities", limit],
        queryFn: () => profileApi.getActivities(limit),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook to fetch upcoming hearings
 */
export function useProfileHearings() {
    return useQuery<{ hearings: ProfileHearing[] }>({
        queryKey: ["profile", "hearings"],
        queryFn: () => profileApi.getHearings(),
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to update profile
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { updateUser } = useAuthStore();

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
        onSuccess: (data) => {
            // Update auth store with new user data
            updateUser(data.user);

            // Invalidate profile query if we had one separate from auth store
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

/**
 * Hook to upload avatar
 */
export function useUploadAvatar() {
    const queryClient = useQueryClient();
    const { user, updateUser } = useAuthStore();

    return useMutation({
        mutationFn: (file: File) => profileApi.uploadAvatar(file),
        onSuccess: (data) => {
            // Update local user state if needed
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
