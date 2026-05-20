/**
 * File: src/components/features/admin/stat-card.tsx
 * Purpose: Shared stat-card primitive used by the admin dashboard hero and the
 *          per-lawyer drill-down. Big-number first, label second — the value
 *          should be readable from across the room.
 */

"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {label}
            </div>
            <div className="mt-2 text-3xl md:text-4xl font-bold text-[#0F2942] leading-none tabular-nums">
              {value}
            </div>
          </div>
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${accent}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
