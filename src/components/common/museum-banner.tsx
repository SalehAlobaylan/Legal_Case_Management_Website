"use client";

/*
 * File: src/components/common/museum-banner.tsx
 * Purpose: Slim, always-visible banner shown only during read-only "museum mode"
 *          demo sessions. Tells the visitor the app is read-only and links to
 *          sign-up. Renders nothing for normal authenticated sessions.
 */

import Link from "next/link";
import { Eye } from "lucide-react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useMuseumMode } from "@/lib/hooks/use-museum-mode";

export function MuseumBanner() {
  const isMuseum = useMuseumMode();
  const { isRTL } = useI18n();

  if (!isMuseum) {
    return null;
  }

  const text = isRTL
    ? "أنت في الوضع التجريبي — للعرض فقط. أنشئ حسابًا لتفعيل التعديل وميزات الذكاء الاصطناعي."
    : "Demo mode — read only. Sign up to unlock editing and AI features.";
  const cta = isRTL ? "إنشاء حساب" : "Sign up";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-[#D97706] px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm"
    >
      <Eye size={15} className="shrink-0" />
      <span>{text}</span>
      <Link
        href="/register"
        className="shrink-0 rounded-full bg-white/20 px-3 py-0.5 font-bold underline-offset-2 hover:bg-white/30 hover:underline"
      >
        {cta}
      </Link>
    </div>
  );
}
