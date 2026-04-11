"use client";

import { useI18n } from "@/lib/hooks/use-i18n";
import { UserPlus } from "lucide-react";
import { ClientForm } from "@/components/features/clients/client-form";

export default function NewClientPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 py-2 animate-in fade-in duration-500">
      <div className="text-center max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-[#0F2942] p-2 rounded-lg text-white">
            <UserPlus className="h-5 w-5" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F2942]">
          {t("clients.form.addClient")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("clients.form.addClientDesc")}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <ClientForm />
      </div>
    </div>
  );
}
