"use client";

import { useCases } from "@/lib/hooks/use-cases";
import { useI18n } from "@/lib/hooks/use-i18n";

export default function ClientPortalOverviewPage() {
  const { t } = useI18n();
  const { data: cases = [], isLoading } = useCases();

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-[#0F2942]">{t("portal.overview")}</h2>
      {isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{t("portal.activeCases")}</p>
            <p className="mt-1 text-3xl font-bold text-[#0F2942]">{cases.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2">
            <p className="text-sm text-slate-500">{t("portal.nextHearings")}</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {cases.slice(0, 5).map((c) => (
                <li key={c.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  {c.title} {c.next_hearing ? `- ${new Date(c.next_hearing).toLocaleDateString()}` : `- ${t("portal.tbd")}`}
                </li>
              ))}
              {cases.length === 0 && <li className="text-slate-400">{t("portal.noCases")}</li>}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
