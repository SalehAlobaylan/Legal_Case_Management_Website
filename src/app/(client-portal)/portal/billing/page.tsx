"use client";

import { useInvoices } from "@/lib/hooks/use-billing";
import { useI18n } from "@/lib/hooks/use-i18n";

export default function ClientPortalBillingPage() {
  const { t } = useI18n();
  const { data, isLoading } = useInvoices({ limit: 20 });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-[#0F2942]">{t("portal.billing")}</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        {isLoading ? (
          <p className="text-slate-500">{t("common.loading")}</p>
        ) : data?.invoices?.length ? (
          <ul className="space-y-2">
            {data.invoices.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">#{invoice.invoiceNumber}</span>
                <span className="text-slate-500">{invoice.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400">{t("portal.noInvoices")}</p>
        )}
      </div>
    </section>
  );
}
