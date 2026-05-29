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
  highWorkload?: boolean;
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

export interface AdminDashboardSettings {
  organizationId: number;
  staleCaseDays: number;
  hearingSoonDays: number;
  workloadHighOpenCases: number;
  aiReviewHighCount: number;
  monitorStaleMinutes: number;
  createdAt: string;
  updatedAt: string;
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

export interface AdminRiskItem {
  id: string;
  type: "overdue_hearing" | "unassigned_case" | "ai_review" | string;
  severity: "critical" | "warning" | "info" | string;
  title: string;
  subtitle: string;
  href: string;
}

export interface AdminAIHealthSummary {
  ready: boolean;
  warmingUp: boolean;
  fallbackActive: boolean;
  message: string | null;
}

export interface AdminMonitorRun {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  triggerSource: string;
  dryRun: boolean;
  scanned: number;
  changed: number;
  versionsCreated: number;
  failed: number;
  errorMessage: string | null;
}

export interface AdminMonitorHealth {
  hasRun: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
  minutesSinceLastRun: number | null;
  failedRuns24h: number;
  successfulRuns24h: number;
}

export interface AdminMonitorSummary {
  health: AdminMonitorHealth;
  runs: AdminMonitorRun[];
  failedRuns24h: number;
  stale: boolean;
}

export interface AdminCommandCenterResponse {
  settings: AdminDashboardSettings;
  caseCounts: AdminCaseCounts;
  workload: AdminWorkloadRow[];
  unassignedCases: AdminUnassignedCase[];
  recentActivity: AdminActivityRow[];
  lawyerCount: number;
  hearings: AdminHearingsBlock;
  risk: AdminPulseResponse & { topActions: AdminRiskItem[] };
  aiHealth: AdminAIHealthSummary;
  monitor: AdminMonitorSummary;
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

// ── AI Intelligence ───────────────────────────────────────────────────────────

export interface AdminAISignal {
  signal: string;
  label: string;
  severity: string;
  contribution: number;
  detail?: string | null;
}

export interface AdminAIRecommendedAction {
  action: string;
  label: string;
  target?: string | null;
}

export interface AdminAICaseProfile {
  caseId: number;
  caseNumber: string;
  title: string;
  caseType: string;
  status: string;
  score: number;
  urgency: string;
  confidence: string;
  signals: string[];
  evidence: AdminAISignal[];
  recommendedActions: AdminAIRecommendedAction[];
  rationale: string | null;
  method: string | null;
  generatedAt: string;
  assignedLawyer: { id: string; fullName: string | null; email: string } | null;
}

export interface AdminAIReviewQueueItem {
  caseId: number;
  caseNumber: string;
  title: string;
  unverifiedLinks: number;
  score: number;
  urgency: string;
}

export interface AdminAICaseRef {
  caseId: number;
  caseNumber: string;
  title: string;
  detail: string | null;
}

export interface AdminAIQualitySummary {
  hasRun: boolean;
  latest: Record<string, unknown> | null;
  previous: Record<string, unknown> | null;
  trend: {
    recallAt5: number | null;
    precisionAt5: number | null;
    ndcgAt5: number | null;
  } | null;
  generatedAt: string | null;
}

export interface AdminAIIntelligenceSummary {
  generatedAt: string | null;
  needsRefresh: boolean;
  aiHealth: AdminAIHealthSummary;
  summary: { headline: string; bullets: string[] };
  aggregateRisk: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
    averageScore: number;
  };
  workload: {
    overloadedLawyers: number;
    unassignedCases: number;
    documentRiskCases: number;
    regulationImpactCases: number;
  };
  riskCases: AdminAICaseProfile[];
  reviewQueue: AdminAIReviewQueueItem[];
  documentIntelligence: AdminAICaseRef[];
  regulationImpact: AdminAICaseRef[];
  quality: AdminAIQualitySummary | null;
  method: string | null;
  confidence: string;
  warnings: string[];
}

export const adminApi = {
  async getCommandCenter(): Promise<AdminCommandCenterResponse> {
    const { data } = await apiClient.get<AdminCommandCenterResponse>(
      endpoints.admin.commandCenter
    );
    return data;
  },
  async getDashboardSettings(): Promise<AdminDashboardSettings> {
    const { data } = await apiClient.get<{ settings: AdminDashboardSettings }>(
      endpoints.admin.dashboardSettings
    );
    return data.settings;
  },
  async updateDashboardSettings(
    input: Pick<
      AdminDashboardSettings,
      | "staleCaseDays"
      | "hearingSoonDays"
      | "workloadHighOpenCases"
      | "aiReviewHighCount"
      | "monitorStaleMinutes"
    >
  ): Promise<AdminDashboardSettings> {
    const { data } = await apiClient.put<{ settings: AdminDashboardSettings }>(
      endpoints.admin.dashboardSettings,
      input
    );
    return data.settings;
  },
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
  async getAIIntelligence(): Promise<AdminAIIntelligenceSummary> {
    const { data } = await apiClient.get<AdminAIIntelligenceSummary>(
      endpoints.admin.aiIntelligence.summary
    );
    return data;
  },
  async refreshAIIntelligence(): Promise<AdminAIIntelligenceSummary> {
    const { data } = await apiClient.post<AdminAIIntelligenceSummary>(
      endpoints.admin.aiIntelligence.refresh
    );
    return data;
  },
  async refreshAICaseProfile(caseId: number): Promise<{ profile: unknown }> {
    const { data } = await apiClient.post<{ profile: unknown }>(
      endpoints.admin.aiIntelligence.caseRefresh(caseId)
    );
    return data;
  },
  async runAIEvaluation(
    input: { topK?: number; caseIds?: number[] } = {}
  ): Promise<{ run: unknown }> {
    const { data } = await apiClient.post<{ run: unknown }>(
      endpoints.admin.aiIntelligence.evaluationRun,
      input
    );
    return data;
  },
};
