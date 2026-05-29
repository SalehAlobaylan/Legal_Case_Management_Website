"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  type AdminCommandCenterResponse,
  type AdminDashboardSettings,
} from "@/lib/api/admin";
import { toast } from "@/components/ui/use-toast";

export function useAdminCommandCenter(enabled = true) {
  return useQuery<AdminCommandCenterResponse>({
    queryKey: ["admin-command-center"],
    queryFn: () => adminApi.getCommandCenter(),
    enabled,
    staleTime: 30_000,
  });
}

export function useAdminDashboardSettings(enabled = true) {
  return useQuery<AdminDashboardSettings>({
    queryKey: ["admin-dashboard-settings"],
    queryFn: () => adminApi.getDashboardSettings(),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateAdminDashboardSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateDashboardSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-dashboard-settings"] });
      qc.invalidateQueries({ queryKey: ["admin-command-center"] });
      qc.invalidateQueries({ queryKey: ["admin-audit-log"] });
      toast({ title: "Dashboard settings updated" });
    },
    onError: () => {
      toast({
        title: "Could not update dashboard settings",
        variant: "destructive",
      });
    },
  });
}
