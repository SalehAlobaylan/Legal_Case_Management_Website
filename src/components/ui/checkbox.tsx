/**
 * File: src/components/ui/checkbox.tsx
 * Purpose: Small controlled checkbox styled to match the Silah design system.
 *          No new dependency — native input + Tailwind.
 */

"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onCheckedChange, className, disabled, ...rest }, ref) => {
    return (
      <label
        className={cn(
          "inline-flex items-center cursor-pointer select-none",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only peer"
          {...rest}
        />
        <span
          className={cn(
            "h-4 w-4 rounded border flex items-center justify-center transition-colors",
            "border-slate-300 bg-white",
            "peer-checked:bg-orange-500 peer-checked:border-orange-500",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-orange-400 peer-focus-visible:ring-offset-1"
          )}
        >
          {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
