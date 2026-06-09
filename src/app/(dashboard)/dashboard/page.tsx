"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Users, ArrowUpRight, Briefcase, Bell,
  Check, Plus
} from "lucide-react";
import { useCases } from "@/lib/hooks/use-cases";
import { useClients } from "@/lib/hooks/use-clients";
import {
  useRecentActivity,
  useDailyOperations,
  useCreateDailyTask,
  useUpdateDailyTask,
} from "@/lib/hooks/use-dashboard";
import { useAuthStore } from "@/lib/store/auth-store";
import { useI18n } from "@/lib/hooks/use-i18n";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function ColumnSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4 animate-pulse space-y-3">
      <div className="h-10 w-2/3 bg-slate-100 rounded" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 bg-slate-100 rounded-2xl" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: cases, isLoading: casesLoading } = useCases();
  const { data: clientsData, isLoading: clientsLoading } = useClients();
  const { data: activityData, isLoading: activityLoading } = useRecentActivity();
  const { data: dailyOps, isLoading: dailyOpsLoading } = useDailyOperations();
  const createTask = useCreateDailyTask();
  const updateTask = useUpdateDailyTask();
  const { isRTL } = useI18n();

  const [newTaskText, setNewTaskText] = React.useState('');

  const userName = user?.fullName?.split(" ")[0] || (isRTL ? "أستاذي" : "Counsel");
  
  const displayCases = React.useMemo(() => cases || [], [cases]);
  const displayClients = React.useMemo(() => clientsData?.clients || [], [clientsData]);
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

  return (
    <div data-tour-id="dashboard-command-center" className="space-y-8 pb-12 animate-in fade-in zoom-in-95 duration-500">
      
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
      <div data-tour-id="dashboard-overview" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Recent Clients */}
        {clientsLoading ? <ColumnSkeleton /> : (
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
        )}

        {/* Column 2: Recent Cases */}
        {casesLoading ? <ColumnSkeleton /> : (
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
        )}

        {/* Column 3: Regulation Updates */}
        {activityLoading ? <ColumnSkeleton /> : (
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
        )}

      </div>

      {/* ── Functional Panels Grid (Phase 6 additions) ── */}
      <h2 className="text-2xl font-bold font-serif text-[#0F2942] pt-4 border-t border-slate-200">{isRTL ? "لوحة العمليات اليومية" : "Daily Operations"}</h2>
      {dailyOpsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ColumnSkeleton />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Interactive To-Do List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
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
      )}

    </div>
  );
}
