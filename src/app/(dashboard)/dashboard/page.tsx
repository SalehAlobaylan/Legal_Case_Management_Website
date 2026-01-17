/**
 * File: src/app/(dashboard)/dashboard/page.tsx
 * Purpose: Dashboard page matching the Silah design system exactly.
 *
 * Layout:
 * - Welcome section with AI analysis summary
 * - 3 Statistics cards (Active Cases highlighted, then Pending Regs, AI Discoveries)
 * - Two-column section: Recent Cases (card rows) + Regulation Updates
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
} from "lucide-react";
import { useCases } from "@/lib/hooks/use-cases";
import { useAuthStore } from "@/lib/store/auth-store";
import { useI18n } from "@/lib/hooks/use-i18n";
import { type Case, CaseType, CaseStatus } from "@/lib/types/case";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: cases, isLoading } = useCases();
  const { t, isRTL } = useI18n();

  const userName = user?.fullName?.split(" ")[0] || "Ahmed";

  // Status badge styles with translations
  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      open: { bg: "bg-[#0F2942]/10", text: "text-[#0F2942]", label: t("cases.statuses.open") },
      in_progress: { bg: "bg-[#D97706]/10", text: "text-[#D97706]", label: t("cases.statuses.in_progress") },
      pending_hearing: { bg: "bg-[#D97706]/10", text: "text-[#D97706]", label: t("cases.statuses.pending_hearing") },
      closed: { bg: "bg-slate-100", text: "text-slate-600", label: t("cases.statuses.closed") },
      archived: { bg: "bg-slate-100", text: "text-slate-500", label: t("cases.statuses.archived") },
    };
    return styles[status] || styles.open;
  };

  // Case type labels with translations
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      labor: t("cases.types.labor"),
      civil: t("cases.types.civil"),
      commercial: t("cases.types.commercial"),
      criminal: t("cases.types.criminal"),
      family: t("cases.types.family"),
      administrative: t("cases.types.administrative"),
    };
    return labels[type] || type;
  };

  // Mock cases matching target design
  const mockCases: Case[] = [
    {
      id: 1,
      organization_id: 1,
      title: "Al-Amoudi vs. TechSolutions Ltd",
      case_number: "C-2024-001",
      case_type: CaseType.LABOR,
      status: CaseStatus.OPEN,
      created_at: "2024-12-01",
      updated_at: "2024-12-25",
    },
    {
      id: 2,
      organization_id: 1,
      title: "Estate of Sheikh H. Al-Rahman",
      case_number: "C-2024-002",
      case_type: CaseType.CIVIL,
      status: CaseStatus.IN_PROGRESS,
      created_at: "2024-11-15",
      updated_at: "2024-12-24",
    },
    {
      id: 3,
      organization_id: 1,
      title: "Construction Liability Case",
      case_number: "C-2024-003",
      case_type: CaseType.COMMERCIAL,
      status: CaseStatus.PENDING_HEARING,
      created_at: "2024-10-20",
      updated_at: "2024-12-20",
    },
  ];

  const displayCases = cases && cases.length > 0 ? cases : mockCases;

  // Regulation updates matching target design
  const regulationUpdates = [
    {
      id: 1,
      type: "amendment",
      title: t("dashboard.newAmendment"),
      description: t("dashboard.amendmentDesc"),
      action: t("dashboard.readAnalysis"),
    },
    {
      id: 2,
      type: "maintenance",
      title: t("dashboard.systemMaintenance"),
      description: t("dashboard.scheduledFor"),
      action: null,
    },
  ];

  const handleNewCase = () => {
    router.push("/cases/new");
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-slate-200 rounded-lg" />
            <div className="h-5 w-96 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-12 w-36 bg-slate-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-[#0F2942] font-serif">
            {t("dashboard.welcome", { name: userName })}
          </h2>
          <p className="text-slate-500 mt-2">
            {t("dashboard.aiAnalysis", { count: "3" }).split("3")[0]}
            <span className="font-bold text-[#D97706]">3 {isRTL ? "" : "new cases"}</span>
            {t("dashboard.aiAnalysis", { count: "3" }).split("3")[1] || ""}
          </p>
        </div>
        <button
          onClick={handleNewCase}
          className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold flex items-center gap-2"
        >
          <div className="bg-white/20 p-1 rounded-md">
            <Scale className="h-3.5 w-3.5" />
          </div>
          {t("dashboard.newCase")}
        </button>
      </div>

      {/* Stats Cards - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">
        {/* Active Cases - Highlighted */}
        <div className="p-6 rounded-2xl shadow-sm border bg-[#0F2942] border-[#0F2942] text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-white/10">
              <FileText className="h-6 w-6 text-[#D97706]" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-[#D97706] text-white">
              +12%
            </span>
          </div>
          <div className="h-4" />
          <h3 className="text-3xl font-bold mb-1 font-serif text-white">24</h3>
          <p className="text-sm font-bold text-blue-200">{t("dashboard.activeCases")}</p>
          <p className="text-xs mt-1 text-blue-300">{t("dashboard.updatedToday", { count: "3" })}</p>
        </div>

        {/* Pending Regulations */}
        <div className="p-6 rounded-2xl shadow-sm border bg-white border-slate-200 hover:border-[#D97706]/50 transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-slate-50">
              <BookOpen className="h-6 w-6 text-[#0F2942]" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-green-100 text-green-700">
              +12%
            </span>
          </div>
          <div className="h-4" />
          <h3 className="text-3xl font-bold mb-1 font-serif text-[#0F2942]">12</h3>
          <p className="text-sm font-bold text-slate-700">{t("dashboard.pendingRegulations")}</p>
          <p className="text-xs mt-1 text-slate-400">{t("dashboard.requiresReview")}</p>
        </div>

        {/* AI Discoveries */}
        <div className="p-6 rounded-2xl shadow-sm border bg-white border-slate-200 hover:border-[#D97706]/50 transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-slate-50">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-green-100 text-green-700">
              +12%
            </span>
          </div>
          <div className="h-4" />
          <h3 className="text-3xl font-bold mb-1 font-serif text-[#0F2942]">89</h3>
          <p className="text-sm font-bold text-slate-700">{t("dashboard.aiDiscoveries")}</p>
          <p className="text-xs mt-1 text-slate-400">{t("dashboard.regulationsMatched")}</p>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases - Card Style */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-[#0F2942]">{t("dashboard.recentCases")}</h3>
            <Link
              href="/cases"
              className="text-[#D97706] text-sm font-bold hover:underline flex items-center gap-1"
            >
              {t("dashboard.viewAll")} <ChevronRight className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <div className="space-y-4">
            {displayCases.slice(0, 3).map((case_) => {
              const statusStyle = getStatusStyle(case_.status);
              const typeLabel = getTypeLabel(case_.case_type);

              return (
                <div
                  key={case_.id}
                  onClick={() => router.push(`/cases/${case_.id}`)}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl border border-transparent hover:border-[#D97706]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2942] flex items-center justify-center text-white group-hover:bg-[#D97706] transition-colors shadow-md">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F2942]">{case_.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {case_.case_number} •{" "}
                        <span className="text-slate-400">{typeLabel}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-[#D97706] transition-colors">
                      <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regulation Updates */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
          <h3 className="font-bold text-lg text-[#0F2942] mb-6">
            {t("dashboard.regulationUpdates")}
          </h3>

          <div className="space-y-[32px]">
            {regulationUpdates.map((update) => (
              <div
                key={update.id}
                className={`flex gap-6 p-[24px] rounded-xl transition-colors group ${update.type === "amendment"
                  ? "hover:bg-orange-50/50"
                  : "hover:bg-slate-50"
                  }`}
              >
                <div
                  className={`mt-1 p-2 rounded-lg h-fit transition-colors ${update.type === "amendment"
                    ? "bg-orange-100 text-[#D97706] group-hover:bg-[#D97706] group-hover:text-white"
                    : "bg-slate-100 text-slate-500"
                    }`}
                >
                  {update.type === "amendment" ? (
                    <AlertCircle className="h-[18px] w-[18px]" />
                  ) : (
                    <Clock className="h-[18px] w-[18px]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F2942]">
                    {update.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {update.description}
                  </p>
                  {update.action && (
                    <button className="mt-2 text-xs text-[#D97706] font-bold hover:underline flex items-center gap-1">
                      {update.action} <ChevronRight className={`h-2.5 w-2.5 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
