/**
 * File: src/components/ui/empty-state.tsx
 * Purpose: Reusable empty and error state component for consistent UX.
 * Used when lists are empty, data fails to load, or resources are not found.
 */

"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "empty" | "error" | "notFound";
  className?: string;
  children?: React.ReactNode;
}

const variantStyles = {
  empty: "bg-slate-100 text-slate-500",
  error: "bg-red-50 text-red-600",
  notFound: "bg-slate-100 text-slate-500",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "empty",
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12",
        "animate-in fade-in duration-300",
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4",
            variantStyles[variant]
          )}
        >
          <Icon className="h-7 w-7 md:h-8 md:w-8" />
        </div>
      )}
      <h3 className="font-bold text-lg text-[#0F2942] mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-2.5 rounded-xl font-bold"
        >
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
