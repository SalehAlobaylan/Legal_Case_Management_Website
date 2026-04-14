/*
 * File: src/lib/types/client.ts
 * Purpose: TypeScript types for legal clients.
 * Used by: API hooks and UI components for client management.
 */

export type ClientType = "individual" | "corporate" | "sme" | "group" | "company";
export type ClientLeadStatus = "lead" | "contacted" | "consultation" | "retained";

export interface Client {
  id: number;
  organizationId: number;
  name: string;
  type: ClientType;
  contactEmail?: string;
  contactPhone?: string;
  email?: string;
  phone?: string;
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

export interface ClientMessage {
  id: number;
  organizationId: number;
  clientId: number;
  senderUserId?: string | null;
  sender?: {
    id: string;
    fullName: string | null;
    email: string;
  };
  type: "case_update" | "hearing_reminder" | "document_request" | "invoice_notice" | "general";
  channel: "in_app" | "email" | "sms" | "whatsapp";
  subject?: string | null;
  body: string;
  status: "queued" | "sent" | "failed";
  direction: "outbound" | "inbound";
  errorMessage?: string | null;
  retryCount?: number;
  maxRetries?: number;
  nextRetryAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  isRead?: boolean;
  metadata?: Record<string, unknown>;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDocument {
  id: number;
  clientId: number;
  name: string;
  fileUrl: string;
  downloadUrl?: string;
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
  email?: string;
  phone?: string;
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
  corporate: {
    label: { ar: "شركة", en: "Corporate" },
    icon: "Building",
  },
  sme: {
    label: { ar: "منشأة صغيرة", en: "SME" },
    icon: "Building",
  },
  group: {
    label: { ar: "مجموعة", en: "Group" },
    icon: "Building",
  },
} as const;
