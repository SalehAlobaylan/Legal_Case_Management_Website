/*
 * File: src/lib/hooks/use-clients.ts
 * Purpose: TanStack Query hooks for clients data.
 * Used by: Clients page and components.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi, type ClientFilters } from "@/lib/api/clients";
import type { CreateClientInput } from "@/lib/types/client";

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
