/*
 * File: src/lib/hooks/use-billing.ts
 * Purpose: React hooks for billing information using TanStack Query
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi, BillingInfo, Invoice } from "@/lib/api/billing";

/**
 * Hook to fetch billing and usage information
 */
export function useBillingInfo() {
    return useQuery<BillingInfo>({
        queryKey: ["billing"],
        queryFn: () => billingApi.getBillingInfo(),
        staleTime: 1000 * 60 * 10, // 10 minutes (billing data doesn't change often)
    });
}

/**
 * Helper hook to get usage percentages
 */
export function useUsagePercentages() {
    const { data: billing, ...rest } = useBillingInfo();

    const calculatePercentage = (used: number, limit: number) => {
        if (limit === 0) return 0;
        return Math.round((used / limit) * 100);
    };

    const percentages = billing
        ? {
            cases: calculatePercentage(
                billing.usage.cases.used,
                billing.usage.cases.limit
            ),
            documents: calculatePercentage(
                billing.usage.documents.used,
                billing.usage.documents.limit
            ),
            aiQueries: calculatePercentage(
                billing.usage.aiQueries.used,
                billing.usage.aiQueries.limit
            ),
            storage: calculatePercentage(
                billing.usage.storage.usedMB,
                billing.usage.storage.limitMB
            ),
            teamMembers: calculatePercentage(
                billing.usage.teamMembers.used,
                billing.usage.teamMembers.limit
            ),
        }
        : null;

    return { percentages, billing, ...rest };
}

/**
 * Hook to fetch invoices
 */
export function useInvoices(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => billingApi.getInvoices(filters),
  });
}

/**
 * Hook to subscribe to a plan
 */
export function useSubscribeToPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, billingCycle }: {
      planId: number;
      billingCycle: "monthly" | "yearly";
    }) => billingApi.subscribe(planId, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => billingApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

/**
 * Hook to download invoice PDF
 */
export function useDownloadInvoicePDF() {
  return useMutation({
    mutationFn: (invoiceId: number) => billingApi.downloadInvoicePDF(invoiceId),
    onSuccess: (blob, invoiceId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
