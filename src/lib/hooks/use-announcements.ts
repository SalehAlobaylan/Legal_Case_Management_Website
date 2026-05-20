"use client";

/*
 * File: src/lib/hooks/use-announcements.ts
 * Purpose: React Query wrappers for /api/announcements/*.
 *
 *   - useActiveAnnouncements() — visible to any authenticated org member
 *   - useAdminAnnouncements()  — admin-only, returns active + retired
 *   - useCreate/Update/DeleteAnnouncement — admin mutations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  announcementsApi,
  type CreateAnnouncementInput,
  type OrgAnnouncement,
  type UpdateAnnouncementInput,
} from "@/lib/api/announcements";
import { useToast } from "@/components/ui/use-toast";

const ACTIVE_KEY = ["announcements", "active"] as const;
const ADMIN_KEY = ["announcements", "admin"] as const;

export function useActiveAnnouncements(enabled = true) {
  return useQuery<OrgAnnouncement[]>({
    queryKey: ACTIVE_KEY,
    queryFn: () => announcementsApi.listActive(),
    enabled,
    staleTime: 60_000,
  });
}

export function useAdminAnnouncements(enabled = true) {
  return useQuery<OrgAnnouncement[]>({
    queryKey: ADMIN_KEY,
    queryFn: () => announcementsApi.listAll(),
    enabled,
    staleTime: 30_000,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ACTIVE_KEY });
  qc.invalidateQueries({ queryKey: ADMIN_KEY });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation<OrgAnnouncement, Error, CreateAnnouncementInput>({
    mutationFn: (input) => announcementsApi.create(input),
    onSuccess: () => {
      invalidateAll(qc);
      toast({ title: "Announcement posted" });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast({
        title: "Could not post announcement",
        description: err?.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    OrgAnnouncement,
    Error,
    { id: number; patch: UpdateAnnouncementInput }
  >({
    mutationFn: ({ id, patch }) => announcementsApi.update(id, patch),
    onSuccess: () => {
      invalidateAll(qc);
      toast({ title: "Announcement updated" });
    },
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation<void, Error, number>({
    mutationFn: (id) => announcementsApi.remove(id),
    onSuccess: () => {
      invalidateAll(qc);
      toast({ title: "Announcement deleted" });
    },
  });
}
