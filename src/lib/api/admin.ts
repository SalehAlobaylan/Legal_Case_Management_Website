/*
 * File: src/lib/api/admin.ts
 * Purpose: API client for admin-only oversight endpoints (/api/admin/*).
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";

export interface AdminCaseCounts {
  total: number;
  open: number;
  inProgress: number;
  pendingHearing: number;
  closed: number;
  unassigned: number;
}

export interface AdminWorkloadRow {
  lawyerId: string;
  fullName: string;
  email: string;
  role: string;
  totalCases: number;
  openCases: number;
}

export interface AdminUnassignedCase {
  id: number;
  caseNumber: string;
  title: string;
  caseType: string;
  status: string;
  createdAt: string;
}

export interface AdminActivityRow {
  id: number;
  userId: string;
  userName: string | null;
  type: string;
  action: string;
  title: string;
  referenceId: number | null;
  createdAt: string;
}

export interface AdminHearingItem {
  id: number;
  caseNumber: string;
  title: string;
  status: string;
  caseType: string;
  nextHearing: string | null;
  daysUntil: number;
  assignedLawyerId: string | null;
  assignedLawyer: { id: string; fullName: string | null; email: string } | null;
}

export interface AdminHearingsBlock {
  overdue: AdminHearingItem[];
  thisWeek: AdminHearingItem[];
  nextWeek: AdminHearingItem[];
  later: AdminHearingItem[];
  counts: {
    overdue: number;
    thisWeek: number;
    nextWeek: number;
    later: number;
  };
}

export interface AdminStatsResponse {
  caseCounts: AdminCaseCounts;
  workload: AdminWorkloadRow[];
  unassignedCases: AdminUnassignedCase[];
  recentActivity: AdminActivityRow[];
  lawyerCount: number;
  hearings?: AdminHearingsBlock;
}

export interface AdminLawyerProfile {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
  phone: string | null;
  specialization: string | null;
  avatarUrl: string | null;
  location: string | null;
  isOnLeave: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface AdminLawyerCaseCounts {
  total: number;
  open: number;
  inProgress: number;
  pendingHearing: number;
  closed: number;
  upcomingHearings: number;
}

export interface AdminLawyerCase {
  id: number;
  caseNumber: string;
  title: string;
  status: string;
  caseType: string;
  nextHearing: string | null;
  updatedAt: string;
  assignedLawyerId: string | null;
}

export interface AdminLawyerDetailResponse {
  lawyer: AdminLawyerProfile;
  caseCounts: AdminLawyerCaseCounts;
  cases: AdminLawyerCase[];
  recentActivity: AdminActivityRow[];
}

// ── Org Pulse ────────────────────────────────────────────────────────────────

export interface PulseStaleCase {
  id: number;
  caseNumber: string;
  title: string;
  updatedAt: string;
  assignedLawyer: { id: string; fullName: string | null; email: string } | null;
}

export interface PulseAwaitingReviewCase {
  caseId: number;
  caseNumber: string;
  title: string;
  unreviewed: number;
}

export interface PulseRegulationUpdate {
  caseId: number;
  caseNumber: string;
  title: string;
  regulationId: number;
  regulationTitle: string;
  fetchedAt: string;
}

export interface AdminPulseResponse {
  stale: { count: number; items: PulseStaleCase[] };
  awaitingReview: { count: number; items: PulseAwaitingReviewCase[] };
  regulationUpdates: { count: number; items: PulseRegulationUpdate[] };
}

// ── Trends ───────────────────────────────────────────────────────────────────

export interface AdminTrendsResponse {
  casesOverTime: Array<{ week: string; created: number; closed: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  caseTypeBreakdown: Array<{ caseType: string; count: number }>;
}

// ── Audit log ────────────────────────────────────────────────────────────────

export interface AdminAuditEntry {
  id: number;
  action: string;
  targetType: string | null;
  targetId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
}

export interface AdminAuditLogResponse {
  entries: AdminAuditEntry[];
  nextBefore: number | null;
  actions: readonly string[];
}

export const adminApi = {
  async getStats(): Promise<AdminStatsResponse> {
    const { data } = await apiClient.get<AdminStatsResponse>(endpoints.admin.stats);
    return data;
  },
  async getLawyer(id: string): Promise<AdminLawyerDetailResponse> {
    const { data } = await apiClient.get<AdminLawyerDetailResponse>(
      endpoints.admin.lawyer(id)
    );
    return data;
  },
  async getPulse(): Promise<AdminPulseResponse> {
    const { data } = await apiClient.get<AdminPulseResponse>(endpoints.admin.pulse);
    return data;
  },
  async getTrends(): Promise<AdminTrendsResponse> {
    const { data } = await apiClient.get<AdminTrendsResponse>(endpoints.admin.trends);
    return data;
  },
  async getAuditLog(opts: { limit?: number; before?: number; action?: string } = {}): Promise<AdminAuditLogResponse> {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.before) params.set("before", String(opts.before));
    if (opts.action) params.set("action", opts.action);
    const url = params.toString()
      ? `${endpoints.admin.auditLog}?${params.toString()}`
      : endpoints.admin.auditLog;
    const { data } = await apiClient.get<AdminAuditLogResponse>(url);
    return data;
  },
};
