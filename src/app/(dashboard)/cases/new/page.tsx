/*
 * File: src/app/(dashboard)/cases/new/page.tsx
 * Purpose: New case creation page that embeds the Phase 8 `CaseForm` component.
 */

"use client";

import { useRouter } from "next/navigation";
import { CaseForm } from "@/components/features/cases/case-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/lib/hooks/use-i18n";

export default function NewCasePage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl text-[#0F2942]">
          {t("cases.newCase")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isRTL ? "أنشئ قضية جديدة بالتفاصيل والتواريخ ومعلومات العميل" : "Create a new case with key details, dates, and client information."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("cases.caseDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CaseForm onSuccess={() => router.push("/cases")} />
        </CardContent>
      </Card>
    </div>
  );
}



