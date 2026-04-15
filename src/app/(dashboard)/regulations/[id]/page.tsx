"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  Columns2,
  Download,
  ExternalLink,
  FileJson2,
  FileText,
  Gavel,
  GitCompare,
  Info,
  Loader2,
  MoreVertical,
  Scale,
  CalendarDays,
  Building2,
  Sparkles,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseIconButton,
} from "@/components/ui/dialog";
import {
  useRegulationAmendmentImpact,
  useCompareRegulationVersions,
  useRefreshRegulationAmendmentImpact,
  useRefreshRegulationInsights,
  useRegulation,
  useRegulationInsights,
  useRegulationVersions,
} from "@/lib/hooks/use-regulations";
import { useI18n } from "@/lib/hooks/use-i18n";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/use-toast";
import {
  LegalTextReader,
  type HighlightRange,
} from "@/components/features/legal-text/legal-text-reader";
import {
  findSegmentById,
  stripInlineDecorations,
} from "@/lib/utils/text-segmentation";

interface RegulationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function toDisplayValue(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "-";
}

function getFirstValue(metadata: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }
  return "-";
}

function normalizeDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
}

/* ── Status color helper ── */
const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  amended: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  in_progress: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  repealed: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  draft: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status.toLowerCase()] || STATUS_STYLES.draft;
}

