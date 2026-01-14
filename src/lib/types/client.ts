/*
 * File: src/lib/types/client.ts
 * Purpose: TypeScript types for legal clients.
 * Used by: API hooks and UI components for client management.
 */

export type ClientType = "individual" | "company";

export interface Client {
  id: number;
  organizationId: number;
  name: string;
  type: ClientType;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  notes?: string;
  casesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  name: string;
  type: ClientType;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  notes?: string;
}

// UI-specific types
export const CLIENT_TYPE_CONFIG = {
  individual: {
    label: { ar: "فرد", en: "Individual" },
    icon: "User",
  },
  company: {
    label: { ar: "شركة", en: "Company" },
    icon: "Building",
  },
} as const;
