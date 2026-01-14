/*
 * File: src/lib/hooks/use-permission.ts
 * Purpose: Hook for checking user permissions based on RBAC.
 * Used by: UI components to conditionally render actions based on user role.
 */

"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { PERMISSIONS, type UserRole } from "@/lib/types/auth";

/**
 * Hook for checking user permissions
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  /**
   * Check if the current user can perform an action
   * @param permission - Permission string like "cases.create" or "ai-links.verify"
   */
  const can = (permission: string): boolean => {
    if (!user) return false;

    const role = user.role as UserRole;
    const rolePermissions = PERMISSIONS[role] as readonly string[] | undefined;

    if (!rolePermissions) return false;

    // Admin has all permissions
    if (rolePermissions.includes("*")) return true;

    // Check for exact permission match
    if (rolePermissions.includes(permission)) return true;

    // Check for wildcard permission (e.g., "cases.*" matches "cases.create")
    const [resource] = permission.split(".");
    if (rolePermissions.includes(`${resource}.*`)) return true;

    return false;
  };

  /**
   * Check if the current user has any of the given permissions
   */
  const canAny = (permissions: string[]): boolean => {
    return permissions.some((p) => can(p));
  };

  /**
   * Check if the current user has all of the given permissions
   */
  const canAll = (permissions: string[]): boolean => {
    return permissions.every((p) => can(p));
  };

  /**
   * Check if the current user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  /**
   * Check if the current user has any of the given roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role as UserRole) : false;
  };

  /**
   * Check if the current user is an admin
   */
  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  return {
    can,
    canAny,
    canAll,
    hasRole,
    hasAnyRole,
    isAdmin,
  };
}
