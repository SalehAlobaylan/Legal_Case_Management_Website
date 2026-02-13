/*
 * File: src/lib/api/billing.ts
 * Purpose: API functions for billing and invoice management
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";

// Types
export interface BillingPlan {
  id: number;
  name: string;
  tier: "free" | "pro" | "enterprise";
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: {
    casesLimit: number | null;
    storageGB: number | null;
    aiQueriesLimit: number | null;
    teamMembersLimit: number | null;
  };
  isActive: boolean;
}

export interface Subscription {
  id: number;
  organizationId: number;
  planId: number;
  status: "active" | "cancelled" | "expired" | "past_due";
  billingCycle: "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  cancelAtPeriodEnd: boolean;
  plan?: BillingPlan;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  organizationId: number;
  subscriptionId?: number;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  pdfPath?: string;
  subscription?: Subscription;
}

export interface BillingInfo {
  plan: BillingPlan;
  subscription?: Subscription;
  usage: {
    cases: { used: number; limit: number };
    documents: { used: number; limit: number };
    aiQueries: { used: number; limit: number };
    storage: { usedMB: number; limitMB: number };
    teamMembers: { used: number; limit: number };
  };
  invoices?: Invoice[];
}

// API Functions
export const billingApi = {
  /**
   * Get billing and usage information
   */
  getBillingInfo: async (): Promise<BillingInfo> => {
    const response = await apiClient.get<BillingInfo>(endpoints.settings.billing);
    return response.data;
  },

  /**
   * Get invoice history
   */
  getInvoices: async (filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ invoices: Invoice[] }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));

    const url = params.toString()
      ? `${endpoints.billing.invoices}?${params}`
      : endpoints.billing.invoices;

    const response = await apiClient.get<{ invoices: Invoice[] }>(url);
    return response.data;
  },

  /**
   * Subscribe to a plan
   */
  subscribe: async (
    planId: number,
    billingCycle: "monthly" | "yearly"
  ): Promise<{ subscription: Subscription }> => {
    const response = await apiClient.post<{ subscription: Subscription }>(
      endpoints.billing.subscribe,
      { planId, billingCycle }
    );
    return response.data;
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (): Promise<{
    subscription: Subscription;
    message: string;
  }> => {
    const response = await apiClient.delete(endpoints.billing.subscription);
    return response.data;
  },

  /**
   * Download invoice PDF
   */
  downloadInvoicePDF: async (invoiceId: number): Promise<Blob> => {
    const response = await apiClient.get<Blob>(
      endpoints.billing.invoicePdf(invoiceId),
      { responseType: "blob" }
    );
    return response.data;
  },
};
