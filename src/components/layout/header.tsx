/*
 * File: src/components/layout/header.tsx
 * Purpose: Top application header for dashboard routes.
 *  - Shows contextual page title based on the current path.
 *  - Provides a (non-blocking) search input for cases/regulations.
 *  - Displays the current authenticated user from the Zustand auth store.
 *
 * This keeps logic light but visually polished, and is fully compatible
 * with the Fastify backend + auth flow defined in the plans.
 */

"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils/cn";
import { useWebSocket } from "@/lib/hooks/use-websocket";

function resolvePageMeta(pathname: string) {
  if (pathname.startsWith("/cases")) {
    return {
      title: "Cases",
      description: "Browse, filter, and manage your active legal cases.",
    };
  }

  if (pathname.startsWith("/regulations")) {
    return {
      title: "Regulations",
      description: "Explore linked regulations and legal references.",
    };
  }

  if (pathname.startsWith("/settings")) {
    return {
      title: "Settings",
      description: "Manage your account, organization, and preferences.",
    };
  }

  return {
    title: "Dashboard",
    description: "Overview of your caseload and recent activity.",
  };
}

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const meta = resolvePageMeta(pathname);

  // Establish a WebSocket connection for authenticated dashboard users.
  // This keeps case/regulation data and AI links in sync with backend events
  // (see `use-websocket.ts` for details about the real-time flow).
  useWebSocket();

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        {/* Page title & subtitle */}
        <div>
          <h1 className="text-lg font-semibold leading-tight tracking-tight text-gray-900 dark:text-gray-50 md:text-xl">
            {meta.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm">
            {meta.description}
          </p>
        </div>

        {/* Search + user summary */}
        <div className="flex items-center gap-4">
          {/* Search (non-blocking placeholder) */}
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search cases or regulations"
              className="h-9 w-56 rounded-full border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-900 shadow-sm outline-none ring-0 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Notifications placeholder */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          {/* User avatar/summary */}
          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-left text-xs shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[0.7rem] font-semibold uppercase text-white">
              {user?.fullName
                ?.split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2) || "LC"}
            </div>
            <div className="leading-tight">
              <div className="font-medium text-gray-900 dark:text-gray-50">
                {user?.fullName || "Logged-in user"}
              </div>
              <div className={cn("text-[0.65rem] text-muted-foreground")}>
                {user?.role || "Lawyer"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


