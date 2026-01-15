/**
 * File: src/components/ui/dialog.tsx
 * Purpose: Polished dialog/modal primitives styled for the Silah design system.
 *
 * Features:
 * - Smooth animations with spring-like effects
 * - Overlay with blur and gradient
 * - Centered content with rounded-2xl corners and elegant shadow
 * - ESC key to close, overlay click to close
 * - Multiple size variants (sm, default, lg, xl, full)
 * - Header with optional icon slot
 * - Body with scroll support
 * - Footer with action buttons
 * - Accessible with proper ARIA attributes
 *
 * Version: 2.0 - Enhanced for Phase 4
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
        "fixed inset-0 z-50",
        "bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/70",
        "backdrop-blur-sm",
        "animate-in fade-in duration-300",
        className
      )}
      onClick={() => setOpen(false)}
      aria-hidden="true"
      {...props}
    />
  );
}

/* =============================================================================
   CONTENT
   ============================================================================= */

type DialogSize = "sm" | "default" | "lg" | "xl" | "full";

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-sm",
  default: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
};

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Close when pressing Escape (default: true) */
  closeOnEsc?: boolean;
  /** Modal size variant */
  size?: DialogSize;
}

export function DialogContent({
  className,
  children,
  closeOnEsc = true,
  size = "default",
  ...props
}: DialogContentProps) {
  const { open, setOpen } = useDialogContext("DialogContent");
  const [mounted, setMounted] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  // Handle ESC key
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

  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Focus trap
  React.useEffect(() => {
    if (open && contentRef.current) {
      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      };

      firstElement?.focus();
      document.addEventListener("keydown", handleTab);
      return () => document.removeEventListener("keydown", handleTab);
    }
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <DialogOverlay />

      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-50 w-full",
          sizeClasses[size],
          "bg-white rounded-2xl",
          "shadow-2xl shadow-slate-900/20",
          "border border-slate-200/80",
          "overflow-hidden",
          // Animation
          "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300",
          // Dark mode
          "dark:bg-slate-900 dark:border-slate-700",
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
   HEADER
   ============================================================================= */

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional icon to display before title */
  icon?: React.ReactNode;
}

export function DialogHeader({ className, icon, children, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-5",
        "border-b border-slate-100",
        "bg-gradient-to-r from-slate-50 to-white",
        "flex items-center gap-4",
        "dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-900/50",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="p-2 rounded-xl bg-[#0F2942] text-white shadow-lg shadow-slate-900/10">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* =============================================================================
   TITLE & DESCRIPTION
   ============================================================================= */

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-bold text-[#0F2942]",
        "dark:text-white",
        className
      )}
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
      className={cn(
        "text-sm text-slate-500 mt-1",
        "dark:text-slate-400",
        className
      )}
      {...props}
    />
  );
}

/* =============================================================================
   BODY
   ============================================================================= */

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-6",
        "max-h-[60vh] overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent",
        className
      )}
      {...props}
    />
  );
}

/* =============================================================================
   FOOTER
   ============================================================================= */

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4",
        "border-t border-slate-100",
        "bg-gradient-to-r from-slate-50 to-white",
        "flex items-center justify-end gap-3",
        "dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-900/50",
        className
      )}
      {...props}
    />
  );
}

/* =============================================================================
   CLOSE CONTROLS
   ============================================================================= */

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
   CLOSE ICON BUTTON
   ============================================================================= */

export function DialogCloseIconButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <DialogClose
      className={cn(
        "absolute top-4 right-4",
        "p-2 rounded-full",
        "text-slate-400 hover:text-slate-600",
        "bg-transparent hover:bg-slate-100",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <X className="h-5 w-5" />
      <span className="sr-only">Close</span>
    </DialogClose>
  );
}

/* =============================================================================
   CONFIRMATION DIALOG HELPER
   ============================================================================= */

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const confirmButtonClass = cn(
    "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
    variant === "danger" && "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
    variant === "warning" && "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20",
    variant === "default" && "bg-[#D97706] hover:bg-[#B45309] text-white shadow-lg shadow-orange-500/20"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={confirmButtonClass}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
