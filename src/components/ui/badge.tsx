/*
 * File: src/components/ui/badge.tsx
 * Purpose: Lightweight badge/pill component used for statuses and labels.
 * Inspired by shadcn/ui's Badge API but implemented without external deps.
 */

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant = "default" | "outline";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variant === "default" &&
          "border-transparent bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
        variant === "outline" &&
          "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200",
        className
      )}
      {...props}
    />
  );
}


