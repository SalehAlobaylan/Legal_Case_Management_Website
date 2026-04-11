/*
 * File: src/lib/types/client.ts
 * Purpose: TypeScript types for legal clients.
 * Used by: API hooks and UI components for client management.
 */

export type ClientType = "individual" | "company";
export type ClientLeadStatus = "lead" | "contacted" | "consultation" | "retained";

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
  leadStatus?: ClientLeadStatus;
  tags?: string[];
  status?: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface ClientActivity {
  id: number;
  clientId: number;
  type: "call" | "email" | "meeting" | "system" | "note";
  description: string;
  metadata?: Record<string, any>;
  userId?: string;
  user?: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
}

export interface ClientDocument {
  id: number;
  clientId: number;
  name: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  uploadedById?: string;
  uploadedBy?: {
    id: string;
    fullName: string | null;
  };
  createdAt: string;
}

export interface CreateClientInput {
  name: string;
  type: ClientType;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  notes?: string;
  leadStatus?: ClientLeadStatus;
  tags?: string[];
}

export interface CreateClientActivityInput {
  type: "call" | "email" | "meeting" | "system" | "note";
  description: string;
  metadata?: Record<string, any>;
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
