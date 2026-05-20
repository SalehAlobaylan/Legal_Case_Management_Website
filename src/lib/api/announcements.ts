/*
 * File: src/lib/api/announcements.ts
 * Purpose: Typed client for /api/announcements/* — org-wide banner messages.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";

export type AnnouncementSeverity = "info" | "warning" | "important";

export interface OrgAnnouncement {
  id: number;
  organizationId: number;
  createdByUserId: string | null;
  title: string;
  body: string;
  severity: AnnouncementSeverity;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  severity?: AnnouncementSeverity;
  expiresAt?: string | null;
}

export interface UpdateAnnouncementInput {
  title?: string;
  body?: string;
  severity?: AnnouncementSeverity;
  expiresAt?: string | null;
  isActive?: boolean;
}

export const announcementsApi = {
  async listActive(): Promise<OrgAnnouncement[]> {
    const { data } = await apiClient.get<{ announcements: OrgAnnouncement[] }>(
      endpoints.announcements.active
    );
    return data.announcements;
  },
  async listAll(): Promise<OrgAnnouncement[]> {
    const { data } = await apiClient.get<{ announcements: OrgAnnouncement[] }>(
      endpoints.announcements.listAll
    );
    return data.announcements;
  },
  async create(input: CreateAnnouncementInput): Promise<OrgAnnouncement> {
    const { data } = await apiClient.post<{ announcement: OrgAnnouncement }>(
      endpoints.announcements.create,
      input
    );
    return data.announcement;
  },
  async update(id: number, input: UpdateAnnouncementInput): Promise<OrgAnnouncement> {
    const { data } = await apiClient.patch<{ announcement: OrgAnnouncement }>(
      endpoints.announcements.update(id),
      input
    );
    return data.announcement;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(endpoints.announcements.remove(id));
  },
};
