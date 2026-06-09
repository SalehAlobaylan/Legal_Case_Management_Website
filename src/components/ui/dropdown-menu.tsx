"use client";

import * as React from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(
  null
);

function useDropdownMenu(component: string) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(`${component} must be used within <DropdownMenu>`);
  }
  return context;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={rootRef} className={cn("relative", open && "z-[60]")}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactElement;
}

export function DropdownMenuTrigger({
  asChild = false,
  children,
  onClick,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen } = useDropdownMenu("DropdownMenuTrigger");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      setOpen(!open);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
      "aria-expanded": open,
      "aria-haspopup": "menu",
    } as React.ButtonHTMLAttributes<HTMLButtonElement>);
  }

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 8,
  children,
  ...props
}: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdownMenu("DropdownMenuContent");
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
      <div
        role="menu"
        className={cn(
          "absolute top-full z-50 min-w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-2xl shadow-slate-900/10",
          "animate-in fade-in slide-in-from-top-1 duration-150",
          align === "start" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "end" && "right-0",
          className
        )}
        style={{ marginTop: sideOffset }}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1.5 text-xs font-bold text-slate-500", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-slate-100", className)}
      {...props}
    />
  );
}

export interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
  destructive?: boolean;
}

export function DropdownMenuItem({
  className,
  inset = false,
  destructive = false,
  onClick,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu("DropdownMenuItem");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) setOpen(false);
  };

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start text-sm font-medium text-slate-700 transition-colors",
        "hover:bg-slate-50 hover:text-[#0F2942] focus:bg-slate-50 focus:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        inset && "ps-8",
        destructive && "text-red-600 hover:bg-red-50 hover:text-red-700",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem({
  checked,
  children,
  className,
  ...props
}: DropdownMenuItemProps & { checked?: boolean }) {
  return (
    <DropdownMenuItem className={cn("justify-between", className)} {...props}>
      <span>{children}</span>
      {checked ? <Check className="h-4 w-4 text-[#D97706]" /> : null}
    </DropdownMenuItem>
  );
}

export function DropdownMenuSubLabel({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between px-2 py-2", className)}>
      {children}
      <ChevronRight className="h-4 w-4 text-slate-400 rtl:rotate-180" />
    </div>
  );
}
