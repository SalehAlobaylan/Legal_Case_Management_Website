"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Gavel,
  MapPin,
} from "lucide-react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { cn } from "@/lib/utils/cn";

export function PrepareHearingCard() {
  const { isRTL } = useI18n();
  const router = useRouter();

  const hearing = {
    caseId: 1234,
    caseTitle: isRTL ? "الراجحي ضد شركة البناء" : "Al-Rajhi v. BuildCo",
    caseType: isRTL ? "تجاري" : "Commercial",
    court: isRTL ? "المحكمة التجارية — الرياض" : "Commercial Court — Riyadh",
    circuit: isRTL ? "الدائرة الثالثة" : "Circuit 3",
    countdown: { days: 2, hours: 4 },
  };

  const checklist = [
    { label: isRTL ? "ملخّص القضية" : "Case brief", done: true },
    { label: isRTL ? "الأنظمة ذات الصلة" : "Relevant regulations", done: true },
    { label: isRTL ? "السوابق القضائية" : "Precedent rulings", done: true },
    { label: isRTL ? "حجج الخصم المتوقعة" : "Anticipated counter-arguments", done: true },
    { label: isRTL ? "نقاط المرافعة" : "Talking points", done: true },
    { label: isRTL ? "المستندات المطلوبة" : "Required exhibits", done: true },
    { label: isRTL ? "تأكيد الشهود" : "Confirm witnesses", done: false },
    { label: isRTL ? "تمرين الأسئلة" : "Q&A rehearsal", done: false },
  ];
  const completed = checklist.filter((c) => c.done).length;
  const pct = Math.round((completed / checklist.length) * 100);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0F2942] via-[#142F4A] to-[#1E3A56] text-white shadow-lg overflow-hidden">
      <div className="p-6 md:p-7 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: hero */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-[#D97706]/20 text-[#D97706] p-2 rounded-lg">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D97706]">
                {isRTL ? "ميزة رئيسية" : "Primary feature"}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-1 leading-tight">
              {isRTL ? "تحضير للجلسة" : "Prepare for the Hearing"}
            </h2>
            <p className="text-sm text-white/70 font-medium leading-relaxed max-w-sm">
              {isRTL
                ? "جلسة تحضيرية ذكية: كل ما يحتاجه المحامي قبل المثول أمام القاضي، في مكان واحد."
                : "A smart prep session: everything the lawyer needs before standing before the judge, in one place."}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] bg-white/10 px-2 py-1 rounded-md font-bold">
              <Sparkles className="h-3 w-3 text-[#D97706]" />
              {isRTL ? "مدعوم بالذكاء" : "AI-powered"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-white/10 px-2 py-1 rounded-md font-bold">
              <Gavel className="h-3 w-3 text-[#D97706]" />
              {isRTL ? "سوابق + أنظمة" : "Precedents + regs"}
            </span>
          </div>
        </div>

        {/* Middle: next hearing snapshot */}
        <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">
              {isRTL ? "الجلسة القادمة" : "Next hearing"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-[#D97706]/20 text-[#D97706] px-2 py-0.5 rounded-md font-bold">
              <Clock className="h-3 w-3" />
              {isRTL
                ? `خلال ${hearing.countdown.days} أيام و${hearing.countdown.hours} ساعات`
                : `In ${hearing.countdown.days}d ${hearing.countdown.hours}h`}
            </span>
          </div>
          <h3 className="text-lg font-bold mb-0.5">{hearing.caseTitle}</h3>
          <p className="text-xs text-white/60 mb-3">
            {isRTL ? `قضية #${hearing.caseId} • ${hearing.caseType}` : `Case #${hearing.caseId} • ${hearing.caseType}`}
          </p>
          <div className="text-xs text-white/70 space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-white/40" />
              <span>{hearing.court}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gavel className="h-3.5 w-3.5 text-white/40" />
              <span>{hearing.circuit}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-white/60 font-medium">
                {isRTL ? "جاهزية التحضير" : "Prep readiness"}
              </span>
              <span className="font-bold">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#D97706] to-[#F59E0B] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: checklist + CTA */}
        <div className="lg:col-span-1 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold mb-2">
            {isRTL ? `قائمة التحضير (${completed}/${checklist.length})` : `Checklist (${completed}/${checklist.length})`}
          </span>
          <div className="space-y-1 flex-1">
            {checklist.slice(0, 5).map((item) => (
              <div key={item.label} className="flex items-start gap-1.5 text-[11px]">
                {item.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-px" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-white/30 shrink-0 mt-px" />
                )}
                <span className={cn(item.done ? "text-white/80" : "text-white/50", "leading-snug")}>
                  {item.label}
                </span>
              </div>
            ))}
            {checklist.length > 5 && (
              <p className="text-[10px] text-white/40 pl-5 pt-1">
                {isRTL ? `+${checklist.length - 5} بنود أخرى` : `+${checklist.length - 5} more`}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push(`/cases/${hearing.caseId}/prepare`)}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#D97706] hover:bg-[#B45309] transition-colors text-white text-sm font-bold py-2.5 rounded-xl shadow-sm"
          >
            {isRTL ? "ابدأ جلسة التحضير" : "Start prep session"}
            <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
          </button>
        </div>
      </div>
    </div>
  );
}
