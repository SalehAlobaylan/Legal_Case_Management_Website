/**
 * File: src/app/(dashboard)/admin/dashboard/page.tsx
 * Purpose: Admin oversight workspace.
 *
 * Layout:
 *   Hero (always visible) ─ greeting + 4 stat cards
 *   Tabs (sticky)         ─ Overview · Team · Analytics · Audit
 *     Overview  → urgent action surface: Pulse + Hearings + Unassigned
 *     Team      → Capacity + Growth + Announcements + Momentum
 *     Analytics → Trends charts
 *     Audit     → Governance event log
 *
 * Auth-guard mirrors src/app/(dashboard)/admin/monitoring/page.tsx.
 */

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Loader2,
  Users,
  LayoutDashboard,
  Users2,
  BarChart3,
  ScrollText,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { usePermission } from "@/lib/hooks/use-permission";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAdminStats } from "@/lib/hooks/use-admin-stats";
import { useTeamMembers } from "@/lib/hooks/use-team";
import { useI18n } from "@/lib/hooks/use-i18n";
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

type TabKey = "overview" | "team" | "analytics" | "audit";

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isAdmin } = usePermission();
  const { t, isRTL } = useI18n();

  // Sync the active tab with the URL so it survives refresh + supports deep
  // links from outside the dashboard (e.g. an audit-log notification).
  const tabFromUrl = (searchParams?.get("tab") as TabKey | null) ?? null;
  const [tab, setTab] = React.useState<TabKey>(tabFromUrl ?? "overview");
  React.useEffect(() => {
    if (tabFromUrl && tabFromUrl !== tab) setTab(tabFromUrl);
    // We intentionally don't sync on every tab change here — that's handled
    // by onTabChange so we control when history mutates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);
  const onTabChange = (next: string) => {
    const t = next as TabKey;
    setTab(t);
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    sp.set("tab", t);
    router.replace(`/admin/dashboard?${sp.toString()}`, { scroll: false });
  };

  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (!isAdmin()) router.replace("/dashboard");
  }, [isAuthenticated, isAdmin, router]);

  const { data, isLoading, error } = useAdminStats(
    isAuthenticated && isAdmin()
  );
  const { data: teamData } = useTeamMembers();

  if (!isAuthenticated || !isAdmin()) {
    return <FullPageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Hero — title + stat strip (always visible regardless of tab) */}
      <Hero
        t={t}
        isRTL={isRTL}
        loading={isLoading}
        counts={data?.caseCounts}
        lawyerCount={data?.lawyerCount ?? 0}
      />

      {error ? (
        <Card>
          <CardContent className="p-6 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t("admin.loadFailed")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-12 flex items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" value={tab} onValueChange={onTabChange}>
          {/* Sticky tab bar so the user keeps context while scrolling */}
          <div className="sticky top-0 z-10 bg-[#f9fafb]/95 backdrop-blur supports-[backdrop-filter]:bg-[#f9fafb]/80 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 pt-1">
            <TabsList className="!gap-4 md:!gap-8 overflow-x-auto no-scrollbar">
              <TabsTrigger value="overview">
                <LayoutDashboard className="h-4 w-4" />
                {t("admin.tabOverview")}
              </TabsTrigger>
              <TabsTrigger value="team">
                <Users2 className="h-4 w-4" />
                {t("admin.tabTeam")}
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4" />
                {t("admin.tabAnalytics")}
              </TabsTrigger>
              <TabsTrigger value="audit">
                <ScrollText className="h-4 w-4" />
                {t("admin.tabAudit")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* OVERVIEW — what needs attention today */}
          <TabsContent value="overview" className="space-y-6">
            <OrgPulseCard />
            {data?.hearings && <HearingsCard hearings={data.hearings} />}
            <UnassignedCasesCard
              unassigned={data?.unassignedCases ?? []}
              teamMembers={teamData?.members ?? []}
            />
          </TabsContent>

          {/* TEAM — collective load, growth, coordination */}
          <TabsContent value="team" className="space-y-6">
            <TeamCapacityCard workload={data?.workload ?? []} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TeamGrowthCard />
              <AnnouncementsAdminCard />
            </div>
            <TeamMomentumCard activity={data?.recentActivity ?? []} />
          </TabsContent>

          {/* ANALYTICS — trends over time */}
          <TabsContent value="analytics" className="space-y-6">
            <TrendsCard />
          </TabsContent>

          {/* AUDIT — governance event log */}
          <TabsContent value="audit" className="space-y-6">
            <AuditLogCard />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

/* ============================================================================
   HERO — title + stat strip. Stays visible across tab switches.
   ============================================================================ */

function Hero({
  t,
  isRTL,
  loading,
  counts,
  lawyerCount,
}: {
  t: (key: string) => string;
  isRTL: boolean;
  loading: boolean;
  counts:
    | {
        total: number;
        open: number;
        unassigned: number;
      }
    | undefined;
  lawyerCount: number;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F2942] leading-tight">
            {t("admin.dashboardTitle")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("admin.dashboardSubtitle")}
          </p>
        </div>
        <Link
          href="/settings"
          className="text-sm font-medium text-orange-600 hover:underline inline-flex items-center gap-1"
        >
          {t("admin.orgSettingsLink")} <span aria-hidden>{isRTL ? "←" : "→"}</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<Briefcase className="h-5 w-5" />}
          label={t("admin.statTotalCases")}
          value={loading ? 0 : counts?.total ?? 0}
          accent="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label={t("admin.statOpenCases")}
          value={loading ? 0 : counts?.open ?? 0}
          accent="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label={t("admin.statTeamMembers")}
          value={loading ? 0 : lawyerCount}
          accent="bg-purple-50 text-purple-700"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label={t("admin.statUnassigned")}
          value={loading ? 0 : counts?.unassigned ?? 0}
          accent="bg-amber-50 text-amber-700"
        />
      </div>
    </div>
  );
}

function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  );
}
