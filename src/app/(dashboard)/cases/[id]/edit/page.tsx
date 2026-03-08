/**
 * File: src/app/(dashboard)/cases/[id]/edit/page.tsx
 * Purpose: Case edit page — loads the existing case and pre-fills the CaseWizard.
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Edit2, ChevronRight } from "lucide-react";
import { CaseWizard } from "@/components/features/cases/CaseWizard";
import { useCase } from "@/lib/hooks/use-cases";
import { useI18n } from "@/lib/hooks/use-i18n";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

interface EditCasePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function EditCasePage({ params }: EditCasePageProps) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const caseId = Number(resolvedParams.id);
    const { t } = useI18n();

    const { data: case_, isLoading } = useCase(caseId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
            </div>
        );
    }

    if (!case_) {
        return (
            <EmptyState
                icon={FileText}
                title={t("cases.caseNotFound")}
                variant="notFound"
                action={{
                    label: t("cases.backToCases"),
                    onClick: () => router.push("/cases"),
                }}
            />
        );
    }

    return (
        <div className="space-y-6 py-2">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto">
                {/* Back link */}
                <button
                    onClick={() => router.push(`/cases/${caseId}`)}
                    className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-[#0F2942] mb-4 group transition-colors"
                >
                    <div className="bg-slate-100 p-1 rounded-md mr-1.5 group-hover:bg-[#0F2942] group-hover:text-white transition-colors">
                        <ChevronRight className="rotate-180 h-3 w-3" />
                    </div>
                    {t("cases.wizard.backToCase")}
                </button>

                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="bg-[#0F2942] p-2 rounded-lg text-white">
                        <Edit2 className="h-5 w-5" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#0F2942]">
                    {t("cases.wizard.editCase")}
                </h1>
                <p className="text-sm text-slate-500 mt-1 truncate">
                    {case_.title} • #{case_.case_number}
                </p>
            </div>

            <CaseWizard mode="edit" existingCase={case_} />
        </div>
    );
}
