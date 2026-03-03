/**
 * File: src/components/ui/label.tsx
 * Purpose: Form label component with Silah design system styling.
 */

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Show required indicator (*) */
  required?: boolean;
  /** Optional description text */
  description?: string;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, description, children, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label
          ref={ref}
          className={cn(
            "text-sm font-semibold text-[var(--color-text-secondary)]",
            className
          )}
          {...props}
        >
          {children}
          {required && (
            <span className="ml-1 text-[var(--color-brand-accent)]" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {description && (
          <p className="text-xs text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
      </div>
    );
  }
);

Label.displayName = "Label";
