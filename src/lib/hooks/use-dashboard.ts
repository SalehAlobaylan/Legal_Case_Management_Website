/*
 * File: src/lib/hooks/use-dashboard.ts
 * Purpose: React hooks for dashboard statistics and recent activity using TanStack Query
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import {
    dashboardApi,
    DashboardStats,
    RecentActivityResponse,
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
