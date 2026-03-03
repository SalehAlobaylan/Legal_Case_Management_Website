/**
 * File: src/components/ui/textarea.tsx
 * Purpose: Textarea component with Silah design system styling.
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
          "flex min-h-[80px] w-full rounded-lg border bg-[var(--color-surface-card)]",
          "px-3 py-2 text-sm text-[var(--color-text-primary)]",
          "placeholder:text-[var(--color-text-muted)]",
          error
            ? "border-[var(--color-error-border)] focus-visible:ring-[var(--color-error-text)] focus-visible:border-[var(--color-error-text)]"
            : "border-[var(--color-border-default)] focus-visible:ring-[var(--color-brand-accent)] focus-visible:border-[var(--color-brand-accent)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          "resize-none",
          "transition-colors duration-200",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-muted)]",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
