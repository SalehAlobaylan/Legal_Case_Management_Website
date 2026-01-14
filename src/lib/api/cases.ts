/*
 * File: src/lib/api/cases.ts
 * Purpose: API methods for case CRUD operations.
 * Used by: TanStack Query hooks for cases.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Case, CreateCaseInput } from "@/lib/types/case";

export interface CaseFilters {
  status?: string;
  caseType?: string;
  search?: string;
  assignedLawyerId?: number;
  page?: number;
  limit?: number;
}

export interface CasesResponse {
  cases: Case[];
  total: number;
  page: number;
  limit: number;
}

export const casesApi = {
  /**
   * Get list of cases with optional filters
   */
  async getCases(filters?: CaseFilters): Promise<CasesResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.caseType) params.append("caseType", filters.caseType);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.assignedLawyerId) params.append("assignedLawyerId", String(filters.assignedLawyerId));
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const url = params.toString() ? `${endpoints.cases.list}?${params}` : endpoints.cases.list;
    const { data } = await apiClient.get<CasesResponse>(url);
    return data;
  },

  /**
   * Get a single case by ID
   */
  async getCaseById(id: number): Promise<Case> {
    const { data } = await apiClient.get<{ case: Case }>(endpoints.cases.detail(id));
    return data.case;
  },

  /**
   * Create a new case
   */
  async createCase(input: CreateCaseInput): Promise<Case> {
    const { data } = await apiClient.post<{ case: Case }>(endpoints.cases.create, input);
    return data.case;
  },

  /**
   * Update an existing case
   */
  async updateCase(id: number, input: Partial<CreateCaseInput>): Promise<Case> {
    const { data } = await apiClient.put<{ case: Case }>(endpoints.cases.update(id), input);
    return data.case;
  },

  /**
   * Delete a case (soft delete)
   */
  async deleteCase(id: number): Promise<void> {
    await apiClient.delete(endpoints.cases.delete(id));
  },
};
