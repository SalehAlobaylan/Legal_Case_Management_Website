/**
 * File: src/components/ui/dialog.tsx
 * Purpose: Lightweight dialog/modal primitives styled for the Madar design system.
 *
 * Features:
 * - Overlay with 60% black + backdrop blur
 * - Centered content with rounded-2xl corners and soft shadow
 * - ESC key to close, overlay click to close
 * - Optional Trigger / Close helpers
 * - Header, Title, Description, Footer slots
 *
 * Note: This is a minimal, dependency-free alternative to Radix Dialog, tuned to
 * the visual specifications in the refactoring plan.
 */

"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* =============================================================================
   CONTEXT
   ============================================================================= */

interface DialogContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(component: string) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Dialog>`);
  }
  return ctx;
}

/* =============================================================================
   ROOT
   ============================================================================= */

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, defaultOpen, onOpenChange, children }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState<boolean>(
    defaultOpen ?? false
  );

  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo(() => ({ open: currentOpen, setOpen }), [currentOpen, setOpen]);

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

/* =============================================================================
   TRIGGER
   ============================================================================= */

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function DialogTrigger({ asChild, onClick, ...props }: DialogTriggerProps) {
  const { setOpen } = useDialogContext("DialogTrigger");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      setOpen(true);
    }
  };

  if (asChild && props.children && React.isValidElement(props.children)) {
    return React.cloneElement(props.children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return <button type="button" onClick={handleClick} {...props} />;
}

/* =============================================================================
   OVERLAY
   ============================================================================= */

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  const { setOpen } = useDialogContext("DialogOverlay");
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        "transition-opacity duration-200",
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    />
  );
}

/* =============================================================================
   CONTENT
   ============================================================================= */

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Close when pressing Escape (default: true) */
  closeOnEsc?: boolean;
}

export function DialogContent({
  className,
  children,
  closeOnEsc = true,
  ...props
}: DialogContentProps) {
  const { open, setOpen } = useDialogContext("DialogContent");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, setOpen]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
      <DialogOverlay />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden",
          "border border-slate-200",
          "animate-in fade-in zoom-in-95 duration-200",
          "dark:bg-slate-900 dark:border-slate-800",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/* =============================================================================
   HEADER / TITLE / DESCRIPTION
   ============================================================================= */

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-6 border-b border-slate-100 bg-slate-50",
        "flex items-center justify-between",
        "dark:border-slate-800 dark:bg-slate-900/50",
        className
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-bold text-[#0F2942] dark:text-white", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  );
}

/* =============================================================================
   BODY / FOOTER / CLOSE
   ============================================================================= */

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-6 border-t border-slate-100 bg-slate-50",
        "flex justify-end gap-3",
        "dark:border-slate-800 dark:bg-slate-900/50",
        className
      )}
      {...props}
    />
  );
}

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function DialogClose({ asChild, onClick, children, ...props }: DialogCloseProps) {
  const { setOpen } = useDialogContext("DialogClose");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      setOpen(false);
    }
  };

  if (asChild && children && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

/* =============================================================================
   CLOSE BUTTON (ICON)
   ============================================================================= */

export function DialogCloseIconButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <DialogClose
      className={cn(
        "absolute top-4 right-4 rounded-full",
        "text-slate-400 hover:text-slate-600",
        "hover:bg-slate-200",
        "p-1 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]",
        className
      )}
      {...props}
    >
      <X className="h-5 w-5" />
      <span className="sr-only">Close</span>
    </DialogClose>
  );
}
