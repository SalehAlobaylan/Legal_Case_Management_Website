/**
 * File: src/components/ui/badge.tsx
 * Purpose: Badge/pill component with Madar design system styling.
 *
 * Variants:
 * - default: Neutral gray badge
 * - primary: Navy brand badge
 * - accent: Orange accent badge
 * - success: Green success badge
 * - warning: Orange/amber warning badge
 * - error: Red error badge
 * - info: Blue info badge
 * - outline: Bordered badge with transparent background
 *
 * Sizes: sm, md, lg
 */

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "default"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "outline";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        // Base styles
        "inline-flex items-center font-bold uppercase tracking-wider",
        "rounded-md border",
        "transition-colors duration-200",
        // Size variants
        {
          "px-1.5 py-0.5 text-[9px]": size === "sm",
          "px-2 py-1 text-[10px]": size === "md",
          "px-2.5 py-1 text-xs": size === "lg",
        },
        // Color variants
        {
          // Default - Neutral gray
          "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300":
            variant === "default",
          // Primary - Navy
          "border-transparent bg-[#0F2942] text-white":
            variant === "primary",
          // Accent - Orange
          "border-transparent bg-[#D97706] text-white shadow-sm":
            variant === "accent",
          // Success - Green
          "border-transparent bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400":
            variant === "success",
          // Warning - Amber/Orange
          "border-transparent bg-orange-50 text-[#D97706] dark:bg-orange-500/10 dark:text-orange-400":
            variant === "warning",
          // Error - Red
          "border-transparent bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400":
            variant === "error",
          // Info - Blue
          "border-transparent bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400":
            variant === "info",
          // Outline - Bordered
          "border-slate-300 bg-transparent text-slate-700 dark:border-slate-600 dark:text-slate-300":
            variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

/* =============================================================================
   STATUS BADGE - Specialized for case/regulation statuses
   ============================================================================= */

export type StatusType =
  | "open"
  | "in_progress"
  | "pending_hearing"
  | "closed"
  | "archived"
  | "active"
  | "amended"
  | "draft";

export interface StatusBadgeProps
  extends Omit<BadgeProps, "variant" | "children"> {
  status: StatusType;
  /** Custom label override */
  label?: string;
}

const statusConfig: Record<
  StatusType,
  { variant: BadgeVariant; label: string }
> = {
  // Case statuses
  open: { variant: "info", label: "Open" },
  in_progress: { variant: "warning", label: "In Progress" },
  pending_hearing: { variant: "accent", label: "Pending Hearing" },
  closed: { variant: "success", label: "Closed" },
  archived: { variant: "default", label: "Archived" },
  // Regulation statuses
  active: { variant: "success", label: "Active" },
  amended: { variant: "warning", label: "Amended" },
  draft: { variant: "default", label: "Draft" },
};

export function StatusBadge({ status, label, ...props }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: "default", label: status };

  return (
    <Badge variant={config.variant} {...props}>
      {label || config.label}
    </Badge>
  );
}