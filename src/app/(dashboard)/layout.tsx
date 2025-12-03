/*
 * File: src/app/(dashboard)/layout.tsx
 * Purpose: Shared layout for all authenticated dashboard routes.
 *  - Renders the vertical Sidebar and top Header around page content.
 *  - Provides a clean, responsive shell consistent with the design plan.
 *
 * Routes under this group include:
 *  - /dashboard
 *  - /cases
 *  - /regulations
 *  - /settings
 */

import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-50">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


