"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useRegulation, useRegulationVersions } from "@/lib/hooks/use-regulations";
import { useI18n } from "@/lib/hooks/use-i18n";

interface RegulationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RegulationDetailPage({ params }: RegulationDetailPageProps) {
  const resolvedParams = React.use(params);
  const regulationId = Number(resolvedParams.id);
  const router = useRouter();
  const { t } = useI18n();

  const { data: regulation, isLoading: isLoadingRegulation } = useRegulation(regulationId);
  const { data: versions, isLoading: isLoadingVersions } = useRegulationVersions(regulationId);

  if (isLoadingRegulation || isLoadingVersions) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        {t("common.loading")}
      </div>
    );
  }

  if (!regulation) {
    return (
      <EmptyState
        title={t("regulations.noRegulations")}
        description={t("regulations.noRegulationsDesc")}
        action={{
          label: t("regulations.backToRegulations"),
          onClick: () => router.push("/regulations"),
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/regulations")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("regulations.backToRegulations")}
        </Button>
        <Badge variant="outline">{regulation.status}</Badge>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F2942]">{regulation.title}</h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
          {regulation.regulationNumber && (
            <span>#{regulation.regulationNumber}</span>
          )}
          {regulation.category && <span>{regulation.category}</span>}
          {regulation.jurisdiction && <span>{regulation.jurisdiction}</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-[#D97706]" />
          <h2 className="text-lg font-semibold text-[#0F2942]">
            {t("regulations.versions")}
          </h2>
        </div>

        {!versions || versions.length === 0 ? (
          <p className="text-sm text-slate-500">{t("regulations.noRegulationsDesc")}</p>
        ) : (
          <div className="space-y-4">
            {versions.map((version) => (
              <article
                key={version.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Badge className="bg-[#0F2942] text-white hover:bg-[#0F2942]">
                    v{version.versionNumber}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {version.createdAt
                      ? new Date(version.createdAt).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <p className="line-clamp-6 whitespace-pre-wrap text-sm text-slate-700">
                  {version.contentText}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
