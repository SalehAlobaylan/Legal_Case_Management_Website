/*
 * File: src/lib/hooks/use-dashboard.ts
 * Purpose: React hooks for dashboard statistics and recent activity using TanStack Query
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    dashboardApi,
    DashboardStats,
    RecentActivityResponse,
    DailyOperationsResponse,
} from "@/lib/api/dashboard";

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
    return useQuery<DashboardStats>({
        queryKey: ["dashboard", "stats"],
        queryFn: () => dashboardApi.getStats(),
        staleTime: 1000 * 60 * 2, // 2 minutes - refresh frequently for real-time feel
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to fetch recent activity for the dashboard
 */
export function useRecentActivity() {
    return useQuery<RecentActivityResponse>({
        queryKey: ["dashboard", "recent-activity"],
        queryFn: () => dashboardApi.getRecentActivity(),
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: true,
    });
}

export function useDailyOperations() {
    return useQuery<DailyOperationsResponse>({
        queryKey: ["dashboard", "daily-operations"],
        queryFn: () => dashboardApi.getDailyOperations(),
        staleTime: 1000 * 30,
        refetchOnWindowFocus: true,
    });
}

export function useCreateDailyTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (text: string) => dashboardApi.createTask(text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard", "daily-operations"] });
        },
    });
}

export function useUpdateDailyTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, patch }: { id: number; patch: Partial<{ text: string; completed: boolean; position: number }> }) =>
            dashboardApi.updateTask(id, patch),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard", "daily-operations"] });
        },
    });
}

export function useDeleteDailyTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => dashboardApi.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard", "daily-operations"] });
        },
    });
}

export function useUpdateDocumentReviewStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, notes }: { id: number; status: "pending" | "in_review" | "approved" | "rejected"; notes?: string }) =>
            dashboardApi.updateDocumentReview(id, { status, notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard", "daily-operations"] });
        },
    });
}
