"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  Columns2,
  GitCompare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useCompareRegulationVersions,
  useRegulation,
  useRegulationVersions,
} from "@/lib/hooks/use-regulations";
import { useI18n } from "@/lib/hooks/use-i18n";
import { cn } from "@/lib/utils/cn";

interface RegulationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RegulationDetailPage({ params }: RegulationDetailPageProps) {
  const resolvedParams = React.use(params);
  const regulationId = Number(resolvedParams.id);
  const router = useRouter();
  const { t, isRTL } = useI18n();

  const { data: regulation, isLoading: isLoadingRegulation } = useRegulation(regulationId);
  const { data: versions, isLoading: isLoadingVersions } = useRegulationVersions(regulationId);

  const [leftVersion, setLeftVersion] = React.useState<number | undefined>(undefined);
  const [rightVersion, setRightVersion] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (!versions || versions.length === 0) {
      return;
    }
    if (leftVersion && rightVersion) {
      return;
    }

    const sorted = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
    setLeftVersion(sorted[0]?.versionNumber);
    setRightVersion(sorted[1]?.versionNumber || sorted[0]?.versionNumber);
  }, [versions, leftVersion, rightVersion]);

  const {
    data: comparison,
    isLoading: isLoadingCompare,
  } = useCompareRegulationVersions(regulationId, leftVersion, rightVersion);

  if (isLoadingRegulation || isLoadingVersions) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
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

  const sortedVersions = [...(versions || [])].sort(
    (a, b) => b.versionNumber - a.versionNumber
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/regulations")}
          className="gap-2"
        >
          <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
          {t("regulations.backToRegulations")}
        </Button>
        <Badge variant="outline">{regulation.status}</Badge>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F2942]">{regulation.title}</h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
          {regulation.regulationNumber && <span>#{regulation.regulationNumber}</span>}
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
            {sortedVersions.map((version) => (
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

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-[#D97706]" />
          <h2 className="text-lg font-semibold text-[#0F2942]">
            {t("regulations.compareVersions")}
          </h2>
        </div>

        {!versions || versions.length < 2 ? (
          <p className="text-sm text-slate-500">
            {t("regulations.needTwoVersions")}
          </p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-500">
                  {t("regulations.leftVersion")}
                </span>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={leftVersion}
                  onChange={(event) => setLeftVersion(Number(event.target.value))}
                >
                  {sortedVersions.map((version) => (
                    <option key={`left-${version.id}`} value={version.versionNumber}>
                      v{version.versionNumber}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-500">
                  {t("regulations.rightVersion")}
                </span>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={rightVersion}
                  onChange={(event) => setRightVersion(Number(event.target.value))}
                >
                  {sortedVersions.map((version) => (
                    <option key={`right-${version.id}`} value={version.versionNumber}>
                      v{version.versionNumber}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mb-4 flex items-center gap-3 text-xs text-slate-500">
              <Columns2 className="h-3.5 w-3.5" />
              <span>
                +{comparison?.summary.addedLines || 0} / -
                {comparison?.summary.deletedLines || 0}
              </span>
            </div>

            {isLoadingCompare ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#D97706]" />
              </div>
            ) : (
              <div className="space-y-2">
                {(comparison?.diffBlocks || []).map((block, index) => (
                  <div
                    key={`${block.type}-${index}`}
                    className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-2 md:grid-cols-2"
                  >
                    <pre
                      className={cn(
                        "min-h-10 whitespace-pre-wrap rounded-md p-2 text-xs leading-5",
                        block.type === "delete" && "bg-red-50 text-red-800",
                        block.type === "equal" && "bg-slate-50 text-slate-700",
                        block.type === "insert" && "bg-slate-100 text-slate-500"
                      )}
                    >
                      {block.leftSegment || " "}
                    </pre>
                    <pre
                      className={cn(
                        "min-h-10 whitespace-pre-wrap rounded-md p-2 text-xs leading-5",
                        block.type === "insert" && "bg-green-50 text-green-800",
                        block.type === "equal" && "bg-slate-50 text-slate-700",
                        block.type === "delete" && "bg-slate-100 text-slate-500"
                      )}
                    >
                      {block.rightSegment || " "}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
