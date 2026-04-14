/*
 * File: src/lib/api/clients.ts
 * Purpose: API methods for client CRUD operations.
 * Used by: TanStack Query hooks for clients.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type {
  Client,
  CreateClientInput,
  ClientActivity,
  CreateClientActivityInput,
  ClientDocument,
  ClientMessage,
} from "@/lib/types/client";
import type { Case } from "@/lib/types/case";

export interface ClientFilters {
  type?: "individual" | "corporate" | "sme" | "group";
  search?: string;
  leadStatus?: string;
  tag?: string;
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
    if (filters?.leadStatus) params.append("leadStatus", filters.leadStatus);
    if (filters?.tag) params.append("tag", filters.tag);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const url = params.toString() ? `${endpoints.clients.list}?${params}` : endpoints.clients.list;
    const { data } = await apiClient.get<ClientsResponse>(url);
    return {
      ...data,
      clients: data.clients.map(normalizeClient),
    };
  },

  /**
   * Get a single client by ID
   */
  async getClientById(id: number): Promise<Client> {
    const { data } = await apiClient.get<{ client: Client }>(endpoints.clients.detail(id));
    return normalizeClient(data.client);
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
    const payload = {
      ...input,
      type: input.type === "company" ? "corporate" : input.type,
      email: input.email ?? input.contactEmail,
      phone: input.phone ?? input.contactPhone,
    };
    const { data } = await apiClient.post<{ client: Client }>(endpoints.clients.create, payload);
    return normalizeClient(data.client);
  },

  /**
   * Update an existing client
   */
  async updateClient(id: number, input: Partial<CreateClientInput>): Promise<Client> {
    const payload = {
      ...input,
      type: input.type === "company" ? "corporate" : input.type,
      email: input.email ?? input.contactEmail,
      phone: input.phone ?? input.contactPhone,
    };
    const { data } = await apiClient.put<{ client: Client }>(endpoints.clients.update(id), payload);
    return normalizeClient(data.client);
  },

  /**
   * Delete a client
   */
  async deleteClient(id: number): Promise<void> {
    await apiClient.delete(endpoints.clients.delete(id));
  },

  /**
   * Export clients to CSV
   */
  async exportClients(format: "csv" = "csv"): Promise<Blob> {
    const response = await apiClient.get<Blob>(endpoints.clients.export, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Send message to client
   */
  async sendMessageToClient(
    id: number,
    message: string,
    type?: "case_update" | "hearing_reminder" | "document_request" | "invoice_notice" | "general",
    channel?: "in_app" | "email" | "sms" | "whatsapp",
    subject?: string
  ): Promise<{ success: boolean; message: string; messageRecord?: ClientMessage }> {
    const { data } = await apiClient.post(
      endpoints.clients.message(id),
      { message, type: type || "general", channel: channel || "in_app", subject }
    );
    return data;
  },

  async getClientMessages(id: number): Promise<ClientMessage[]> {
    const { data } = await apiClient.get<{ messages: ClientMessage[] }>(endpoints.clients.messages(id));
    return data.messages;
  },

  async markMessageRead(clientId: number, messageId: number): Promise<ClientMessage> {
    const { data } = await apiClient.post<{ message: ClientMessage }>(
      endpoints.clients.markMessageRead(clientId, messageId)
    );
    return data.message;
  },

  async retryMessage(clientId: number, messageId: number): Promise<ClientMessage> {
    const { data } = await apiClient.post<{ message: ClientMessage }>(
      endpoints.clients.retryMessage(clientId, messageId)
    );
    return data.message;
  },

  /**
   * Get activities for a specific client
   */
  async getClientActivities(id: number): Promise<ClientActivity[]> {
    const { data } = await apiClient.get<{ activities: ClientActivity[] }>(endpoints.clients.activities(id));
    return data.activities;
  },

  /**
   * Create an activity for a client
   */
  async createClientActivity(id: number, input: CreateClientActivityInput): Promise<ClientActivity> {
    const { data } = await apiClient.post<{ activity: ClientActivity }>(endpoints.clients.activities(id), input);
    return data.activity;
  },

  /**
   * Get documents for a specific client
   */
  async getClientDocuments(id: number): Promise<ClientDocument[]> {
    const { data } = await apiClient.get<{ documents: ClientDocument[] }>(endpoints.clients.documents(id));
    return data.documents.map((d) => ({
      ...d,
      downloadUrl: endpoints.clients.downloadDocument(id, d.id),
    }));
  },

  async uploadClientDocument(id: number, file: File): Promise<ClientDocument> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<{ document: ClientDocument }>(
      endpoints.clients.documents(id),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      ...data.document,
      downloadUrl: endpoints.clients.downloadDocument(id, data.document.id),
    };
  },

  async deleteClientDocument(id: number, docId: number): Promise<void> {
    await apiClient.delete(endpoints.clients.deleteDocument(id, docId));
  },

  async createInvoice(input: {
    clientId: number;
    amount: number;
    dueDate: string;
    currency?: string;
    description?: string;
  }): Promise<{ id: number }> {
    const { data } = await apiClient.post<{ invoice: { id: number } }>(
      endpoints.billing.createInvoice,
      input
    );
    return data.invoice;
  },
};

function normalizeClient(client: Client): Client {
  const normalizedType =
    client.type === "company" ? "corporate" : client.type;

  return {
    ...client,
    type: normalizedType,
    email: client.email ?? client.contactEmail,
    phone: client.phone ?? client.contactPhone,
    contactEmail: client.contactEmail ?? client.email,
    contactPhone: client.contactPhone ?? client.phone,
  };
}