export default function RegulationDetailPage({ params }: RegulationDetailPageProps) {
  const resolvedParams = React.use(params);
  const regulationId = Number(resolvedParams.id);
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const { toast } = useToast();

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
    // Left = older (from), Right = newer (to) — so additions are green, deletions are red
    setLeftVersion(sorted[1]?.versionNumber || sorted[0]?.versionNumber);
    setRightVersion(sorted[0]?.versionNumber);
  }, [versions, leftVersion, rightVersion]);

  const {
    data: comparison,
    isLoading: isLoadingCompare,
  } = useCompareRegulationVersions(regulationId, leftVersion, rightVersion);
  const { data: insights } = useRegulationInsights(regulationId);
  const refreshInsights = useRefreshRegulationInsights(regulationId);
  const { data: amendmentImpact } = useRegulationAmendmentImpact(
    regulationId,
    leftVersion,
    rightVersion
  );
  const refreshAmendmentImpact = useRefreshRegulationAmendmentImpact(regulationId);

  // Deep-link to a specific article via URL hash (e.g. #article-5). Must be
  // declared BEFORE any early returns so hook order stays stable.
  const [highlightRange, setHighlightRange] =
    React.useState<HighlightRange | null>(null);
  const hashLatestContent = React.useMemo(() => {
    if (!regulation) return "";
    const sorted = [...(versions || [])].sort(
      (a, b) => b.versionNumber - a.versionNumber
    );
    const latest = sorted[0];
    const meta = (regulation.sourceMetadata ||
      latest?.sourceMetadata ||
      {}) as Record<string, unknown>;
    const metaSummary =
      typeof meta.summary === "string" ? meta.summary.trim() : "";
    return (
      latest?.contentText ||
      regulation.latestContent ||
      regulation.summary ||
      metaSummary ||
      ""
    );
  }, [regulation, versions]);
  React.useEffect(() => {
    if (typeof window === "undefined" || !hashLatestContent) return;
    const apply = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      const seg = findSegmentById(hashLatestContent, hash, {
        locale: "ar",
        kind: "regulation",
      });
      if (seg) {
        setHighlightRange({
          start: seg.offset,
          end: seg.offset + 1,
          nonce: Date.now(),
        });
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [hashLatestContent]);

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

  const sortedVersions = [...(versions || [])].sort((a, b) => b.versionNumber - a.versionNumber);
  const latestVersion = sortedVersions[0];
  const metadata = (regulation.sourceMetadata || latestVersion?.sourceMetadata || {}) as Record<
    string,
    unknown
  >;
  const hardCopy =
    metadata.hardCopy && typeof metadata.hardCopy === "object"
      ? (metadata.hardCopy as Record<string, unknown>)
      : undefined;
  const rawHardCopyUrl =
    typeof hardCopy?.downloadUrl === "string" ? hardCopy.downloadUrl.trim() : "";
  const hardCopyUrl = !rawHardCopyUrl
    ? ""
    : /^https?:\/\//i.test(rawHardCopyUrl)
      ? rawHardCopyUrl
      : /^(\/)?(apis|selfservices)\/legislations\/v1\//i.test(rawHardCopyUrl)
        ? `https://laws-gateway.moj.gov.sa/${rawHardCopyUrl.replace(/^\/+/, "")}`
        : rawHardCopyUrl;
  const metadataSummary =
    typeof metadata.summary === "string" ? metadata.summary.trim() : "";
  const latestContent =
    latestVersion?.contentText ||
    regulation.latestContent ||
    regulation.summary ||
    metadataSummary ||
    "";

  // Surfaced metadata
  const legalStatusName = getFirstValue(metadata, ["legalStatueName", "legalStatusName"]);
  const legalTypeName = getFirstValue(metadata, ["legalTypeName", "legalType"]);
  const issuanceDate = normalizeDate(metadata.issuanceDateG || metadata.issueDateG);
  const validFromDate = normalizeDate(metadata.gregorianValidFromDate || metadata.activationDateG);
  const statusStyle = getStatusStyle(regulation.status);
  const insightsStatus = insights?.status || "not_generated";
  const amendmentImpactStatus = amendmentImpact?.status || "not_generated";
  const canTriggerAmendmentImpact =
    Number.isInteger(leftVersion) &&
    Number.isInteger(rightVersion) &&
    leftVersion !== rightVersion;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Header: Back + Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/regulations")}
          className="gap-2 rounded-xl border-slate-200 hover:border-[#D97706]/40 hover:bg-amber-50/50 transition-all"
        >
          <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
          {t("regulations.backToRegulations")}
        </Button>
        <div className="flex items-center gap-3">
          {/* Download Hard Copy if available */}
          {hardCopyUrl && (
            <a
              href={hardCopyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#0F2942] hover:border-[#D97706]/40 hover:bg-amber-50/50 transition-all shadow-sm"
            >
              <Download className="h-4 w-4 text-[#D97706]" />
              {t("regulations.metadata.openDocument") || "Download"}
            </a>
          )}

          {/* More Details Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 w-10 p-0 shrink-0 rounded-xl border-slate-200 hover:border-[#D97706]/40 hover:bg-amber-50/50 transition-all"
                title={t("common.more") || "More Details"}
              >
                <MoreVertical className="h-4 w-4 text-slate-500" />
              </Button>
            </DialogTrigger>
            <DialogContent size="xl">
              <DialogHeader icon={<Info className="h-5 w-5" />}>
                <DialogTitle>{t("regulations.metadata.title") || "More Details"}</DialogTitle>
              </DialogHeader>
              <DialogCloseIconButton />
              <DialogBody className="bg-slate-50/80">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Identification */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F2942]">
                      <Scale className="h-4 w-4 text-[#D97706]" />
                      {t("regulations.metadata.identification")}
                    </h3>
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.serial")}</dt>
                        <dd className="font-medium text-slate-800 text-end">
                          {toDisplayValue(regulation.sourceSerial || regulation.regulationNumber)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.statuteId")}</dt>
                        <dd className="font-medium text-slate-800 text-end">{getFirstValue(metadata, ["statuteId"])}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.regulationName")}</dt>
                        <dd className="font-medium text-slate-800 text-end">{getFirstValue(metadata, ["statuteName"])}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Legal Status */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F2942]">
                      <Gavel className="h-4 w-4 text-[#D97706]" />
                      {t("regulations.metadata.legalStatus")}
                    </h3>
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.statusName")}</dt>
                        <dd className="font-medium text-slate-800 text-end">{legalStatusName}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.legalType")}</dt>
                        <dd className="font-medium text-slate-800 text-end">{legalTypeName}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.sourceProvider")}</dt>
                        <dd className="font-medium text-slate-800 text-end">{toDisplayValue(regulation.sourceProvider)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Important Dates */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F2942]">
                      <CalendarDays className="h-4 w-4 text-[#D97706]" />
                      {t("regulations.metadata.importantDates")}
                    </h3>
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.issuanceDate")}</dt>
                        <dd className="font-medium text-slate-800 text-end">{issuanceDate}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.publishDate")}</dt>
                        <dd className="font-medium text-slate-800 text-end">{normalizeDate(metadata.publishDateG)}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.validFromDate")}</dt>
                        <dd className="font-medium text-slate-800 text-end">{validFromDate}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Source Document */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F2942]">
                      <FileText className="h-4 w-4 text-[#D97706]" />
                      {t("regulations.metadata.sourceDocument")}
                    </h3>
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.documentName")}</dt>
                        <dd className="font-medium text-slate-800 text-end">{toDisplayValue(hardCopy?.documentName)}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.documentType")}</dt>
                        <dd className="font-medium text-slate-800 text-end">
                          {toDisplayValue(hardCopy?.documentType || hardCopy?.extention)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500 shrink-0">{t("regulations.metadata.documentUrl")}</dt>
                        <dd className="text-end">
                          {hardCopyUrl ? (
                            <a
                              href={hardCopyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-[#D97706] hover:text-[#B45309] underline decoration-[#D97706]/30 hover:decoration-[#D97706] transition-colors"
                            >
                              {t("regulations.metadata.openDocument")}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <span className="text-slate-800">-</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* System Metadata */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F2942]">
                    <Building2 className="h-4 w-4 text-[#D97706]" />
                    {t("regulations.metadata.systemMetadata")}
                  </h3>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-500 shrink-0">{t("regulations.metadata.listingUrl")}</dt>
                      <dd className="max-w-[70%] break-all font-medium text-slate-800 text-end">
                        {toDisplayValue(regulation.sourceListingUrl)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-500 shrink-0">{t("regulations.metadata.metadataHash")}</dt>
                      <dd className="max-w-[70%] break-all font-medium text-slate-800 text-end">
                        {toDisplayValue(regulation.sourceMetadataHash)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Raw JSON */}
                <details className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[#0F2942]">
                    <FileJson2 className="h-4 w-4 text-[#D97706]" />
                    {t("regulations.metadata.rawJson")}
                  </summary>
                  <pre className="mt-3 max-h-[40vh] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-xs text-slate-600 font-mono border border-slate-100">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </details>
              </DialogBody>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Regulation Header Card with Surfaced Metadata */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Title Section */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl font-bold text-[#0F2942] leading-tight">{regulation.title}</h1>
            {/* Status Badge — prominent */}
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0",
              statusStyle.bg, statusStyle.text
            )}>
              <span className={cn("h-2 w-2 rounded-full", statusStyle.dot)} />
              {regulation.status}
            </span>
          </div>

          {/* Regulation Number */}
          {regulation.regulationNumber && (
            <span className="inline-flex items-center gap-1.5 text-sm font-mono text-slate-500 mb-3">
              #{regulation.regulationNumber}
            </span>
          )}
        </div>

        {/* Surfaced Metadata Flags — visible without opening dialog */}
        <div className="px-6 pb-5 flex flex-wrap gap-3">
          {/* Legal Type */}
          {legalTypeName !== "-" && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-100">
              <Gavel className="h-3.5 w-3.5" />
              {legalTypeName}
            </span>
          )}
          {/* Legal Status Name */}
          {legalStatusName !== "-" && (
            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-purple-100">
              <Scale className="h-3.5 w-3.5" />
              {legalStatusName}
            </span>
          )}
          {/* Category */}
          {regulation.category && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200">
              {regulation.category}
            </span>
          )}
          {/* Source Provider */}
          {regulation.sourceProvider && (
            <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-sky-100">
              <Building2 className="h-3.5 w-3.5" />
              {regulation.sourceProvider}
            </span>
          )}
          {/* Issuance Date */}
          {issuanceDate !== "-" && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-100">
              <CalendarDays className="h-3.5 w-3.5" />
              {issuanceDate}
            </span>
          )}
          {/* Versions count */}
          {versions && versions.length > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-[#0F2942]/5 text-[#0F2942] px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#0F2942]/10">
              <Clock3 className="h-3.5 w-3.5" />
              {versions.length} {t("regulations.versions")}
            </span>
          )}
        </div>
      </div>

      {/* Main Tabs Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-6 border-b pb-0 w-full justify-start overflow-x-auto">
            <TabsTrigger value="content" className="flex items-center gap-2 px-5">
              <FileText className="h-4 w-4" />
              {t("regulations.fullContent") || "Content"}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 px-5">
              <Sparkles className="h-4 w-4" />
              {t("regulations.ai.title") || "AI Analysis"}
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2 px-5">
              <Clock3 className="h-4 w-4" />
              {t("regulations.versions") || "Versions"}
              {versions && versions.length > 0 && (
                <span className="ml-1.5 rounded-full bg-[#0F2942] text-white px-2 py-0.5 text-[10px] font-bold">
                  {versions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2 px-5">
              <GitCompare className="h-4 w-4" />
              {t("regulations.compareVersions") || "Compare"}
            </TabsTrigger>
          </TabsList>

          {/* ──── Tab: Content ──── */}
          <TabsContent value="content" className="mt-0 focus-visible:outline-none focus:outline-none">
            {latestContent ? (
              <LegalTextReader
                title={t("regulations.fullContent") || t("regulations.content") || "Content"}
                text={latestContent}
                kind="regulation"
                highlightRange={highlightRange}
                emptyLabel={t("regulations.noContentAvailable")}
              />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-300">
                <p className="text-sm text-slate-400">{t("regulations.noContentAvailable")}</p>
              </div>
            )}
          </TabsContent>

          {/* ──── Tab: AI Insights ──── */}
          <TabsContent value="insights" className="mt-0 focus-visible:outline-none focus:outline-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-600">
                  {t("regulations.ai.arabicOnly") || "Generated content appears in Arabic only."}
                </p>
                <Button
                  onClick={() =>
                    refreshInsights.mutate(
                      { force: true },
                      {
                        onSuccess: () => {
                          toast({
                            title: t("common.success"),
                            description:
                              t("regulations.ai.refreshQueued") ||
                              "AI analysis has been queued.",
                          });
                        },
                        onError: (error) => {
                          toast({
                            title: t("common.error"),
                            description:
                              error instanceof Error
                                ? error.message
                                : t("regulations.syncFailed"),
                            variant: "destructive",
                          });
                        },
                      }
                    )
                  }
                  disabled={refreshInsights.isPending}
                  className="gap-2"
                >
                  {refreshInsights.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {insightsStatus === "not_generated"
                    ? t("regulations.ai.generate") || "Generate AI Analysis"
                    : t("regulations.ai.regenerate") || "Regenerate"}
                </Button>
              </div>

              {(insightsStatus === "pending" || insightsStatus === "processing") && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">
                    {t("regulations.ai.processing") ||
                      "AI analysis is being prepared. Please wait..."}
                  </p>
                </div>
              )}

              {insightsStatus === "failed" && (
                <div className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-rose-700">
                    {t("regulations.ai.failed") || "AI analysis failed"}
                  </p>
                  {insights?.errorCode && (
                    <p className="text-xs text-rose-600">{insights.errorCode}</p>
                  )}
                </div>
              )}

              {insightsStatus === "ready" && insights && (
                <div className="space-y-4">
                  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-2 text-sm font-bold text-[#0F2942]">
                      {t("regulations.ai.executiveSummary") || "Executive Summary"}
                    </h3>
                    <p
                      className={cn(
                        "text-[15px] leading-[1.9] text-slate-800",
                        isRTL && "font-arabic-reader"
                      )}
                    >
                      {insights.summary
                        ? stripInlineDecorations(insights.summary)
                        : t("common.notAvailable")}
                    </p>
                  </article>

                  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold text-[#0F2942]">
                      {t("regulations.ai.obligations") || "Compliance Obligations"}
                    </h3>
                    <div className="space-y-2">
                      {(insights.obligations || []).map((item, index) => (
                        <div key={`obl-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p
                            className={cn(
                              "text-[13px] font-bold text-[#0F2942]",
                              isRTL && "font-arabic-reader"
                            )}
                          >
                            {stripInlineDecorations(item.title || "")}
                          </p>
                          <p
                            className={cn(
                              "mt-1.5 text-[14px] leading-[1.85] text-slate-700",
                              isRTL && "font-arabic-reader"
                            )}
                          >
                            {stripInlineDecorations(item.description || "")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-800">
                      <AlertTriangle className="h-4 w-4" />
                      {t("regulations.ai.riskFlags") || "Risk Flags"}
                    </h3>
                    <div className="space-y-2">
                      {(insights.riskFlags || []).map((item, index) => (
                        <div key={`risk-${index}`} className="rounded-lg border border-amber-200 bg-white p-3">
                          <p
                            className={cn(
                              "text-[13px] font-bold text-amber-900",
                              isRTL && "font-arabic-reader"
                            )}
                          >
                            {stripInlineDecorations(item.title || "")}
                          </p>
                          <p
                            className={cn(
                              "mt-1.5 text-[14px] leading-[1.85] text-amber-800",
                              isRTL && "font-arabic-reader"
                            )}
                          >
                            {stripInlineDecorations(item.description || "")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold text-[#0F2942]">
                      {t("regulations.ai.keyDates") || "Key Dates"}
                    </h3>
                    <div className="space-y-2">
                      {(insights.keyDates || []).map((item, index) => (
                        <div
                          key={`date-${index}`}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <span className="text-xs text-slate-600">
                            {stripInlineDecorations(item.label || "")}
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            {stripInlineDecorations(item.value || "")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold text-[#0F2942]">
                      {t("regulations.ai.evidenceSnippets") || "Evidence Snippets"}
                    </h3>
                    <div className="space-y-2">
                      {(insights.citations || []).map((item, index) => (
                        <blockquote
                          key={`cite-${index}`}
                          className={cn(
                            "rounded-lg border-l-4 border-[#D97706] bg-slate-50 px-4 py-3 text-[14px] leading-[1.9] text-slate-700",
                            isRTL && "font-arabic-reader"
                          )}
                        >
                          {stripInlineDecorations(item.snippet || "")}
                        </blockquote>
                      ))}
                    </div>
                  </article>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ──── Tab: Versions ──── */}
          <TabsContent value="versions" className="mt-0 focus-visible:outline-none focus:outline-none">
            {!versions || versions.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-300">
                <p className="text-sm text-slate-400">{t("regulations.noRegulationsDesc")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedVersions.map((version, idx) => (
                  <article
                    key={version.id}
                    className={cn(
                      "rounded-xl border p-5 transition-all hover:shadow-md",
                      idx === 0
                        ? "border-[#D97706]/30 bg-amber-50/30 shadow-sm"
                        : "border-slate-200 bg-slate-50/50"
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "px-3 py-1 font-bold",
                          idx === 0
                            ? "bg-[#D97706] text-white hover:bg-[#B45309]"
                            : "bg-[#0F2942] text-white hover:bg-[#1e4162]"
                        )}>
                          v{version.versionNumber}
                        </Badge>
                        {idx === 0 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-100">
                        <CalendarClock className="h-3.5 w-3.5 text-[#D97706]" />
                        {version.createdAt ? new Date(version.createdAt).toLocaleString() : "-"}
                      </span>
                    </div>
                    {version.changesSummary && (
                      <div className="mb-3 rounded-lg bg-white p-3 border border-slate-100">
                        <strong className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                          Changes Summary
                        </strong>
                        <p className="text-sm text-slate-700">{version.changesSummary}</p>
                      </div>
                    )}
                    <div className="relative">
                      <p
                        className={cn(
                          "line-clamp-4 whitespace-pre-wrap text-[15px] leading-[1.9] text-slate-700",
                          isRTL && "font-arabic-reader"
                        )}
                      >
                        {stripInlineDecorations(version.contentText || "")}
                      </p>
                      {version.contentText && version.contentText.length > 200 && (
                        <div className={cn(
                          "absolute bottom-0 left-0 w-full h-10 pointer-events-none",
                          idx === 0
                            ? "bg-gradient-to-t from-amber-50/80 to-transparent"
                            : "bg-gradient-to-t from-slate-50/80 to-transparent"
                        )} />
                      )}
                    </div>
                    {version.contentText && version.contentText.trim().length > 200 && (
                      <details className="mt-3 group/details">
                        <summary className="cursor-pointer text-xs font-semibold text-[#D97706] hover:text-[#b45309] list-none inline-flex items-center gap-1">
                          <span className="group-open/details:hidden">
                            {t("reader.showMore") || "Show full text"}
                          </span>
                          <span className="hidden group-open/details:inline">
                            {t("reader.showLess") || "Show less"}
                          </span>
                        </summary>
                        <div className="mt-3">
                          <LegalTextReader
                            title={`v${version.versionNumber}`}
                            text={version.contentText}
                            kind="regulation"
                          />
                        </div>
                      </details>
                    )}
                  </article>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ──── Tab: Compare ──── */}
          <TabsContent value="compare" className="mt-0 focus-visible:outline-none focus:outline-none">
            {!versions || versions.length < 2 ? (
              <div className="flex h-32 items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-300">
                <p className="text-sm text-slate-400">{t("regulations.needTwoVersions")}</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Version Selectors */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* In RTL, grid columns are visually reversed, so swap the labels */}
                  <label className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      {isRTL ? t("regulations.rightVersion") : t("regulations.leftVersion")} ({isRTL ? t("regulations.newer") || "Newer" : t("regulations.older") || "Older"})
                    </span>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 focus:outline-none transition-all"
                      value={isRTL ? rightVersion : leftVersion}
                      onChange={(event) => isRTL ? setRightVersion(Number(event.target.value)) : setLeftVersion(Number(event.target.value))}
                    >
                      {sortedVersions.map((version) => (
                        <option key={`sel1-${version.id}`} value={version.versionNumber}>
                          v{version.versionNumber} — {version.createdAt ? new Date(version.createdAt).toLocaleDateString() : "N/A"}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                      {isRTL ? t("regulations.leftVersion") : t("regulations.rightVersion")} ({isRTL ? t("regulations.older") || "Older" : t("regulations.newer") || "Newer"})
                    </span>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 focus:outline-none transition-all"
                      value={isRTL ? leftVersion : rightVersion}
                      onChange={(event) => isRTL ? setLeftVersion(Number(event.target.value)) : setRightVersion(Number(event.target.value))}
                    >
                      {sortedVersions.map((version) => (
                        <option key={`sel2-${version.id}`} value={version.versionNumber}>
                          v{version.versionNumber} — {version.createdAt ? new Date(version.createdAt).toLocaleDateString() : "N/A"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Diff Summary Badge */}
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-sm font-medium">
                    <Columns2 className="h-4 w-4 text-[#D97706]" />
                    <span className="text-emerald-600 font-bold">+{comparison?.summary.addedLines || 0}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-rose-600 font-bold">-{comparison?.summary.deletedLines || 0}</span>
                    <span className="text-slate-500">lines changed</span>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-[#0F2942]">
                      {t("regulations.ai.amendmentImpact") || "Amendment Impact Analyzer"}
                    </h3>
                    <Button
                      onClick={() => {
                        if (!canTriggerAmendmentImpact) {
                          return;
                        }
                        refreshAmendmentImpact.mutate(
                          {
                            fromVersion: Number(leftVersion),
                            toVersion: Number(rightVersion),
                            force: true,
                          },
                          {
                            onSuccess: () => {
                              toast({
                                title: t("common.success"),
                                description:
                                  t("regulations.ai.impactQueued") ||
                                  "Amendment impact analysis has been queued.",
                              });
                            },
                            onError: (error) => {
                              toast({
                                title: t("common.error"),
                                description:
                                  error instanceof Error
                                    ? error.message
                                    : t("regulations.syncFailed"),
                                variant: "destructive",
                              });
                            },
                          }
                        );
                      }}
                      disabled={!canTriggerAmendmentImpact || refreshAmendmentImpact.isPending}
                      className="gap-2"
                    >
                      {refreshAmendmentImpact.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {amendmentImpactStatus === "not_generated"
                        ? t("regulations.ai.generateImpact") || "Generate Impact"
                        : t("regulations.ai.regenerate") || "Regenerate"}
                    </Button>
                  </div>

                  {(amendmentImpactStatus === "pending" ||
                    amendmentImpactStatus === "processing") && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("regulations.ai.processingImpact") ||
                        "Amendment impact analysis is in progress..."}
                    </div>
                  )}

                  {amendmentImpactStatus === "failed" && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {t("regulations.ai.failedImpact") ||
                        "Unable to generate amendment impact analysis."}
                    </div>
                  )}

                  {amendmentImpactStatus === "ready" && amendmentImpact && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                          {t("regulations.ai.whatChanged") || "What Changed"}
                        </h4>
                        <div className="space-y-2">
                          {amendmentImpact.whatChanged.map((item, index) => (
                            <p
                              key={`changed-${index}`}
                              className={cn(
                                "text-[14px] leading-[1.9] text-slate-700",
                                isRTL && "font-arabic-reader"
                              )}
                            >
                              {stripInlineDecorations(item.description || "")}
                            </p>
                          ))}
                        </div>
                      </article>

                      <article className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                          {t("regulations.ai.legalImpact") || "Legal Impact"}
                        </h4>
                        <div className="space-y-2">
                          {amendmentImpact.legalImpact.map((item, index) => (
                            <p
                              key={`impact-${index}`}
                              className={cn(
                                "text-[14px] leading-[1.9] text-amber-800",
                                isRTL && "font-arabic-reader"
                              )}
                            >
                              {stripInlineDecorations(item.description || "")}
                            </p>
                          ))}
                        </div>
                      </article>

                      <article className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <h4 className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                          <Users className="h-3.5 w-3.5" />
                          {t("regulations.ai.affectedParties") || "Who Is Affected"}
                        </h4>
                        <div className="space-y-2">
                          {amendmentImpact.affectedParties.map((item, index) => (
                            <p
                              key={`party-${index}`}
                              className={cn(
                                "text-[14px] leading-[1.9] text-blue-800",
                                isRTL && "font-arabic-reader"
                              )}
                            >
                              {stripInlineDecorations(item.description || "")}
                            </p>
                          ))}
                        </div>
                      </article>
                    </div>
                  )}

                  {amendmentImpactStatus === "ready" &&
                    amendmentImpact &&
                    amendmentImpact.citations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {t("regulations.ai.evidenceSnippets") || "Evidence Snippets"}
                        </h4>
                        {amendmentImpact.citations.map((item, index) => (
                          <blockquote
                            key={`impact-cite-${index}`}
                            className={cn(
                              "rounded-md border-l-4 border-[#D97706] bg-slate-50 px-4 py-3 text-[14px] leading-[1.9] text-slate-700",
                              isRTL && "font-arabic-reader"
                            )}
                          >
                            {stripInlineDecorations(item.snippet || "")}
                          </blockquote>
                        ))}
                      </div>
                    )}
                </div>

                {/* Diff Blocks */}
                {isLoadingCompare ? (
                  <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                    <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 overflow-hidden max-h-[55vh] overflow-y-auto">
                    {(comparison?.diffBlocks || []).length === 0 ? (
                      <p className="text-center text-slate-400 py-12 text-sm">
                        No differences found between these versions.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-200">
                        {(comparison?.diffBlocks || []).map((block, index) => {
                          // In RTL mode, swap columns so the visual order matches left=old, right=new
                          const firstSegment = isRTL ? block.rightSegment : block.leftSegment;
                          const secondSegment = isRTL ? block.leftSegment : block.rightSegment;
                          // In RTL: first column (visually right) = newer, second column (visually left) = older
                          // So swap the color meanings for RTL
                          const diffBase = cn(
                            "min-h-[3rem] whitespace-pre-wrap p-4 text-[14px] leading-[1.9]",
                            isRTL && "font-arabic-reader"
                          );
                          const firstStyle = cn(
                            diffBase,
                            isRTL ? "border-l border-slate-200" : "border-r border-slate-200",
                            isRTL
                              ? (block.type === "insert" ? "bg-emerald-50 text-emerald-900" :
                                block.type === "equal" ? "bg-white text-slate-500" :
                                  block.type === "delete" ? "bg-slate-50 text-slate-300" : "bg-white")
                              : (block.type === "delete" ? "bg-rose-50 text-rose-900" :
                                block.type === "equal" ? "bg-white text-slate-500" :
                                  block.type === "insert" ? "bg-slate-50 text-slate-300" : "bg-white")
                          );
                          const secondStyle = cn(
                            diffBase,
                            isRTL
                              ? (block.type === "delete" ? "bg-rose-50 text-rose-900" :
                                block.type === "equal" ? "bg-white text-slate-500" :
                                  block.type === "insert" ? "bg-slate-50 text-slate-300" : "bg-white")
                              : (block.type === "insert" ? "bg-emerald-50 text-emerald-900" :
                                block.type === "equal" ? "bg-white text-slate-500" :
                                  block.type === "delete" ? "bg-slate-50 text-slate-300" : "bg-white")
                          );
                          const cleanFirst = stripInlineDecorations(firstSegment || "");
                          const cleanSecond = stripInlineDecorations(secondSegment || "");
                          return (
                            <div
                              key={`${block.type}-${index}`}
                              className="grid grid-cols-1 md:grid-cols-2"
                            >
                              <div className={firstStyle}>
                                {cleanFirst || " "}
                              </div>
                              <div className={secondStyle}>
                                {cleanSecond || " "}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
