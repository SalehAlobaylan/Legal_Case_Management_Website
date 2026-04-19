"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/hooks/use-i18n";
import { cn } from "@/lib/utils/cn";

type Variant = "default" | "tease" | "tease-hero";

interface NajizLockOverlayProps {
  children: React.ReactNode;
  className?: string;
  /**
   * "default" — strong blur + centered lock panel (hides content).
   * "tease"   — light blur + corner pill only, so titles/CTAs stay readable
   *              and the feature excites the user while still being gated.
   */
  variant?: Variant;
}

export function NajizLockOverlay({
  children,
  className,
  variant = "default",
}: NajizLockOverlayProps) {
  const { t, isRTL } = useI18n();

  if (variant === "tease-hero") {
    return (
      <div className={cn("relative", className)}>
        <div aria-hidden className="pointer-events-none select-none blur-[1.5px] opacity-95">
          {children}
        </div>
        <div className={cn("absolute top-4 z-10", isRTL ? "left-4" : "right-4")}>
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/30 px-2.5 py-1.5 rounded-full shadow-md">
            <div className="bg-[#D97706]/30 text-[#D97706] p-1 rounded-full">
              <Lock className="h-3 w-3" />
            </div>
            <Badge variant="warning" size="sm">
              {t("dashboard.najizSoon")}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "tease") {
    return (
      <div className={cn("relative", className)}>
        {/* Children render normally — header stays fully sharp */}
        {children}
        {/* Backdrop overlay starts below the card header (~68px), leaving titles unaffected */}
        <div className="absolute inset-x-0 bottom-0 top-[68px] pointer-events-none backdrop-blur-[2px] bg-white/20 rounded-b-3xl" />
        {/* Lock banner sits at the very top of the blur zone — never overlaps the header title */}
        <div className="absolute inset-x-0 top-[68px] z-10 pointer-events-none flex items-center justify-center py-1.5 gap-1.5 bg-white/80 backdrop-blur-sm border-y border-slate-200/60">
          <div className="bg-[#D97706]/15 text-[#D97706] p-0.5 rounded-full">
            <Lock className="h-2.5 w-2.5" />
          </div>
          <Badge variant="warning" size="sm">
            {t("dashboard.najizSoon")}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="pointer-events-none select-none blur-[2px] opacity-60"
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4 bg-white/40 backdrop-blur-[1px]">
        <div className="flex flex-col items-center text-center max-w-[85%] gap-2 rounded-2xl bg-white/90 border border-slate-200 shadow-sm px-4 py-3">
          <div className="bg-[#0F2942]/10 text-[#0F2942] p-2 rounded-full">
            <Lock className="h-4 w-4" />
          </div>
          <Badge variant="warning" size="sm">
            {t("dashboard.najizSoon")}
          </Badge>
          <p className="text-[11px] text-slate-500 font-medium leading-snug">
            {t("dashboard.najizSoonDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}
