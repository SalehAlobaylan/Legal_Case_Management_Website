"use client";

import * as React from "react";
import { dismissToast, useToastStore } from "./use-toast";
import { CheckCircle2, AlertTriangle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Toaster() {
  const toasts = useToastStore();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon =
          t.variant === "destructive"
            ? AlertTriangle
            : t.variant === "success"
              ? CheckCircle2
              : Info;
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3 shadow-lg",
              t.variant === "destructive"
                ? "border-red-200"
                : t.variant === "success"
                  ? "border-emerald-200"
                  : "border-slate-200"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 mt-0.5 shrink-0",
                t.variant === "destructive"
                  ? "text-red-500"
                  : t.variant === "success"
                    ? "text-emerald-600"
                    : "text-slate-500"
              )}
            />
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-semibold text-[#0F2942]">{t.title}</p>}
              {t.description && (
                <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
