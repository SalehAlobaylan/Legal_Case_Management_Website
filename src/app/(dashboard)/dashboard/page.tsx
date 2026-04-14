"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText, BookOpen, Users, ArrowUpRight, Briefcase, Bell,
  CalendarDays, FileSignature, ExternalLink, Check, Plus
} from "lucide-react";
import { useCases } from "@/lib/hooks/use-cases";
import { useClients } from "@/lib/hooks/use-clients";
import {
  useRecentActivity,
  useDailyOperations,
  useCreateDailyTask,
  useUpdateDailyTask,
  useUpdateDocumentReviewStatus,
} from "@/lib/hooks/use-dashboard";
import { useAuthStore } from "@/lib/store/auth-store";
import { useI18n } from "@/lib/hooks/use-i18n";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: cases, isLoading: casesLoading } = useCases();
  const { data: clientsData, isLoading: clientsLoading } = useClients();
  const { data: activityData, isLoading: activityLoading } = useRecentActivity();
  const { data: dailyOps, isLoading: dailyOpsLoading } = useDailyOperations();
  const createTask = useCreateDailyTask();
  const updateTask = useUpdateDailyTask();
  const updateReview = useUpdateDocumentReviewStatus();
  const { isRTL } = useI18n();

  const [newTaskText, setNewTaskText] = React.useState('');

  const userName = user?.fullName?.split(" ")[0] || (isRTL ? "أستاذي" : "Counsel");
  
  const displayCases = React.useMemo(() => cases || [], [cases]);
  const displayClients = React.useMemo(() => clientsData?.clients || [], [clientsData]);
  const existingCaseIds = React.useMemo(() => new Set(displayCases.map((c) => c.id)), [displayCases]);
  const regulationUpdates = React.useMemo(
    () =>
      activityData?.recentUpdates?.filter((u) => u.type === "regulation_amendment") || [
        {
          id: 1,
          title: isRTL ? "تعديل نظام المعاملات المدنية" : "Civil Transactions Law Amendment",
          description: isRTL ? "تعديل في المادة 45" : "Amendment in Article 45",
          createdAt: "2026-03-06T09:00:00.000Z",
          type: "regulation_amendment" as const,
        },
        {
          id: 2,
          title: isRTL ? "تحديث نظام الشركات" : "Corporate Law Update",
          description: isRTL
            ? "نشر اللائحة المنظمة لعمل مجالس الإدارات"
            : "Published Board of Directors operational bylaws",
          createdAt: "2026-03-05T09:00:00.000Z",
          type: "regulation_amendment" as const,
        },
      ],
    [activityData, isRTL]
  );

  const upcomingHearings = (dailyOps?.upcomingHearings || []).slice(0, 6);

  const formatDateTime = (d: string | Date) => formatDate(d, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const pendingDocuments = React.useMemo(() => dailyOps?.documentsForReview || [], [dailyOps]);
  const sortedDocuments = React.useMemo(
    () => [...pendingDocuments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [pendingDocuments]
  );
  const actionableDocuments = React.useMemo(
    () => sortedDocuments.filter((doc) => Number.isFinite(doc.caseId) && doc.caseId > 0 && existingCaseIds.has(doc.caseId)),
    [existingCaseIds, sortedDocuments]
  );
  const orphanDocumentsCount = sortedDocuments.length - actionableDocuments.length;
  const [showNormalReviewItems, setShowNormalReviewItems] = React.useState(false);
  const criticalReviewItems = React.useMemo(
    () => actionableDocuments.filter((doc) => doc.priorityLevel === "critical"),
    [actionableDocuments]
  );
  const highReviewItems = React.useMemo(
    () => actionableDocuments.filter((doc) => doc.priorityLevel === "high"),
    [actionableDocuments]
  );
  const normalReviewItems = React.useMemo(
    () => actionableDocuments.filter((doc) => doc.priorityLevel === "normal"),
    [actionableDocuments]
  );
  const visibleReviewItems = React.useMemo(() => {
    const urgent = [...criticalReviewItems, ...highReviewItems];
    return showNormalReviewItems ? [...urgent, ...normalReviewItems] : urgent;
  }, [criticalReviewItems, highReviewItems, normalReviewItems, showNormalReviewItems]);

  const getReviewReasonLabel = (reason: string) => {
    if (reason === "regulation_changed") return isRTL ? "تحديث نظام مرتبط" : "Linked regulation changed";
    if (reason === "hearing_soon") return isRTL ? "جلسة قريبة" : "Hearing soon";
    if (reason === "pending_over_48h") return isRTL ? "معلّق أكثر من 48 ساعة" : "Pending over 48h";
    if (reason === "active_case_status") return isRTL ? "قضية نشطة" : "Active case";
    return reason;
  };

  const legalPortals = (dailyOps?.legalPortals || []).map((p) => ({
    id: p.id,
    name: isRTL ? p.nameAr : p.nameEn,
    url: p.url,
    color:
      p.tone === "emerald"
        ? "bg-emerald-50 text-emerald-700"
        : p.tone === "blue"
          ? "bg-blue-50 text-blue-700"
          : "bg-amber-50 text-amber-700",
    hover:
      p.tone === "emerald"
        ? "hover:bg-emerald-100 hover:border-emerald-200 border-emerald-100"
        : p.tone === "blue"
          ? "hover:bg-blue-100 hover:border-blue-200 border-blue-100"
          : "hover:bg-amber-100 hover:border-amber-200 border-amber-100",
  }));

  const tasks = dailyOps?.dailyTasks || [];

  const toggleTask = (id: number, completed: boolean) => {
    updateTask.mutate({ id, patch: { completed: !completed } });
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    createTask.mutate(newTaskText.trim(), {
      onSuccess: () => setNewTaskText(''),
    });
  };

  const isLoading = casesLoading || clientsLoading || activityLoading || dailyOpsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-32 w-full bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in zoom-in-95 duration-500">
      
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 md:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F2942] mb-1.5">
              {isRTL ? `أهلاً بك، ${userName}` : `Welcome, ${userName}`}
            </h1>
            <p className="text-slate-600 text-sm md:text-base font-medium max-w-2xl">
              {isRTL
                ? "نظرة سريعة على القضايا والعملاء والتحديثات اليومية."
                : "A quick view of your cases, clients, and daily updates."}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#0F2942]/5 text-[#0F2942] text-xs font-bold">
              {isRTL ? `القضايا: ${displayCases.length}` : `Cases: ${displayCases.length}`}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              {isRTL ? `العملاء: ${displayClients.length}` : `Clients: ${displayClients.length}`}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
              {isRTL ? `تحديثات الأنظمة: ${regulationUpdates.length}` : `Regulation Updates: ${regulationUpdates.length}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── System Overview (3 Columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Recent Clients */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2.5 rounded-xl">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0F2942]">{isRTL ? "العملاء مؤخراً" : "Recent Clients"}</h3>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-2">
            {displayClients.slice(0, 5).map(client => (
              <div key={client.id} onClick={() => router.push(`/clients/${client.id}`)} className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 cursor-pointer group transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 bg-slate-100 group-hover:bg-white rounded-full flex items-center justify-center font-bold text-[#0F2942] shadow-sm">
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#0F2942] truncate">{client.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{client.type === 'company' ? (isRTL ? "شركة" : "Company") : (isRTL ? "فرد" : "Individual")}</p>
                  </div>
                </div>
                <ArrowUpRight className={cn("h-4 w-4 text-slate-300 group-hover:text-emerald-600 shrink-0", isRTL && "rotate-180")} />
              </div>
            ))}
            {displayClients.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Users className="h-10 w-10 mx-auto opacity-20 mb-3" />
                <p className="text-sm">{isRTL ? "لا يوجد عملاء" : "No clients"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Recent Cases */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#D97706]/10 p-2.5 rounded-xl">
                <Briefcase className="h-5 w-5 text-[#D97706]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F2942]">{isRTL ? "القضايا المفتوحة" : "Open Cases"}</h3>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-2">
            {displayCases.slice(0, 5).map(c => (
              <div key={c.id} onClick={() => router.push(`/cases/${c.id}`)} className="p-3 rounded-2xl border border-slate-100 bg-white hover:bg-[#0F2942] hover:text-white cursor-pointer group transition-all shadow-sm">
                <h4 className="font-bold text-sm truncate mb-1">{c.title}</h4>
                <div className="flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-300">
                  <span className="truncate max-w-[120px]">{c.client_info || (isRTL ? "عميل غير محدد" : "Unassigned")}</span>
                  <span className="shrink-0">{formatDate(c.updated_at)}</span>
                </div>
              </div>
            ))}
            {displayCases.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Briefcase className="h-10 w-10 mx-auto opacity-20 mb-3" />
                <p className="text-sm">{isRTL ? "لا يوجد قضايا" : "No cases"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Regulation Updates */}
        <div className="bg-slate-50/50 rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <BookOpen className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="text-lg font-bold text-[#0F2942]">{isRTL ? "تحديثات الأنظمة" : "Regulation Updates"}</h3>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {regulationUpdates.slice(0,4).map((update, idx) => (
              <div key={update.id || idx} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {isRTL ? "إصدار أو تعديل" : "New Version / Amendment"}
                  </span>
                </div>
                <h4 className="font-bold text-[#0F2942] text-sm leading-snug mb-1">{update.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{update.description}</p>
              </div>
            ))}
            {regulationUpdates.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <BookOpen className="h-10 w-10 mx-auto opacity-20 mb-3" />
                <p className="text-sm">{isRTL ? "لا يوجد تحديثات مؤخراً" : "No recent updates"}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Functional Panels Grid (Phase 6 additions) ── */}
      <h2 className="text-2xl font-bold font-serif text-[#0F2942] pt-4 border-t border-slate-200">{isRTL ? "لوحة العمليات اليومية" : "Daily Operations"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* 1. Upcoming Hearings */}
        <div className="bg-white rounded-3xl border border-[#D97706]/20 shadow-sm shadow-[#D97706]/5 overflow-hidden flex flex-col">
          <div className="bg-[#D97706]/5 p-5 border-b border-[#D97706]/10 flex items-center gap-3">
            <div className="bg-[#D97706]/20 p-2 rounded-lg text-[#D97706]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#0F2942]">{isRTL ? "المواعيد والجلسات" : "Hearings & Deadlines"}</h3>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {upcomingHearings.length > 0 ? upcomingHearings.map(c => (
              <div key={c.id} onClick={() => router.push(`/cases/${c.id}`)} className="p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-[#D97706] hover:bg-orange-50/50 transition-colors group">
                <time className="text-xs font-bold text-[#D97706] block mb-1">
                  {formatDateTime(c.nextHearing!)}
                </time>
                <div className="text-sm font-bold text-[#0F2942] mb-1 truncate">{c.title}</div>
                <div className="text-[10px] text-slate-500 font-medium flex justify-between items-center">
                  <span className="truncate">{c.courtJurisdiction || (isRTL ? "المحكمة العامة" : "General Court")}</span>
                  <ArrowUpRight className={cn("h-3 w-3 text-slate-300 group-hover:text-[#D97706]", isRTL && "rotate-180")} />
                </div>
              </div>
            )) : (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">{isRTL ? "لا يوجد جلسات قريبة" : "No upcoming hearings"}</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Required Document Reviews */}
        <div className="bg-white rounded-3xl border border-red-200 shadow-sm shadow-red-100/50 overflow-hidden flex flex-col">
          <div className="bg-red-50 p-5 border-b border-red-100 flex items-center gap-3">
            <div className="bg-red-200/50 p-2 rounded-lg text-red-600">
              <FileSignature className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#0F2942]">{isRTL ? "مستندات للمراجعة" : "Required Reviews"}</h3>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="px-2 py-1 rounded-md bg-red-100 text-red-700">
                {isRTL ? `${criticalReviewItems.length} حرجة` : `${criticalReviewItems.length} critical`}
              </span>
              <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-700">
                {isRTL ? `${highReviewItems.length} عالية` : `${highReviewItems.length} high`}
              </span>
              {normalReviewItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNormalReviewItems((prev) => !prev)}
                  className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  {showNormalReviewItems
                    ? isRTL
                      ? "إخفاء العادية"
                      : "Hide normal"
                    : isRTL
                      ? `إظهار العادية (${normalReviewItems.length})`
                      : `Show normal (${normalReviewItems.length})`}
                </button>
              )}
              {orphanDocumentsCount > 0 && (
                <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-700">
                  {isRTL
                    ? `${orphanDocumentsCount} بدون قضية مرتبطة`
                    : `${orphanDocumentsCount} missing case link`}
                </span>
              )}
            </div>

            {visibleReviewItems.length > 0 ? visibleReviewItems.map((doc) => (
              <div key={doc.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex gap-3 hover:border-red-300 transition-colors">
                <div className="mt-0.5 shrink-0">
                  <FileText className="h-5 w-5 text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#0F2942] truncate">{doc.documentName}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {isRTL ? `القضية: ${doc.caseTitle}` : `Case: ${doc.caseTitle}`} • {formatDate(doc.createdAt)}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-md font-bold",
                        doc.priorityLevel === "critical"
                          ? "bg-red-100 text-red-700"
                          : doc.priorityLevel === "high"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {doc.priorityLevel === "critical"
                        ? isRTL
                          ? "أولوية حرجة"
                          : "Critical"
                        : doc.priorityLevel === "high"
                          ? isRTL
                            ? "أولوية عالية"
                            : "High"
                          : isRTL
                            ? "أولوية عادية"
                            : "Normal"}
                    </span>
                    {doc.reasons.slice(0, 2).map((reason) => (
                      <span key={`${doc.id}-${reason}`} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        {getReviewReasonLabel(reason)}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isRTL ? `رُفع بواسطة: ${doc.uploadedBy}` : `Uploaded by: ${doc.uploadedBy}`}
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button
                      onClick={() => router.push(`/cases/${doc.caseId}`)}
                      className="text-[10px] px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      {isRTL ? "فتح القضية" : "Open Case"}
                    </button>
                    <button
                      onClick={() => updateReview.mutate({ id: doc.id, status: "in_review" })}
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-md",
                        doc.reviewStatus === "in_review"
                          ? "bg-amber-200 text-amber-800"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      )}
                    >
                      {isRTL ? "قيد المراجعة" : "In Review"}
                    </button>
                    <button
                      onClick={() => updateReview.mutate({ id: doc.id, status: "approved" })}
                      className="text-[10px] px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    >
                      {isRTL ? "اعتماد" : "Approve"}
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">
                  {isRTL ? "لا توجد عناصر عاجلة للمراجعة حالياً" : "No urgent review actions right now"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. External Legal Portals */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center gap-3">
            <div className="bg-slate-200 p-2 rounded-lg text-slate-600">
              <ExternalLink className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#0F2942]">{isRTL ? "البوابات العدلية" : "Legal Portals"}</h3>
          </div>
          <div className="p-4 space-y-3 flex-1">
            {legalPortals.map(portal => (
              <a 
                key={portal.id} 
                href={portal.url} 
                target="_blank" 
                rel="noreferrer"
                className={cn("flex flex-col p-3 rounded-xl border transition-all cursor-pointer group", portal.color, portal.hover)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{portal.name}</span>
                  <ArrowUpRight className={cn("h-4 w-4 opacity-50 group-hover:opacity-100", isRTL && "rotate-180")} />
                </div>
                <span className="text-[10px] opacity-70 truncate">{portal.url}</span>
              </a>
            ))}
          </div>
        </div>

        {/* 4. Interactive To-Do List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#0F2942] p-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="font-bold">{isRTL ? "مهامي اليومية" : "My To-Dos"}</h3>
            </div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">{tasks.filter(t=>!t.completed).length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id, task.completed)}
                className="flex items-start gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className={cn("mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all", task.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                  {task.completed && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
                <span className={cn("text-sm font-medium leading-snug", task.completed ? "text-slate-400 line-through" : "text-[#0F2942]")}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100">
            <form onSubmit={addTask} className="relative">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder={isRTL ? "مهمة سريعة..." : "Quick task..."}
                className={cn("w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#0F2942] pr-10")}
              />
              <button 
                type="submit" 
                disabled={!newTaskText.trim()}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-[#0F2942] text-white rounded-md disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
