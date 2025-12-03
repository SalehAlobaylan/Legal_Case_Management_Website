/*
 * File: src/components/layout/sidebar.tsx
 * Purpose: Main app sidebar for the authenticated dashboard area.
 *  - Shows primary navigation (Dashboard, Cases, Regulations, Settings).
 *  - Highlights the active route based on pathname.
 *  - Provides a prominent Logout action wired to the Fastify auth backend via useLogout().
 *
 * This follows the structure from the Web Frontend Implementation Plan (Phase 4).
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLogout } from "@/lib/hooks/use-auth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: Briefcase },
  { name: "Regulations", href: "/regulations", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="hidden h-screen w-64 border-r border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 sm:flex sm:flex-col">
      <div className="flex h-full flex-col">
        {/* Logo / Brand */}
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Legal CMS
          </div>
          <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            Case Management
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-gray-400"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 px-3 py-4 dark:border-gray-800">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5 text-gray-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}


