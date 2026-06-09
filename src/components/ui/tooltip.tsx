"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltipContext(component: string) {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error(`${component} must be used within <Tooltip>`);
  }
  return context;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const reactId = React.useId();
  const contentId = `tooltip-${reactId}`;

  return (
    <TooltipContext.Provider value={{ open, setOpen, contentId }}>
      <span className="relative inline-flex">{children}</span>
    </TooltipContext.Provider>
  );
}

interface TooltipTriggerProps
  extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children: React.ReactElement;
}

export function TooltipTrigger({
  asChild = false,
  children,
  ...props
}: TooltipTriggerProps) {
  const { setOpen, contentId } = useTooltipContext("TooltipTrigger");
  const handlers = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    "aria-describedby": contentId,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...handlers,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button type="button" {...props} {...handlers}>
      {children}
    </button>
  );
}

export function TooltipContent({
  className,
  children,
  side = "top",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: "top" | "bottom" }) {
  const { open, contentId } = useTooltipContext("TooltipContent");

  if (!open) return null;

  return (
    <div
      id={contentId}
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-50 rounded-md bg-[#0F2942] px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg",
        side === "top"
          ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
          : "left-1/2 top-full mt-2 -translate-x-1/2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
