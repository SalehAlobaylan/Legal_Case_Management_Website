/*
 * File: src/lib/api/billing.ts
 * Purpose: API functions for billing and usage information
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";

// Types
export interface BillingInfo {
    plan: {
        name: string;
        tier: "free" | "starter" | "professional" | "enterprise";
        price: number;
        currency: string;
        billingCycle: "monthly" | "yearly";
    };
    usage: {
        cases: { used: number; limit: number };
        documents: { used: number; limit: number };
        aiQueries: { used: number; limit: number };
        storage: { usedMB: number; limitMB: number };
        teamMembers: { used: number; limit: number };
    };
    nextBillingDate?: string;
    paymentMethod?: {
        type: string;
        last4?: string;
        expiryMonth?: number;
        expiryYear?: number;
    };
    invoices?: {
        id: number;
        date: string;
        amount: number;
        status: "paid" | "pending" | "overdue";
        downloadUrl?: string;
    }[];
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
};
