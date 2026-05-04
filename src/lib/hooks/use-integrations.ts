"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { integrationsApi } from "@/lib/api/integrations";

export function useIntegrations() {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: () => integrationsApi.listIntegrations(),
  });
}

export function useConnectMicrosoft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationsApi.connectMicrosoft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useSyncMicrosoft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationsApi.syncMicrosoft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useConnectOdoo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationsApi.connectOdoo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useSyncOdoo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationsApi.syncOdoo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useWebhooks() {
  return useQuery({
    queryKey: ["integration-webhooks"],
    queryFn: () => integrationsApi.listWebhooks(),
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationsApi.createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration-webhooks"] });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Parameters<typeof integrationsApi.updateWebhook>[1] }) =>
      integrationsApi.updateWebhook(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration-webhooks"] });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationsApi.deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration-webhooks"] });
    },
  });
}

export function useTestWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationsApi.testWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration-webhooks"] });
    },
  });
}
