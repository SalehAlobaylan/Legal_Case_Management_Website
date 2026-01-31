/*
 * File: src/lib/types/auth.ts
 * Purpose: TypeScript types for authentication.
 * Used by: Auth hooks and store.
 */

export type UserRole = "admin" | "senior_lawyer" | "lawyer" | "paralegal" | "clerk";

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: number;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Organization {
  id: number;
  name: string;
  country: string;
  subscriptionTier: string;
  licenseNumber?: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export type RegisterInputJoin = {
  registrationType: "join";
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  organizationId: number;
  role?: UserRole;
};

export type RegisterInputCreate = {
  registrationType: "create";
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  organizationName: string;
  subscriptionTier?: string;
  role?: UserRole;
};

export type RegisterInput = RegisterInputJoin | RegisterInputCreate;

export interface AuthResponse {
  user: User;
  token: string;
}

// UI-specific types
export const USER_ROLE_CONFIG = {
  admin: {
    label: { ar: "مدير النظام", en: "Admin" },
    color: "red",
  },
  senior_lawyer: {
    label: { ar: "محامي أول", en: "Senior Lawyer" },
    color: "purple",
  },
  lawyer: {
    label: { ar: "محامي", en: "Lawyer" },
    color: "blue",
  },
  paralegal: {
    label: { ar: "مساعد قانوني", en: "Paralegal" },
    color: "green",
  },
  clerk: {
    label: { ar: "كاتب", en: "Clerk" },
    color: "gray",
  },
} as const;

// RBAC Permissions
export const PERMISSIONS = {
  admin: ["*"],
  senior_lawyer: ["cases.*", "regulations.read", "ai-links.verify", "clients.*", "documents.*"],
  lawyer: ["cases.*", "regulations.read", "ai-links.verify", "clients.*", "documents.*"],
  paralegal: ["cases.create", "cases.read", "cases.update", "regulations.read", "clients.read", "documents.*"],
  clerk: ["cases.create", "cases.read", "regulations.read", "clients.read", "documents.read"],
} as const;
