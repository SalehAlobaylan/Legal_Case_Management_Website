/*
 * File: src/lib/store/auth-store.ts
 * Purpose: Hold authentication state (user, token, isAuthenticated) in a global Zustand store with persistence.
 * Used by: API client, auth hooks, and UI components that need to read or update the current logged-in user.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: number;
  clientId?: number | null;
  // Optional profile fields
  phone?: string;
  bio?: string;
  location?: string;
  specialization?: string;
  avatarUrl?: string;
  isOAuthUser?: boolean;
  // Per-user permission overrides granted by an admin (e.g. "cases.assign",
  // "cases.viewAll"). Merged with role permissions in usePermission().
  grantedPermissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  // True for read-only "museum mode" demo sessions. When set, the API client
  // blocks write requests client-side and the UI disables mutating actions.
  // The backend independently enforces this via the JWT `museum` flag.
  museum: boolean;

  setUser: (user: User, token: string, opts?: { museum?: boolean }) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      museum: false,

      setUser: (user, token, opts) => {
        const museum = opts?.museum === true;
        // Update in-memory + persisted state
        set({ user, token, isAuthenticated: true, museum });
        // Also set a lightweight cookie so Next.js middleware can detect auth
        if (typeof document !== "undefined") {
          const maxAgeSeconds = 7 * 24 * 60 * 60; // 7 days
          document.cookie = `auth-storage=1; Path=/; Max-Age=${maxAgeSeconds}`;
          document.cookie = `auth-role=${encodeURIComponent(user.role)}; Path=/; Max-Age=${maxAgeSeconds}`;
          if (museum) {
            document.cookie = `auth-museum=1; Path=/; Max-Age=${maxAgeSeconds}`;
          } else {
            document.cookie =
              "auth-museum=; Path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        }
      },

      updateUser: (user) => {
        set({ user });
        if (typeof document !== "undefined") {
          const maxAgeSeconds = 7 * 24 * 60 * 60;
          document.cookie = `auth-role=${encodeURIComponent(user.role)}; Path=/; Max-Age=${maxAgeSeconds}`;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, museum: false });
        // Clear the auth cookie used by middleware
        if (typeof document !== "undefined") {
          document.cookie =
            "auth-storage=; Path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "auth-role=; Path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "auth-museum=; Path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        museum: state.museum,
      }),
    }
  )
);
