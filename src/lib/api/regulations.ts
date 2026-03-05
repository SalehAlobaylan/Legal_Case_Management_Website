/*
 * File: src/lib/api/regulations.ts
 * Purpose: API methods for regulations operations.
 * Used by: TanStack Query hooks for regulations.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type {
  RegulationAmendmentImpact,
  MojSourceSyncHealth,
  Regulation,
  RegulationComparison,
  RegulationInsights,
  RegulationVersion,
} from "@/lib/types/regulation";

export interface RegulationFilters {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RegulationsResponse {
  regulations: Regulation[];
  total: number;
  page: number;
  limit: number;
}

export interface SubscribeInput {
  regulationId: number;
  sourceUrl?: string;
  checkIntervalHours?: number;
}

export const regulationsApi = {
  /**
   * Get list of regulations with optional filters
   */
  async getRegulations(filters?: RegulationFilters): Promise<RegulationsResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const url = params.toString() ? `${endpoints.regulations.list}?${params}` : endpoints.regulations.list;
    const { data } = await apiClient.get<RegulationsResponse>(url);
    return data;
  },

  /**
   * Get a single regulation by ID
   */
  async getRegulationById(id: number): Promise<Regulation> {
    const { data } = await apiClient.get<{ regulation: Regulation }>(endpoints.regulations.detail(id));
    return data.regulation;
  },

  /**
   * Get version history for a regulation
   */
  async getRegulationVersions(id: number): Promise<RegulationVersion[]> {
    const { data } = await apiClient.get<{ versions: RegulationVersion[] }>(endpoints.regulations.versions(id));
    return data.versions;
  },

  /**
   * Compare two regulation versions
   */
  async compareRegulationVersions(
    id: number,
    fromVersion: number,
    toVersion: number
  ): Promise<RegulationComparison> {
    const params = new URLSearchParams({
      fromVersion: String(fromVersion),
      toVersion: String(toVersion),
    });
    const { data } = await apiClient.get<{ comparison: RegulationComparison }>(
      `${endpoints.regulations.compare(id)}?${params.toString()}`
    );
    return data.comparison;
  },

  /**
   * Get latest regulation AI insights
   */
  async getRegulationInsights(id: number): Promise<RegulationInsights> {
    const { data } = await apiClient.get<RegulationInsights>(endpoints.regulations.insights(id));
    return data;
  },

  /**
   * Queue regulation AI insights generation
   */
  async refreshRegulationInsights(
    id: number,
    input?: { force?: boolean }
  ): Promise<RegulationInsights> {
    const { data } = await apiClient.post<RegulationInsights>(
      endpoints.regulations.refreshInsights(id),
      input || {}
    );
    return data;
  },

  /**
   * Get amendment impact analysis for selected versions
   */
  async getRegulationAmendmentImpact(
    id: number,
    fromVersion: number,
    toVersion: number
  ): Promise<RegulationAmendmentImpact> {
    const params = new URLSearchParams({
      fromVersion: String(fromVersion),
      toVersion: String(toVersion),
    });
    const { data } = await apiClient.get<RegulationAmendmentImpact>(
      `${endpoints.regulations.amendmentImpact(id)}?${params.toString()}`
    );
    return data;
  },

  /**
   * Queue amendment impact analysis generation
   */
  async refreshRegulationAmendmentImpact(
    id: number,
    input: { fromVersion: number; toVersion: number; force?: boolean }
  ): Promise<RegulationAmendmentImpact> {
    const { data } = await apiClient.post<RegulationAmendmentImpact>(
      endpoints.regulations.refreshAmendmentImpact(id),
      input
    );
    return data;
  },

  /**
   * Search regulations (full-text + semantic)
   */
  async searchRegulations(query: string, topK = 10): Promise<Regulation[]> {
    const { data } = await apiClient.post<{ regulations: Regulation[] }>(endpoints.regulations.search, {
      query,
      topK,
    });
    return data.regulations;
  },

  /**
   * Subscribe to regulation updates
   */
  async subscribeToRegulation(input: SubscribeInput): Promise<void> {
    await apiClient.post(endpoints.regulations.subscribe, input);
  },

  /**
   * Trigger MOJ source sync (admin)
   */
  async syncMojSource(input?: {
    maxPages?: number;
    extractContent?: boolean;
    runInBackground?: boolean;
  }): Promise<void> {
    await apiClient.post(endpoints.regulations.sourceSync, input || {}, {
      timeout: input?.runInBackground ? 30000 : 600000,
    });
  },

  /**
   * Get MOJ source sync health (admin)
   */
  async getMojSourceHealth(): Promise<MojSourceSyncHealth> {
    const { data } = await apiClient.get<{ health: MojSourceSyncHealth }>(
      endpoints.regulations.sourceHealth
    );
    return data.health;
  },
};
