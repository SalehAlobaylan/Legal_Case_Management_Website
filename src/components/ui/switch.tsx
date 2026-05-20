/**
 * File: src/components/ui/switch.tsx
 * Purpose: Accessible toggle switch using a checkbox input + CSS, no extra deps.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "size"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  switchSize?: "sm" | "md";
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onCheckedChange, switchSize = "md", className, disabled, ...rest }, ref) => {
    const dims =
      switchSize === "sm"
        ? { track: "h-4 w-7", thumb: "h-3 w-3", translate: "translate-x-3" }
        : { track: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4" };

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
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only peer"
          {...rest}
        />
        <span
          className={cn(
            "relative rounded-full transition-colors duration-200",
            "bg-zinc-300 dark:bg-zinc-700",
            "peer-checked:bg-orange-500",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-orange-400 peer-focus-visible:ring-offset-2",
            dims.track
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 rounded-full bg-white shadow",
              "transition-transform duration-200",
              dims.thumb,
              checked && dims.translate
            )}
          />
        </span>
      </label>
    );
  }
);
Switch.displayName = "Switch";
