/*
 * File: src/lib/types/auth.ts
 * Purpose: TypeScript types for authentication.
 * Used by: Auth hooks and store.
 */

export type UserRole =
  | "admin"
  | "senior_lawyer"
  | "lawyer"
  | "paralegal"
  | "clerk"
  | "client";

export interface User {
  id: string;
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

export type RegisterInputPersonal = {
  registrationType?: "personal";
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role?: UserRole;
};

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

export type RegisterInput = RegisterInputPersonal | RegisterInputJoin | RegisterInputCreate;

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
  client: {
    label: { ar: "عميل", en: "Client" },
    color: "amber",
  },
} as const;

// RBAC Permissions
//
// Notes on the new admin-capability permissions (under `delegated.*`):
//   - `delegated.cases.assign`  — assign/reassign cases. Admin has via "*".
//                                  Non-admins can be granted it individually by an admin.
//   - `delegated.cases.viewAll` — bypass the org's restrict-case-visibility toggle.
//                                  Admin has via "*". Optionally granted to senior lawyers.
//
// They live under `delegated.*` (not `cases.*`) so the lawyer's role-default
// `cases.*` wildcard does NOT implicitly grant them.
export const PERMISSIONS = {
  admin: ["*"],
  senior_lawyer: ["cases.*", "regulations.read", "ai-links.verify", "clients.*", "documents.*"],
  lawyer: ["cases.*", "regulations.read", "ai-links.verify", "clients.*", "documents.*"],
  paralegal: ["cases.create", "cases.read", "cases.update", "regulations.read", "clients.read", "documents.*"],
  clerk: ["cases.create", "cases.read", "regulations.read", "clients.read", "documents.read"],
  client: ["cases.read", "documents.read", "billing.read"],
} as const;

// Permissions an admin can grant to individual team members on top of role defaults.
export const GRANTABLE_PERMISSIONS = [
  "delegated.cases.assign",
  "delegated.cases.viewAll",
  "delegated.cases.close",
  "delegated.documents.viewAll",
  "delegated.clients.viewAll",
] as const;
export type GrantablePermission = (typeof GRANTABLE_PERMISSIONS)[number];
