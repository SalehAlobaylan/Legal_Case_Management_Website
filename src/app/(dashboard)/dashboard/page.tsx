/**
 * File: src/app/(dashboard)/dashboard/page.tsx
 * Purpose: Dashboard page with Silah design system.
 *
 * Layout:
 * - Welcome section with AI analysis summary
 * - Statistics cards grid (4 columns)
 * - Two-column section: Recent Cases + Regulation Updates
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  BookOpen,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Clock,
  Scale,
  Plus,
  Loader2,
} from "lucide-react";
import { useCases } from "@/lib/hooks/use-cases";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  StatCard,
  StatCardsGrid,
  StatCardSkeleton,
} from "@/components/features/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Case } from "@/lib/types/case";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: cases, isLoading, error } = useCases();

  const userName = user?.fullName?.split(" ")[0] || "User";
  const stats = React.useMemo(() => buildStats(cases ?? []), [cases]);

  // Mock data for regulation updates (will be replaced with real data)
  const regulationUpdates = [
    {
      id: 1,
      type: "amendment",
      title: "New Amendment",
      description: "Saudi Labor Law Article 77 has been amended with new termination provisions.",
      action: "Read Analysis",
    },
    {
      id: 2,
      type: "maintenance",
      title: "MOJ System Maintenance",
      description: "Scheduled maintenance on Sunday 2-4 AM.",
      action: null,
    },
  ];

  const handleNewCase = () => {
    router.push("/cases/new");
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Welcome skeleton */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-5 w-96 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-12 w-36 bg-slate-200 rounded-xl animate-pulse" />
        </div>

        {/* Stats skeleton */}
        <StatCardsGrid>
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </StatCardsGrid>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-[#0F2942] mb-2">
          Unable to load dashboard
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Please try refreshing the page.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
            Welcome back, {userName}
          </h1>
          <p className="text-slate-500 mt-2">
            Your{" "}
            <span className="font-bold text-[#D97706]">AI assistant</span>{" "}
            analyzed{" "}
            <span className="font-bold">{stats.newThisWeek} new cases</span>{" "}
            while you were away.
          </p>
        </div>
        <Button
          onClick={handleNewCase}
          className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold flex items-center gap-2"
        >
          <div className="bg-white/20 p-1 rounded-md">
            <Plus className="h-4 w-4" />
          </div>
          New Case
        </Button>
      </div>

      {/* Stats Cards Grid */}
      <StatCardsGrid>
        <StatCard
          value={stats.active}
          title="Active Cases"
          subtitle={`${stats.updatedToday} updated today`}
          icon={FileText}
          trend="+12%"
          active
        />
        <StatCard
          value={stats.pendingRegs}
          title="Pending Regulations"
          subtitle="Requires review"
          icon={BookOpen}
        />
        <StatCard
          value={stats.aiDiscoveries}
          title="AI Discoveries"
          subtitle="Regulations matched"
          icon={Sparkles}
        />
        <StatCard
          value={stats.pendingHearings}
          title="Pending Hearings"
          subtitle="This month"
          icon={Clock}
        />
      </StatCardsGrid>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Cases - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-[#0F2942]">Recent Cases</h3>
            <Link
              href="/cases"
              className="text-[#D97706] text-sm font-bold hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {cases && cases.length > 0 ? (
            <div className="space-y-4">
              {cases.slice(0, 3).map((case_) => (
                <CaseRow
                  key={case_.id}
                  case_={case_}
                  onClick={() => router.push(`/cases/${case_.id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No cases yet"
              description="Create your first case to get started."
              action={
                <Button onClick={handleNewCase}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Case
                </Button>
              }
            />
          )}
        </div>

        {/* Regulation Updates - 1/3 width */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
          <h3 className="font-bold text-lg text-[#0F2942] mb-6">
            Regulation Updates
          </h3>
          <div className="space-y-6">
            {regulationUpdates.map((update) => (
              <RegulationUpdateItem key={update.id} update={update} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   HELPER COMPONENTS
   ============================================================================= */

interface CaseRowProps {
  case_: Case;
  onClick: () => void;
}

function CaseRow({ case_, onClick }: CaseRowProps) {
  const statusStyles: Record<string, string> = {
    open: "bg-[#0F2942]/10 text-[#0F2942]",
    in_progress: "bg-[#D97706]/10 text-[#D97706]",
    pending_hearing: "bg-orange-100 text-orange-700",
    closed: "bg-green-100 text-green-700",
    archived: "bg-slate-200 text-slate-600",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4",
        "hover:bg-slate-50 rounded-xl",
        "border border-transparent hover:border-[#D97706]/30",
        "transition-all cursor-pointer group"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            "bg-[#0F2942] text-white",
            "group-hover:bg-[#D97706] transition-colors shadow-md"
          )}
        >
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-[#0F2942]">{case_.title}</h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            #{case_.case_number} •{" "}
            <span className="text-slate-400">
              {case_.case_type?.replace(/_/g, " ")}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            statusStyles[case_.status] || "bg-slate-100 text-slate-600"
          )}
        >
          {formatStatus(case_.status)}
        </Badge>
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "text-slate-300 group-hover:text-[#D97706] transition-colors"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

interface RegulationUpdateItemProps {
  update: {
    id: number;
    type: string;
    title: string;
    description: string;
    action: string | null;
  };
}

function RegulationUpdateItem({ update }: RegulationUpdateItemProps) {
  const isAmendment = update.type === "amendment";

  return (
    <div
      className={cn(
        "flex gap-4 p-3 rounded-xl -mx-2 group transition-colors",
        isAmendment ? "hover:bg-orange-50/50" : "hover:bg-slate-50"
      )}
    >
      <div
        className={cn(
          "mt-1 p-2 rounded-lg h-fit transition-colors",
          isAmendment
            ? "bg-orange-100 text-[#D97706] group-hover:bg-[#D97706] group-hover:text-white"
            : "bg-slate-100 text-slate-500"
        )}
      >
        {isAmendment ? (
          <AlertCircle className="h-[18px] w-[18px]" />
        ) : (
          <Clock className="h-[18px] w-[18px]" />
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-[#0F2942]">{update.title}</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {update.description}
        </p>
        {update.action && (
          <button className="mt-2 text-xs text-[#D97706] font-bold hover:underline flex items-center gap-1">
            {update.action} <ChevronRight className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="font-bold text-lg text-[#0F2942] mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

/* =============================================================================
   UTILITY FUNCTIONS
   ============================================================================= */

function buildStats(cases: Case[]) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const today = new Date(now.setHours(0, 0, 0, 0));

  return {
    total: cases.length,
    active: cases.filter(
      (c) => c.status === "open" || c.status === "in_progress"
    ).length,
    pendingHearings: cases.filter((c) => c.status === "pending_hearing").length,
    closed: cases.filter((c) => c.status === "closed").length,
    newThisWeek: cases.filter((c) => {
      const created = new Date(c.created_at || "");
      return created >= weekAgo;
    }).length || 3,
    updatedToday: cases.filter((c) => {
      const updated = new Date(c.updated_at || "");
      return updated >= today;
    }).length || 3,
    // Mock values for demo
    pendingRegs: 12,
    aiDiscoveries: 89,
  };
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
