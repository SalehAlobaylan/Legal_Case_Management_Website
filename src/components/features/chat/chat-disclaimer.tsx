"use client";

import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";

export function ChatDisclaimer() {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "px-4 py-1.5 text-center",
        "text-[9px] text-slate-400 leading-snug",
        "sm:rounded-b-2xl"
      )}
    >
      {t("chat.disclaimerShort")}
    </div>
  );
}
