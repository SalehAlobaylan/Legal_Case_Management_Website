/**
 * File: src/components/ui/textarea.tsx
 * Purpose: Textarea component with Madar design system styling.
 *
 * Features:
 * - Orange accent focus ring
 * - Consistent styling with Input component
 * - Dark mode support
 * - Error state
 */

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state styling */
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          // Base styles
          "flex min-h-[80px] w-full rounded-lg border bg-white",
          "px-3 py-2 text-sm text-[#0F2942]",
          // Placeholder
          "placeholder:text-slate-400",
          // Border
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-slate-200 focus-visible:ring-[#D97706]",
          // Focus
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          "focus-visible:border-[#D97706]",
          // Resize
          "resize-none",
          // Transition
          "transition-colors duration-200",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
          // Dark mode
          "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
          "dark:placeholder:text-slate-500",
          "dark:focus-visible:border-[#D97706]",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
