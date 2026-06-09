"use client";

import { useParams, useRouter } from "next/navigation";
import { Edit2, Loader2, User } from "lucide-react";
import { ClientForm } from "@/components/features/clients/client-form";
import { EmptyState } from "@/components/ui/empty-state";
import { useClient } from "@/lib/hooks/use-clients";
import { useI18n } from "@/lib/hooks/use-i18n";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const clientId = Number(params.id);
  const { t } = useI18n();
  const { data: client, isLoading, error } = useClient(clientId);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
          <p className="text-sm text-slate-500">{t("clients.loadingDetails")}</p>
        </div>
      </div>
    );
  }

  if (error || !client || !Number.isFinite(clientId)) {
    return (
      <EmptyState
        icon={User}
        title={t("clients.clientNotFound")}
        description={t("clients.clientNotFoundDesc")}
        variant="notFound"
        action={{
          label: t("clients.backToClients"),
          onClick: () => router.push("/clients"),
        }}
      />
    );
  }

  return (
    <div className="space-y-6 py-2 animate-in fade-in duration-500">
      <div className="text-center max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-[#0F2942] p-2 rounded-lg text-white">
            <Edit2 className="h-5 w-5" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F2942]">
          {t("clients.form.editClient")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{client.name}</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <ClientForm
          mode="edit"
          clientId={client.id}
          initialData={{
            name: client.name,
            type: client.type,
            email: client.email || client.contactEmail || "",
            phone: client.phone || client.contactPhone || "",
            address: client.address || "",
            notes: client.notes || "",
          }}
        />
      </div>
    </div>
  );
}
