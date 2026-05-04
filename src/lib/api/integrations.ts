import { apiClient } from "./client";
import { endpoints } from "./endpoints";

export type IntegrationStatus =
  | "not_connected"
  | "in_setup"
  | "connected"
  | "error"
  | "coming_soon";

export type Integration = {
  id: number;
  organizationId: number;
  provider: string;
  status: IntegrationStatus;
  setupState?: string | null;
  displayName?: string | null;
  config?: Record<string, unknown> | null;
  connectedBy?: string | null;
  connectedAt?: string | null;
  lastSyncAt?: string | null;
  errorMessage?: string | null;
};

export type WebhookEndpoint = {
  id: number;
  organizationId: number;
  name: string;
  url: string;
  secret?: string | null;
  events?: string[] | null;
  active: boolean;
  lastDeliveredAt?: string | null;
  lastStatusCode?: number | null;
  lastError?: string | null;
};

export const integrationsApi = {
  async listIntegrations(): Promise<Integration[]> {
    const { data } = await apiClient.get<{ integrations: Integration[] }>(
      endpoints.integrations.list
    );
    return data.integrations;
  },

  async connectMicrosoft(input: {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    redirectUri: string;
  }) {
    const { data } = await apiClient.post<{ redirectUrl: string; integration: Integration }>(
      endpoints.integrations.connectMicrosoft,
      input
    );
    return data;
  },

  async syncMicrosoft() {
    const { data } = await apiClient.post<{ events: Array<Record<string, unknown>> }>(
      endpoints.integrations.syncMicrosoft
    );
    return data.events;
  },

  async connectOdoo(input: {
    baseUrl: string;
    database: string;
    username: string;
    apiKey: string;
  }) {
    const { data } = await apiClient.post<{ integration: Integration }>(
      endpoints.integrations.connectOdoo,
      input
    );
    return data.integration;
  },

  async syncOdoo() {
    const { data } = await apiClient.post<{ partners: Array<Record<string, unknown>> }>(
      endpoints.integrations.syncOdoo
    );
    return data.partners;
  },

  async listWebhooks(): Promise<WebhookEndpoint[]> {
    const { data } = await apiClient.get<{ webhooks: WebhookEndpoint[] }>(
      endpoints.integrations.webhooks
    );
    return data.webhooks;
  },

  async createWebhook(input: {
    name: string;
    url: string;
    secret?: string;
    events?: string[];
    active?: boolean;
  }): Promise<WebhookEndpoint> {
    const { data } = await apiClient.post<{ webhook: WebhookEndpoint }>(
      endpoints.integrations.webhooks,
      input
    );
    return data.webhook;
  },

  async updateWebhook(id: number, input: Partial<{
    name: string;
    url: string;
    secret: string;
    events: string[];
    active: boolean;
  }>): Promise<WebhookEndpoint> {
    const { data } = await apiClient.put<{ webhook: WebhookEndpoint }>(
      endpoints.integrations.webhookById(id),
      input
    );
    return data.webhook;
  },

  async deleteWebhook(id: number): Promise<WebhookEndpoint> {
    const { data } = await apiClient.delete<{ webhook: WebhookEndpoint }>(
      endpoints.integrations.webhookById(id)
    );
    return data.webhook;
  },

  async testWebhook(id: number): Promise<boolean> {
    const { data } = await apiClient.post<{ success: boolean }>(
      endpoints.integrations.testWebhook(id)
    );
    return data.success;
  },
};
