/**
 * File: src/components/ui/banner.tsx
 * Purpose: Dismissible banner used for org-wide announcements.
 */

"use client";

import * as React from "react";
import { X, Info, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type BannerSeverity = "info" | "warning" | "important";

export interface BannerProps {
  severity?: BannerSeverity;
  title?: React.ReactNode;
  children?: React.ReactNode;
  onDismiss?: () => void;
  actionSlot?: React.ReactNode;
  className?: string;
}

const STYLES: Record<BannerSeverity, { wrap: string; icon: React.ElementType }> = {
  info: {
    wrap: "bg-slate-50 border-slate-200 text-slate-800",
    icon: Info,
  },
  warning: {
    wrap: "bg-amber-50 border-amber-200 text-amber-900",
    icon: AlertTriangle,
  },
  important: {
    wrap: "bg-red-50 border-red-200 text-red-900",
    icon: AlertOctagon,
  },
};

export function Banner({
  severity = "info",
  title,
  children,
  onDismiss,
  actionSlot,
  className,
}: BannerProps) {
  const { wrap, icon: Icon } = STYLES[severity];
  return (
    <div
      role="status"
      className={cn(
        "border-b px-4 py-2.5 flex items-start gap-3 text-sm",
        wrap,
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold leading-tight">{title}</div>}
        {children && <div className="mt-0.5 leading-snug">{children}</div>}
      </div>
      {actionSlot}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 -mr-1 p-1 rounded hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
