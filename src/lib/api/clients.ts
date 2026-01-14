/*
 * File: src/lib/api/clients.ts
 * Purpose: API methods for client CRUD operations.
 * Used by: TanStack Query hooks for clients.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Client, CreateClientInput } from "@/lib/types/client";
import type { Case } from "@/lib/types/case";

export interface ClientFilters {
  type?: "individual" | "company";
  search?: string;
  page?: number;
  limit?: number;
}

export interface ClientsResponse {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
}

export const clientsApi = {
  /**
   * Get list of clients with optional filters
   */
  async getClients(filters?: ClientFilters): Promise<ClientsResponse> {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const url = params.toString() ? `${endpoints.clients.list}?${params}` : endpoints.clients.list;
    const { data } = await apiClient.get<ClientsResponse>(url);
    return data;
  },

  /**
   * Get a single client by ID
   */
  async getClientById(id: number): Promise<Client> {
    const { data } = await apiClient.get<{ client: Client }>(endpoints.clients.detail(id));
    return data.client;
  },

  /**
   * Get cases for a specific client
   */
  async getClientCases(id: number): Promise<Case[]> {
    const { data } = await apiClient.get<{ cases: Case[] }>(endpoints.clients.cases(id));
    return data.cases;
  },

  /**
   * Create a new client
   */
  async createClient(input: CreateClientInput): Promise<Client> {
    const { data } = await apiClient.post<{ client: Client }>(endpoints.clients.create, input);
    return data.client;
  },

  /**
   * Update an existing client
   */
  async updateClient(id: number, input: Partial<CreateClientInput>): Promise<Client> {
    const { data } = await apiClient.put<{ client: Client }>(endpoints.clients.update(id), input);
    return data.client;
  },

  /**
   * Delete a client
   */
  async deleteClient(id: number): Promise<void> {
    await apiClient.delete(endpoints.clients.delete(id));
  },
};
