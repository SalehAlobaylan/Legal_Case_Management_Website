"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText, BookOpen, Users, ArrowUpRight, Scale, Briefcase, Bell,
  CalendarDays, FileSignature, ExternalLink, Check, Plus
} from "lucide-react";
import { useCases } from "@/lib/hooks/use-cases";
import { useClients } from "@/lib/hooks/use-clients";
import { useRecentActivity } from "@/lib/hooks/use-dashboard";
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
  const { t, isRTL } = useI18n();

  // Local state for To-Dos panel
  const [tasks, setTasks] = React.useState([
    { id: 1, text: isRTL ? 'مراجعة المذكرة الجوابية في القضية 45' : 'Review defense statement for Case #45', completed: false },
    { id: 2, text: isRTL ? 'اعتماد عقد التأسيس لشركة التقنية' : 'Approve articles of association for Tech Co.', completed: true },
    { id: 3, text: isRTL ? 'تجديد الوكالة الشرعية للعميل أحمد' : 'Renew POA for Client Ahmed', completed: false },
  ]);
  const [newTaskText, setNewTaskText] = React.useState('');

  const userName = user?.fullName?.split(" ")[0] || (isRTL ? "أستاذي" : "Counsel");
  
  const displayCases = cases || [];
  const displayClients = clientsData?.clients || [];
  const regulationUpdates = activityData?.recentUpdates?.filter(u => u.type === 'regulation_amendment') || [
    { id: '1', title: isRTL ? 'تعديل نظام المعاملات المدنية' : 'Civil Transactions Law Amendment', description: isRTL ? 'تعديل في المادة 45' : 'Amendment in Article 45', date: new Date().toISOString(), type: 'regulation_amendment' },
    { id: '2', title: isRTL ? 'تحديث نظام الشركات' : 'Corporate Law Update', description: isRTL ? 'نشر اللائحة المنظمة لعمل مجالس الإدارات' : 'Published Board of Directors operational bylaws', date: new Date(Date.now() - 86400000).toISOString(), type: 'regulation_amendment' }
  ];

  const upcomingHearings = displayCases
    .filter(c => c.next_hearing && new Date(c.next_hearing).getTime() > new Date().getTime())
    .sort((a, b) => new Date(a.next_hearing!).getTime() - new Date(b.next_hearing!).getTime())
    .slice(0, 3);

  const formatDateTime = (d: string | Date) => formatDate(d, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const pendingDocuments = [
    { id: 1, name: isRTL ? 'مسودة عقد اتفاقية الصلح.pdf' : 'Settlement_Agreement_Draft.pdf', uploader: isRTL ? 'العميل: خالد الفهد' : 'Client: Khalid Alfahad', time: '1h ago' },
    { id: 2, name: isRTL ? 'عقد تأسيس شركة الرواد.docx' : 'Alruwad_Articles_Of_Association.docx', uploader: isRTL ? 'مساعد قانوني: سارة' : 'Paralegal: Sara', time: '3h ago' },
  ];

  const legalPortals = [
    { id: 1, name: isRTL ? 'ناجز (Najiz)' : 'Najiz Portal', url: 'https://najiz.sa', color: 'bg-emerald-50 text-emerald-700', hover: 'hover:bg-emerald-100 hover:border-emerald-200 border-emerald-100' },
    { id: 2, name: isRTL ? 'معين (Muin)' : 'Muin System', url: 'https://muin.bog.gov.sa', color: 'bg-blue-50 text-blue-700', hover: 'hover:bg-blue-100 hover:border-blue-200 border-blue-100' },
    { id: 3, name: isRTL ? 'وزارة العدل (MOJ)' : 'Ministry of Justice', url: 'https://moj.gov.sa', color: 'bg-amber-50 text-amber-700', hover: 'hover:bg-amber-100 hover:border-amber-200 border-amber-100' },
  ];

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText, completed: false }]);
    setNewTaskText('');
  };

  const isLoading = casesLoading || clientsLoading || activityLoading;

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
      
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-[2rem] bg-[#0F2942] p-8 md:p-10 shadow-lg text-white border border-[#1E3A56]">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150 pointer-events-none">
          <Scale className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
            {isRTL ? `أهلاً بك، ${userName}.` : `Welcome, ${userName}.`}
          </h1>
          <p className="text-blue-200/80 text-sm md:text-base font-medium max-w-2xl">
            {isRTL 
              ? "إليك مركز القيادة الخاص بك. تصفح القضايا والعملاء الجدد، وتابع المواعيد والمستندات بفاعلية تامة."
              : "Here is your mission control. Browse cases, clients, follow up on hearings and documents efficiently."}
          </p>
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
              <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-[#D97706] hover:bg-orange-50/50 transition-colors group">
                <time className="text-xs font-bold text-[#D97706] block mb-1">
                  {formatDateTime(c.next_hearing!)}
                </time>
                <div className="text-sm font-bold text-[#0F2942] mb-1 truncate">{c.title}</div>
                <div className="text-[10px] text-slate-500 font-medium flex justify-between items-center">
                  <span className="truncate">{c.court_jurisdiction || (isRTL ? "المحكمة العامة" : "General Court")}</span>
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
            {pendingDocuments.map(doc => (
              <div key={doc.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex gap-3 cursor-pointer hover:border-red-300 transition-colors">
                <div className="mt-0.5 shrink-0">
                  <FileText className="h-5 w-5 text-red-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#0F2942] truncate hover:text-red-600 transition-colors">{doc.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{doc.uploader} • {doc.time}</div>
                </div>
              </div>
            ))}
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
                onClick={() => toggleTask(task.id)}
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
