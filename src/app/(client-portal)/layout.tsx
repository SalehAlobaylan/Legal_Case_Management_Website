"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Receipt } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/hooks/use-i18n";

export default function ClientPortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t, isRTL } = useI18n();

  const items = [
    { href: "/portal/overview", label: t("portal.overview"), icon: Home },
    { href: "/portal/documents", label: t("portal.documents"), icon: FileText },
    { href: "/portal/billing", label: t("portal.billing"), icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <h1 className="font-serif text-xl font-bold text-[#0F2942]">{t("portal.title")}</h1>
          <nav className="flex gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm",
                    active
                      ? "border-[#0F2942] bg-[#0F2942] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 md:p-6">{children}</main>
    </div>
  );
}
