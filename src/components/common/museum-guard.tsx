"use client";

/*
 * File: src/components/common/museum-guard.tsx
 * Purpose: Wrap a single mutating action (a button-like element) so that, in
 *          read-only "museum mode", it renders disabled with a hover/focus
 *          tooltip telling the visitor to sign up. Outside museum mode it
 *          renders its child untouched.
 *
 * Usage:
 *   <MuseumGuard>
 *     <Button onClick={...}>New Case</Button>
 *   </MuseumGuard>
 *
 * Notes:
 *  - A disabled button does not emit pointer events, so the tooltip lives on a
 *    wrapping <span> (group) while the inner element gets `pointer-events-none`.
 *  - Pure CSS tooltip (group-hover / focus-within) — no external tooltip dep,
 *    matching the codebase's hand-rolled UI primitives.
 *  - This is UX polish only; writes are also blocked by the API client and the
 *    backend, so any un-wrapped action still fails safely.
 */

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useMuseumMode, museumLockMessage } from "@/lib/hooks/use-museum-mode";

interface MuseumGuardProps {
  children: React.ReactElement<{
    disabled?: boolean;
    className?: string;
    onClick?: unknown;
  }>;
  /** Optional override for the tooltip message. */
  message?: string;
}

export function MuseumGuard({ children, message }: MuseumGuardProps) {
  const isMuseum = useMuseumMode();
  const { isRTL } = useI18n();

  if (!isMuseum) {
    return children;
  }

  const label = message ?? museumLockMessage(isRTL);

  const disabledChild = React.cloneElement(children, {
    disabled: true,
    onClick: undefined,
    className: cn(children.props.className, "pointer-events-none opacity-50"),
  });

  return (
    <span
      className="group relative inline-flex cursor-not-allowed"
      tabIndex={0}
      aria-label={label}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {disabledChild}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full mb-2 z-50 w-max max-w-[16rem] -translate-y-1",
          "rounded-md bg-[#0F2942] px-3 py-1.5 text-xs font-medium text-white text-center shadow-md",
          "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          isRTL ? "right-0" : "left-0"
        )}
      >
        {label}
      </span>
    </span>
  );
}
