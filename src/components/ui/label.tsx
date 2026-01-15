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
            "text-sm font-bold text-[#0F2942]",
            "dark:text-slate-100",
            className
          )}
          {...props}
        >
          {children}
          {required && (
            <span className="ml-1 text-[#D97706]" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    );
  }
);

Label.displayName = "Label";
