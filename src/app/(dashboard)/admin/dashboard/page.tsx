"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  BellRing,
  Bot,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Gauge,
  LayoutDashboard,
  Loader2,
  MonitorCog,
  RefreshCw,
  ScrollText,
  Settings2,
  ShieldAlert,
  Users2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MuseumGuard } from "@/components/common/museum-guard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { usePermission } from "@/lib/hooks/use-permission";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  useAdminCommandCenter,
  useUpdateAdminDashboardSettings,
} from "@/lib/hooks/use-admin-command-center";
import { useTeamMembers } from "@/lib/hooks/use-team";
import { useI18n } from "@/lib/hooks/use-i18n";
import { regulationsApi } from "@/lib/api/regulations";
import { formatDate } from "@/lib/utils/format";
import { StatCard } from "@/components/features/admin/stat-card";
import { HearingsCard } from "@/components/features/admin/hearings/hearings-card";
import { TeamGrowthCard } from "@/components/features/admin/team-growth/team-growth-card";
import { AnnouncementsAdminCard } from "@/components/features/admin/announcements/announcements-admin-card";
import { UnassignedCasesCard } from "@/components/features/admin/unassigned/unassigned-cases-card";
import { OrgPulseCard } from "@/components/features/admin/pulse/org-pulse-card";
import { TrendsCard } from "@/components/features/admin/trends/trends-card";
import { AuditLogCard } from "@/components/features/admin/audit-log/audit-log-card";
import { TeamCapacityCard } from "@/components/features/admin/team-capacity/team-capacity-card";
import { TeamMomentumCard } from "@/components/features/admin/team-momentum/team-momentum-card";
import { AIIntelligencePanel } from "@/components/features/admin/ai-intelligence/ai-intelligence-panel";
import type {
  AdminCommandCenterResponse,
  AdminDashboardSettings,
  AdminMonitorSummary,
} from "@/lib/api/admin";

type TabKey =
  | "overview"
  | "operations"
  | "team"
  | "analytics"
  | "ai-intelligence"
  | "audit";

const tabKeys: TabKey[] = [
  "overview",
  "operations",
  "team",
  "analytics",
  "ai-intelligence",
  "audit",
];

export default function AdminDashboardPage() {
  return (
    <React.Suspense fallback={<FullPageLoader />}>
      <AdminDashboardPageInner />
    </React.Suspense>
  );
}

function AdminDashboardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isAdmin } = usePermission();
  const { t, isRTL } = useI18n();

  const tabFromUrl = searchParams?.get("tab") as TabKey | null;
  const initialTab = tabFromUrl && tabKeys.includes(tabFromUrl)
    ? tabFromUrl
    : "overview";
  const [tab, setTab] = React.useState<TabKey>(initialTab);

  React.useEffect(() => {
    if (tabFromUrl && tabKeys.includes(tabFromUrl) && tabFromUrl !== tab) {
      setTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (!isAdmin()) router.replace("/dashboard");
  }, [isAuthenticated, isAdmin, router]);

  const { data, isLoading, error } = useAdminCommandCenter(
    isAuthenticated && isAdmin()
  );
  const { data: teamData, isLoading: teamLoading } = useTeamMembers();

  const onTabChange = (next: string) => {
    const value = next as TabKey;
    setTab(value);
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    sp.set("tab", value);
    router.replace(`/admin/dashboard?${sp.toString()}`, { scroll: false });
  };

  if (!isAuthenticated || !isAdmin()) return <FullPageLoader />;

  return (
    <div data-tour-id="admin-command-center" className="space-y-6">
      <CommandHeader
        t={t}
        isRTL={isRTL}
        data={data}
        loading={isLoading}
      />

      {error ? (
        <Card>
          <CardContent className="p-6 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t("admin.loadFailed")}
          </CardContent>
        </Card>
      ) : isLoading || !data ? (
        <Card>
          <CardContent className="p-12 flex items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" value={tab} onValueChange={onTabChange}>
          <div className="sticky top-0 z-10 bg-[#f9fafb]/95 backdrop-blur supports-[backdrop-filter]:bg-[#f9fafb]/80 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 pt-1">
            <TabsList className="!gap-4 md:!gap-8 overflow-x-auto no-scrollbar">
              <TabsTrigger value="overview">
                <LayoutDashboard className="h-4 w-4" />
                {t("admin.tabOverview")}
              </TabsTrigger>
              <TabsTrigger value="operations">
                <BellRing className="h-4 w-4" />
                {t("admin.tabOperations")}
              </TabsTrigger>
              <TabsTrigger value="team">
                <Users2 className="h-4 w-4" />
                {t("admin.tabTeam")}
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4" />
                {t("admin.tabAnalytics")}
              </TabsTrigger>
              <TabsTrigger value="ai-intelligence">
                <MonitorCog className="h-4 w-4" />
                {t("admin.tabAiIntelligence")}
              </TabsTrigger>
              <TabsTrigger value="audit">
                <ScrollText className="h-4 w-4" />
                {t("admin.tabAudit")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <RiskQueue data={data} />
            <OrgPulseCard dataOverride={data.risk} />
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <HearingsCard hearings={data.hearings} />
            <UnassignedCasesCard
              unassigned={data.unassignedCases}
              teamMembers={teamData?.members ?? []}
              teamLoading={teamLoading}
            />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <TeamCapacityCard
              workload={data.workload}
              highOpenCases={data.settings.workloadHighOpenCases}
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TeamGrowthCard />
              <AnnouncementsAdminCard />
            </div>
            <TeamMomentumCard activity={data.recentActivity} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <TrendsCard settings={data.settings} />
          </TabsContent>

          <TabsContent value="ai-intelligence" data-tour-id="admin-ai-intelligence" className="space-y-6">
            <AIIntelligencePanel enabled={tab === "ai-intelligence"} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <MonitorCard monitor={data.monitor} />
              <SettingsCard settings={data.settings} />
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AuditLogCard expandable />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function CommandHeader({
  t,
  isRTL,
  data,
  loading,
}: {
  t: (key: string) => string;
  isRTL: boolean;
  data?: AdminCommandCenterResponse;
  loading: boolean;
}) {
  const counts = data?.caseCounts;
  const active =
    (counts?.open ?? 0) + (counts?.inProgress ?? 0) + (counts?.pendingHearing ?? 0);
  const aiTone = data?.aiHealth.ready
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
  const monitorTone = data?.monitor.stale || (data?.monitor.failedRuns24h ?? 0) > 0
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F2942] leading-tight">
            {t("admin.commandCenterTitle")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("admin.commandCenterSubtitle")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusChip
              icon={<Bot className="h-3.5 w-3.5" />}
              className={aiTone}
              label={data?.aiHealth.message || t("admin.aiReady")}
            />
            <StatusChip
              icon={<MonitorCog className="h-3.5 w-3.5" />}
              className={monitorTone}
              label={
                data?.monitor.stale
                  ? t("admin.monitorStale")
                  : data?.monitor.health.lastStatus
                    ? `${t("admin.monitorLast")}: ${data.monitor.health.lastStatus}`
                    : t("admin.monitorNoRuns")
              }
            />
          </div>
        </div>
        <Link
          href="/settings"
          className="text-sm font-medium text-orange-600 hover:underline inline-flex items-center gap-1"
        >
          {t("admin.orgSettingsLink")} <span aria-hidden>{isRTL ? "<-" : "->"}</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard
          icon={<Briefcase className="h-5 w-5" />}
          label={t("admin.statTotalCases")}
          value={loading ? 0 : counts?.total ?? 0}
          accent="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label={t("admin.statActiveCases")}
          value={loading ? 0 : active}
          accent="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label={t("admin.statUnassigned")}
          value={loading ? 0 : counts?.unassigned ?? 0}
          accent="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={<CalendarClock className="h-5 w-5" />}
          label={t("admin.statOverdue")}
          value={loading ? 0 : data?.hearings.counts.overdue ?? 0}
          accent="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={<Bot className="h-5 w-5" />}
          label={t("admin.statAiReview")}
          value={loading ? 0 : data?.risk.awaitingReview.count ?? 0}
          accent="bg-purple-50 text-purple-700"
        />
        <StatCard
          icon={<ShieldAlert className="h-5 w-5" />}
          label={t("admin.statMonitorFailures")}
          value={loading ? 0 : data?.monitor.failedRuns24h ?? 0}
          accent="bg-slate-100 text-slate-700"
        />
      </div>
    </div>
  );
}

function StatusChip({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      {icon}
      {label}
    </span>
  );
}

function RiskQueue({ data }: { data: AdminCommandCenterResponse }) {
  const { t } = useI18n();
  const actions = data.risk.topActions;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-4 w-4" />
          {t("admin.riskQueueTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <p className="text-sm text-slate-500">{t("admin.riskQueueEmpty")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actions.map((item) => {
              const tone =
                item.severity === "critical"
                  ? "border-orange-200 bg-orange-50"
                  : item.severity === "warning"
                    ? "border-amber-200 bg-amber-50"
                    : "border-blue-200 bg-blue-50";
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`rounded-lg border p-4 hover:shadow-sm transition-shadow ${tone}`}
                >
                  <div className="text-sm font-semibold text-[#0F2942]">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {item.subtitle}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MonitorCard({ monitor }: { monitor: AdminMonitorSummary }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [confirm, setConfirm] = React.useState<"run" | "dry" | null>(null);
  const [running, setRunning] = React.useState(false);

  const runMonitor = async (dryRun: boolean) => {
    setRunning(true);
    try {
      const result = await regulationsApi.triggerMonitorRun({ dryRun });
      toast({
        title: t("admin.monitorRunComplete"),
        description: `${t("admin.monitorScanned")}: ${result.scanned}, ${t("admin.monitorChanged")}: ${result.changed}`,
      });
    } catch (err) {
      toast({
        title: t("admin.monitorRunFailed"),
        description: err instanceof Error ? err.message : t("common.error"),
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MonitorCog className="h-4 w-4" />
          {t("admin.monitorTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-3xl font-bold text-[#0F2942]">
            {monitor.health.lastStatus || t("admin.monitorNoRuns")}
          </div>
          <p className="text-sm text-slate-500">
            {monitor.health.lastRunAt
              ? `${t("admin.monitorLast")}: ${formatDate(monitor.health.lastRunAt)}`
              : t("admin.monitorNoRunsHelp")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MuseumGuard>
            <Button
              size="sm"
              disabled={running}
              onClick={() => setConfirm("run")}
              className="bg-[#0F2942] hover:bg-[#1E3A56]"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ms-2">{t("admin.monitorRunNow")}</span>
            </Button>
          </MuseumGuard>
          <MuseumGuard>
            <Button
              size="sm"
              variant="outline"
              disabled={running}
              onClick={() => setConfirm("dry")}
            >
              {t("admin.monitorDryRun")}
            </Button>
          </MuseumGuard>
        </div>
        <ul className="divide-y divide-slate-100">
          {monitor.runs.slice(0, 5).map((run) => (
            <li key={run.id} className="py-2 text-sm flex items-center justify-between gap-3">
              <span className="text-[#0F2942]">
                {run.status}
                {run.dryRun ? ` (${t("admin.monitorDry")})` : ""}
              </span>
              <span className="text-xs text-slate-500">
                {formatDate(run.startedAt)}
              </span>
            </li>
          ))}
        </ul>
        <ConfirmDialog
          open={confirm !== null}
          onOpenChange={(open) => !open && setConfirm(null)}
          title={confirm === "dry" ? t("admin.confirmDryRunTitle") : t("admin.confirmMonitorRunTitle")}
          description={confirm === "dry" ? t("admin.confirmDryRunDesc") : t("admin.confirmMonitorRunDesc")}
          confirmText={t("admin.confirmRun")}
          cancelText={t("common.cancel")}
          variant="warning"
          onConfirm={() => {
            const dry = confirm === "dry";
            setConfirm(null);
            void runMonitor(dry);
          }}
        />
      </CardContent>
    </Card>
  );
}

function SettingsCard({ settings }: { settings: AdminDashboardSettings }) {
  const { t } = useI18n();
  const update = useUpdateAdminDashboardSettings();
  const [draft, setDraft] = React.useState({
    staleCaseDays: settings.staleCaseDays,
    hearingSoonDays: settings.hearingSoonDays,
    workloadHighOpenCases: settings.workloadHighOpenCases,
    aiReviewHighCount: settings.aiReviewHighCount,
    monitorStaleMinutes: settings.monitorStaleMinutes,
  });

  React.useEffect(() => {
    setDraft({
      staleCaseDays: settings.staleCaseDays,
      hearingSoonDays: settings.hearingSoonDays,
      workloadHighOpenCases: settings.workloadHighOpenCases,
      aiReviewHighCount: settings.aiReviewHighCount,
      monitorStaleMinutes: settings.monitorStaleMinutes,
    });
  }, [settings]);

  const field = (
    key: keyof typeof draft,
    label: string
  ) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        min={1}
        value={draft[key]}
        onChange={(e) =>
          setDraft((prev) => ({
            ...prev,
            [key]: Number(e.target.value),
          }))
        }
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          {t("admin.thresholdSettings")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {field("staleCaseDays", t("admin.settingStaleDays"))}
          {field("hearingSoonDays", t("admin.settingHearingDays"))}
          {field("workloadHighOpenCases", t("admin.settingWorkload"))}
          {field("aiReviewHighCount", t("admin.settingAiReview"))}
          {field("monitorStaleMinutes", t("admin.settingMonitorMinutes"))}
        </div>
        <MuseumGuard>
          <Button
            onClick={() => update.mutate(draft)}
            disabled={update.isPending}
            className="bg-[#0F2942] hover:bg-[#1E3A56]"
          >
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("settings.saveChanges")}
          </Button>
        </MuseumGuard>
      </CardContent>
    </Card>
  );
}

function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  );
}
