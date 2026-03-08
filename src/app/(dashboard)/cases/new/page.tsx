/**
 * File: src/app/(dashboard)/cases/new/page.tsx
 * Purpose: New case creation page — uses the multi-step CaseWizard.
 */

"use client";

import { CaseWizard } from "@/components/features/cases/CaseWizard";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Sparkles } from "lucide-react";

export default function NewCasePage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-[#0F2942] p-2 rounded-lg text-white">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F2942]">
          {t("cases.wizard.createNewCase")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("cases.wizard.createNewCaseDesc")}
        </p>
      </div>

      <CaseWizard mode="create" />
    </div>
  );
}
