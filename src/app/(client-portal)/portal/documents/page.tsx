"use client";

import { useCases } from "@/lib/hooks/use-cases";
import { useDocuments } from "@/lib/hooks/use-documents";
import { useI18n } from "@/lib/hooks/use-i18n";

export default function ClientPortalDocumentsPage() {
  const { t } = useI18n();
  const { data: cases = [] } = useCases();
  const firstCaseId = cases[0]?.id || 0;
  const { data: docs = [], isLoading } = useDocuments(firstCaseId);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-[#0F2942]">{t("portal.documents")}</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        {isLoading ? (
          <p className="text-slate-500">{t("common.loading")}</p>
        ) : docs.length ? (
          <ul className="space-y-2">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{doc.fileName}</span>
                <span className="text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400">{t("portal.noDocuments")}</p>
        )}
      </div>
    </section>
  );
}
