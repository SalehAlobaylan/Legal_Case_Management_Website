/*
 * File: src/lib/api/search.ts
 * Purpose: Unified search API — queries cases, clients, and regulations in one call.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";

export interface SearchResultCase {
  id: number;
  caseNumber: string;
  title: string;
  caseType: string;
  status: string;
}

export interface SearchResultClient {
  id: number;
  name: string;
  type: string;
  status: string;
}

export interface SearchResultRegulation {
  id: number;
  title: string;
  regulationNumber: string;
  category: string;
  status: string;
}

export interface UnifiedSearchResponse {
  cases: SearchResultCase[];
  clients: SearchResultClient[];
  regulations: SearchResultRegulation[];
}

export const searchApi = {
  /**
   * Search across cases, clients, and regulations.
   * @param q — search query (min 2 chars)
   * @param limit — max results per category (default 5)
   */
  async search(q: string, limit = 5): Promise<UnifiedSearchResponse> {
    const response = await apiClient.get<UnifiedSearchResponse>(
      `${endpoints.search.unified}?q=${encodeURIComponent(q)}&limit=${limit}`
    );
    return response.data;
  },
};
