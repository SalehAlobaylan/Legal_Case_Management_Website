/**
 * File: src/components/ui/sheet.tsx
 * Purpose: Mobile-first slide-over panel — bottom sheet (default) or
 *          side drawer (RTL-aware start/end). Sibling to Dialog; use a
 *          Sheet when the content is long-form (filters, a TOC, an AI
 *          chat) and should feel attached to the viewport edge rather
 *          than centered.
 *
 * Design parity with dialog.tsx:
 *   - Portaled to document.body
 *   - Backdrop click + Escape to dismiss (opt-out via props)
 *   - Body scroll lock while open
 *   - Focus trap + initial focus on first focusable element
 *   - No external animation lib; Tailwind `animate-in` utilities only
 *
 * Mobile progressive enhancement:
 *   - Bottom sheets support a drag handle + swipe-to-dismiss via
 *     pointer events (`touch-action: pan-x` so horizontal scrollers
 *     inside still work). Falls back gracefully without pointer events.
 *   - Pairs with the `pb-safe` utility from globals.css so the sheet
 *     respects the home-indicator area on notched phones.
 *
 * RTL:
 *   - `side="start"` / `side="end"` map to left/right based on the
 *     nearest `dir` ancestor, so passing `side="end"` renders on the
 *     right in LTR and the left in RTL (matches how users expect a
 *     "trailing edge" panel to appear).
 */

"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* =============================================================================
   CONTEXT
   ============================================================================= */

interface SheetContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext(component: string) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Sheet>`);
  }
  return ctx;
}

/* =============================================================================
   ROOT
   ============================================================================= */

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState<boolean>(
    defaultOpen ?? false
  );
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo(
    () => ({ open: currentOpen, setOpen }),
    [currentOpen, setOpen]
  );

  return (
    <SheetContext.Provider value={value}>{children}</SheetContext.Provider>
  );
}

/* =============================================================================
   TRIGGER
   ============================================================================= */

export interface SheetTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function SheetTrigger({
  asChild,
  onClick,
  ...props
}: SheetTriggerProps) {
  const { setOpen } = useSheetContext("SheetTrigger");
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) setOpen(true);
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

function SheetOverlay({ className }: { className?: string }) {
  const { setOpen } = useSheetContext("SheetOverlay");
  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        "bg-slate-900/50 backdrop-blur-sm",
        "animate-in fade-in duration-200",
        className
      )}
      onClick={() => setOpen(false)}
      aria-hidden="true"
    />
  );
}

/* =============================================================================
   CONTENT
   ============================================================================= */

type SheetSide = "bottom" | "start" | "end" | "top";

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which edge the sheet attaches to. Default: "bottom". */
  side?: SheetSide;
  /** Close when pressing Escape. Default: true. */
  closeOnEsc?: boolean;
  /** Show the drag handle + allow swipe-to-dismiss (bottom sheets only). */
  draggable?: boolean;
  /** Optional class for the content panel. */
  className?: string;
  /** Show the default close (X) button in the top-end corner. Default: true. */
  showClose?: boolean;
  /** aria-label for the dialog (required when there is no visible title). */
  ariaLabel?: string;
}

/**
 * Base positioning + animation classes per side. Uses Tailwind's animate-in
 * utilities so there's no animation-library dependency.
 */
const SIDE_CLASSES: Record<SheetSide, string> = {
  bottom: cn(
    "fixed inset-x-0 bottom-0 z-50",
    "rounded-t-2xl",
    "max-h-[92dvh]",
    "animate-in slide-in-from-bottom duration-300"
  ),
  top: cn(
    "fixed inset-x-0 top-0 z-50",
    "rounded-b-2xl",
    "max-h-[92dvh]",
    "animate-in slide-in-from-top duration-300"
  ),
  // start/end resolve to left/right via the CSS logical property `inset-inline-*`
  // so RTL and LTR both do the right thing without us branching on `isRTL`.
  start: cn(
    "fixed top-0 bottom-0 z-50 start-0",
    "w-[min(88vw,24rem)]",
    "rounded-e-2xl",
    "animate-in slide-in-from-left duration-300 rtl:slide-in-from-right"
  ),
  end: cn(
    "fixed top-0 bottom-0 z-50 end-0",
    "w-[min(88vw,24rem)]",
    "rounded-s-2xl",
    "animate-in slide-in-from-right duration-300 rtl:slide-in-from-left"
  ),
};

export function SheetContent({
  side = "bottom",
  closeOnEsc = true,
  draggable = true,
  showClose = true,
  ariaLabel,
  className,
  children,
  ...props
}: SheetContentProps) {
  const { open, setOpen } = useSheetContext("SheetContent");
  const [mounted, setMounted] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  // ESC to close
  React.useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, setOpen]);

  // Body scroll lock
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus trap
  React.useEffect(() => {
    if (!open || !contentRef.current) return;
    const focusables = contentRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey && document.activeElement === first) {
        last?.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first?.focus();
        e.preventDefault();
      }
    };
    first?.focus();
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  // Swipe-to-dismiss (bottom sheet only). Uses pointer events and resets
  // the transform on pointerup so a cancelled gesture snaps back.
  const [dragY, setDragY] = React.useState(0);
  const dragStartRef = React.useRef<number | null>(null);
  const allowDrag = draggable && side === "bottom";

  const onPointerDown = (e: React.PointerEvent) => {
    if (!allowDrag) return;
    // Only start dragging from the handle / header, not from inner scrollers.
    const target = e.target as HTMLElement;
    if (!target.closest("[data-sheet-drag-handle]")) return;
    dragStartRef.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!allowDrag || dragStartRef.current == null) return;
    const delta = e.clientY - dragStartRef.current;
    setDragY(delta > 0 ? delta : 0);
  };
  const onPointerUp = () => {
    if (!allowDrag) return;
    if (dragY > 120) {
      setOpen(false);
    }
    setDragY(0);
    dragStartRef.current = null;
  };

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <SheetOverlay />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={
          allowDrag && dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined
        }
        className={cn(
          SIDE_CLASSES[side],
          "bg-white shadow-2xl shadow-slate-900/20",
          "border border-slate-200/80",
          "flex flex-col",
          "dark:bg-slate-900 dark:border-slate-700",
          // Respect safe-area on the bottom edge for iOS home-indicator.
          side === "bottom" && "pb-safe",
          side === "top" && "pt-safe",
          className
        )}
        {...props}
      >
        {allowDrag && (
          <div
            data-sheet-drag-handle
            className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            <span className="h-1.5 w-10 rounded-full bg-slate-300" />
          </div>
        )}
        {showClose && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className={cn(
              "absolute top-3 end-3",
              "flex h-9 w-9 items-center justify-center rounded-full",
              "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
              "transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)]"
            )}
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </>,
    document.body
  );
}

/* =============================================================================
   HEADER / TITLE / BODY / FOOTER — thin layout helpers so consumers don't
   hand-roll the same paddings every time.
   ============================================================================= */

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-5 pt-2 pb-3 border-b border-slate-100",
        "flex items-start gap-3",
        className
      )}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-bold text-[var(--color-text-primary)]",
        className
      )}
      {...props}
    />
  );
}

export function SheetBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 min-h-0 overflow-y-auto px-5 py-4",
        "scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent",
        className
      )}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-5 py-3 border-t border-slate-100",
        "flex items-center justify-end gap-2",
        className
      )}
      {...props}
    />
  );
}

/* =============================================================================
   CLOSE
   ============================================================================= */

export function SheetClose({
  asChild,
  onClick,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { setOpen } = useSheetContext("SheetClose");
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) setOpen(false);
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
