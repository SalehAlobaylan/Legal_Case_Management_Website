/*
 * File: src/lib/hooks/use-clients.ts
 * Purpose: TanStack Query hooks for clients data.
 * Used by: Clients page and components.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi, type ClientFilters } from "@/lib/api/clients";
import type { CreateClientInput, CreateClientActivityInput } from "@/lib/types/client";

/**
 * Hook for fetching clients list
 */
export function useClients(filters?: ClientFilters) {
  return useQuery({
    queryKey: ["clients", filters],
    queryFn: () => clientsApi.getClients(filters),
  });
}

/**
 * Hook for fetching a single client
 */
export function useClient(id: number) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => clientsApi.getClientById(id),
    enabled: !!id,
  });
}

/**
 * Hook for fetching cases for a client
 */
export function useClientCases(clientId: number) {
  return useQuery({
    queryKey: ["client-cases", clientId],
    queryFn: () => clientsApi.getClientCases(clientId),
    enabled: !!clientId,
  });
}

/**
 * Hook for creating a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClientInput) => clientsApi.createClient(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

/**
 * Hook for updating a client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreateClientInput> }) =>
      clientsApi.updateClient(id, input),
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.setQueryData(["client", updatedClient.id], updatedClient);
    },
  });
}

/**
 * Hook for deleting a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientsApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

/**
 * Hook for exporting clients
 */
export function useExportClients() {
  return useMutation({
    mutationFn: (format: "csv" = "csv") => clientsApi.exportClients(format),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clients-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

/**
 * Hook for sending messages to clients
 */
export function useSendMessageToClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message, type, channel, subject }: {
      id: number;
      message: string;
      type?: "case_update" | "hearing_reminder" | "document_request" | "invoice_notice" | "general";
      channel?: "in_app" | "email" | "sms" | "whatsapp";
      subject?: string;
    }) => clientsApi.sendMessageToClient(id, message, type, channel, subject),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client-messages", variables.id] });
    },
  });
}

export function useClientMessages(clientId: number) {
  return useQuery({
    queryKey: ["client-messages", clientId],
    queryFn: () => clientsApi.getClientMessages(clientId),
    enabled: !!clientId,
  });
}

export function useMarkClientMessageRead(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: number) => clientsApi.markMessageRead(clientId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-messages", clientId] });
    },
  });
}

export function useRetryClientMessage(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: number) => clientsApi.retryMessage(clientId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-messages", clientId] });
    },
  });
}

/**
 * Hook for fetching activities for a client
 */
export function useClientActivities(clientId: number) {
  return useQuery({
    queryKey: ["client-activities", clientId],
    queryFn: () => clientsApi.getClientActivities(clientId),
    enabled: !!clientId,
  });
}

/**
 * Hook for creating a new client activity
 */
export function useCreateClientActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CreateClientActivityInput }) =>
      clientsApi.createClientActivity(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["client-activities", variables.id] });
    },
  });
}

/**
 * Hook for fetching documents for a client
 */
export function useClientDocuments(clientId: number) {
  return useQuery({
    queryKey: ["client-documents", clientId],
    queryFn: () => clientsApi.getClientDocuments(clientId),
    enabled: !!clientId,
  });
}

export function useUploadClientDocument(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => clientsApi.uploadClientDocument(clientId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-documents", clientId] });
    },
  });
}

export function useDeleteClientDocument(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docId: number) => clientsApi.deleteClientDocument(clientId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-documents", clientId] });
    },
  });
}

export function useCreateClientInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientsApi.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
