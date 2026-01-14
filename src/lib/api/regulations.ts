/*
 * File: src/lib/api/regulations.ts
 * Purpose: API methods for regulations operations.
 * Used by: TanStack Query hooks for regulations.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Regulation, RegulationVersion } from "@/lib/types/regulation";

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
};
