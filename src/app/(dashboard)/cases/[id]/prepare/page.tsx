"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Target,
  Clock,
  Gavel,
  MapPin,
  Scale,
  BookOpen,
  Users,
  FileText,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Circle,
  AlertTriangle,
  TrendingUp,
  Mic,
  Play,
} from "lucide-react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { NajizLockOverlay } from "@/components/features/dashboard/najiz-lock-overlay";
import { cn } from "@/lib/utils/cn";

export default function PrepareHearingPage() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const params = useParams();
  const caseId = params?.id;

  const caseTitle = isRTL ? "الراجحي ضد شركة البناء" : "Al-Rajhi v. BuildCo";

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-500">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0F2942] font-bold"
      >
        <ArrowLeft className={cn("h-3.5 w-3.5", isRTL && "rotate-180")} />
        {isRTL ? "رجوع" : "Back"}
      </button>

      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0F2942] via-[#142F4A] to-[#1E3A56] text-white p-6 md:p-8 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-[#D97706]/20 text-[#D97706] p-1.5 rounded-lg">
            <Target className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D97706]">
            {isRTL ? "جلسة تحضير" : "Prep session"}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
          {isRTL ? `تحضير جلسة: ${caseTitle}` : `Prepare for: ${caseTitle}`}
        </h1>
        <p className="text-sm text-white/70 font-medium mb-5">
          {isRTL ? `قضية #${caseId} — تجارية` : `Case #${caseId} — Commercial`}
        </p>
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg font-bold">
            <Clock className="h-3.5 w-3.5 text-[#D97706]" />
            {isRTL ? "خلال يومين و4 ساعات" : "In 2d 4h"}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg font-bold">
            <MapPin className="h-3.5 w-3.5 text-white/60" />
            {isRTL ? "المحكمة التجارية — الرياض" : "Commercial Court — Riyadh"}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg font-bold">
            <Gavel className="h-3.5 w-3.5 text-white/60" />
            {isRTL ? "الدائرة 3 — القاضي م. السبيعي" : "Circuit 3 — Judge M. Al-Subaiy"}
          </span>
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <CaseSummarySection isRTL={isRTL} />
          <ArgumentsSection isRTL={isRTL} />
          <RegulationsSection isRTL={isRTL} />
          <PrecedentsSection isRTL={isRTL} />
          <NajizLockOverlay>
            <PriorProceedingsSection isRTL={isRTL} />
          </NajizLockOverlay>
          <RehearsalSection isRTL={isRTL} />
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <ChecklistSection isRTL={isRTL} />
          <DocumentsSection isRTL={isRTL} />
          <OpposingCounselSection isRTL={isRTL} />
          <NajizLockOverlay>
            <CourtDocketSection isRTL={isRTL} />
          </NajizLockOverlay>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Sections ─────────── */

function SectionShell({
  icon: Icon,
  title,
  subtitle,
  accent = "bg-slate-100 text-slate-700",
  badge,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  accent?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", accent)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[#0F2942] text-sm">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function AIBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold uppercase tracking-wider">
      <Sparkles className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

function CaseSummarySection({ isRTL }: { isRTL: boolean }) {
  return (
    <SectionShell
      icon={BookOpen}
      title={isRTL ? "ملخّص القضية" : "Case Summary"}
      subtitle={isRTL ? "مقتطف ذكي من ملف القضية" : "AI digest of the case file"}
      accent="bg-blue-100 text-blue-700"
      badge={<AIBadge label="AI" />}
    >
      <p className="text-sm text-slate-700 leading-relaxed mb-3">
        {isRTL
          ? "المدعي يطالب بفسخ عقد مقاولة بعد تأخر المدعى عليه في التسليم 142 يوماً، مع تعويض عن أضرار مباشرة قدرها 2.4 مليون ريال. الدفاع يستند إلى ظروف قاهرة ونزاع على نطاق الأعمال الإضافية."
          : "Plaintiff seeks rescission of a construction contract after a 142-day delivery delay, plus SAR 2.4M in direct damages. Defense argues force majeure and a dispute over additional scope of work."}
      </p>
      <div className="flex gap-2 flex-wrap">
        {(isRTL
          ? ["عقد مقاولة", "تعويض", "فسخ", "تأخير"]
          : ["Construction", "Damages", "Rescission", "Delay"]
        ).map((t) => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
            {t}
          </span>
        ))}
      </div>
    </SectionShell>
  );
}

function ArgumentsSection({ isRTL }: { isRTL: boolean }) {
  const pro = isRTL
    ? [
        "تأخير موثّق في التسليم — 142 يوماً",
        "إنذار رسمي أُرسل قبل 60 يوماً",
        "شهادة فنية تثبت عدم اكتمال الأعمال",
      ]
    : [
        "Documented 142-day delivery delay",
        "Formal notice sent 60 days prior",
        "Technical report confirms incomplete works",
      ];
  const contra = isRTL
    ? [
        "سيُحتج بالقوة القاهرة (سلاسل التوريد)",
        "ادعاء أعمال إضافية غير مسعّرة",
        "نزاع على تاريخ بدء التنفيذ",
      ]
    : [
        "Force majeure defense (supply chain)",
        "Claim of unpriced additional scope",
        "Dispute over execution start date",
      ];
  return (
    <SectionShell
      icon={Scale}
      title={isRTL ? "الحجج الرئيسية" : "Key Arguments"}
      subtitle={isRTL ? "لنا / لهم — استخلاص ذكي" : "Ours / theirs — AI-extracted"}
      accent="bg-emerald-100 text-emerald-700"
      badge={<AIBadge label="AI" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
            {isRTL ? "حججنا" : "Our position"}
          </p>
          <ul className="space-y-1.5">
            {pro.map((p) => (
              <li key={p} className="flex items-start gap-1.5 text-xs text-slate-700">
                <span className="mt-1 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                <span className="leading-snug">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-3">
          <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider mb-2">
            {isRTL ? "حجج الخصم المتوقعة" : "Anticipated counter"}
          </p>
          <ul className="space-y-1.5">
            {contra.map((c) => (
              <li key={c} className="flex items-start gap-1.5 text-xs text-slate-700">
                <span className="mt-1 h-1 w-1 rounded-full bg-red-500 shrink-0" />
                <span className="leading-snug">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

function RegulationsSection({ isRTL }: { isRTL: boolean }) {
  const regs = [
    {
      code: isRTL ? "نظام المعاملات المدنية — م.45" : "Civil Transactions — Art. 45",
      note: isRTL ? "فسخ العقد للإخلال الجوهري" : "Rescission for material breach",
      score: 94,
    },
    {
      code: isRTL ? "نظام المعاملات المدنية — م.77" : "Civil Transactions — Art. 77",
      note: isRTL ? "التعويض عن الضرر المباشر" : "Direct damages computation",
      score: 88,
    },
    {
      code: isRTL ? "نظام المحاكم التجارية — م.12" : "Commercial Courts — Art. 12",
      note: isRTL ? "اختصاص الدائرة التجارية" : "Commercial circuit jurisdiction",
      score: 71,
    },
  ];
  return (
    <SectionShell
      icon={BookOpen}
      title={isRTL ? "الأنظمة ذات الصلة" : "Relevant Regulations"}
      subtitle={isRTL ? "مطابقة دلالية عبر نموذج BGE-M3" : "Semantic match via BGE-M3"}
      accent="bg-indigo-100 text-indigo-700"
      badge={<AIBadge label="AI" />}
    >
      <div className="space-y-2">
        {regs.map((r) => (
          <div key={r.code} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-200 cursor-pointer transition-colors">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#0F2942] truncate">{r.code}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{r.note}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                <TrendingUp className="h-2.5 w-2.5" />
                {r.score}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function PrecedentsSection({ isRTL }: { isRTL: boolean }) {
  const cases = [
    {
      id: "2023/CMR-887",
      title: isRTL ? "حكم تجاري — التأخير في التسليم" : "Commercial — late delivery",
      outcome: isRTL ? "لصالح المدعي" : "for plaintiff",
      tone: "success" as const,
    },
    {
      id: "2022/CMR-1042",
      title: isRTL ? "القوة القاهرة — سلاسل التوريد" : "Force majeure — supply chain",
      outcome: isRTL ? "مختلط" : "mixed",
      tone: "warning" as const,
    },
    {
      id: "2024/CMR-203",
      title: isRTL ? "فسخ عقد مقاولة" : "Construction rescission",
      outcome: isRTL ? "لصالح المدعي" : "for plaintiff",
      tone: "success" as const,
    },
  ];
  return (
    <SectionShell
      icon={Gavel}
      title={isRTL ? "السوابق القضائية" : "Precedent Rulings"}
      subtitle={isRTL ? "أحكام مشابهة من قواعد البيانات العدلية" : "Similar rulings from judicial databases"}
      accent="bg-[#D97706]/10 text-[#D97706]"
      badge={<AIBadge label="AI" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {cases.map((c) => (
          <div key={c.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
            <p className="text-[10px] font-mono text-slate-500 mb-1">{c.id}</p>
            <p className="text-xs font-bold text-[#0F2942] leading-snug mb-2">{c.title}</p>
            <span
              className={cn(
                "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                c.tone === "success" && "bg-emerald-100 text-emerald-700",
                c.tone === "warning" && "bg-amber-100 text-amber-700"
              )}
            >
              {c.outcome}
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function PriorProceedingsSection({ isRTL }: { isRTL: boolean }) {
  const events = [
    { date: "2026-04-18", label: isRTL ? "جلسة مرافعة" : "Oral argument", note: isRTL ? "تم إمهال المدعى عليه" : "Defendant granted extension" },
    { date: "2026-03-12", label: isRTL ? "جلسة أولى" : "First hearing", note: isRTL ? "قُبلت اللائحة" : "Petition accepted" },
    { date: "2026-02-04", label: isRTL ? "قيد القضية" : "Case filed", note: "—" },
  ];
  return (
    <SectionShell
      icon={FileText}
      title={isRTL ? "الإجراءات السابقة" : "Prior Proceedings"}
      subtitle={isRTL ? "محاضر الجلسات من ناجز" : "Session minutes from Najiz"}
      accent="bg-purple-100 text-purple-700"
    >
      <ol className="relative border-s border-slate-200 ms-2 space-y-3">
        {events.map((e) => (
          <li key={e.date} className="ms-4">
            <span className="absolute -start-1.5 h-3 w-3 rounded-full bg-purple-400 border-2 border-white" />
            <p className="text-[10px] text-slate-400 font-mono">{e.date}</p>
            <p className="text-sm font-bold text-[#0F2942]">{e.label}</p>
            <p className="text-[11px] text-slate-500">{e.note}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

function RehearsalSection({ isRTL }: { isRTL: boolean }) {
  const questions = isRTL
    ? [
        "كيف تثبت علم المدعى عليه بالإنذار؟",
        "ما ردك على ادعاء القوة القاهرة؟",
        "كيف حُسب مبلغ التعويض 2.4 مليون؟",
      ]
    : [
        "How do you prove notice was received?",
        "What is your reply to the force-majeure claim?",
        "How was the SAR 2.4M figure calculated?",
      ];
  return (
    <SectionShell
      icon={Mic}
      title={isRTL ? "تمرين الأسئلة" : "Rehearsal"}
      subtitle={isRTL ? "محاكاة أسئلة القاضي والخصم" : "Simulated judge & opposing questions"}
      accent="bg-rose-100 text-rose-700"
      badge={<AIBadge label="AI" />}
    >
      <div className="space-y-2 mb-3">
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
            <div className="h-5 w-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center shrink-0">
              Q{i + 1}
            </div>
            <p className="text-xs text-slate-700 leading-snug">{q}</p>
          </div>
        ))}
      </div>
      <button className="w-full inline-flex items-center justify-center gap-2 bg-[#0F2942] text-white text-xs font-bold py-2 rounded-lg hover:bg-[#1E3A56] transition-colors">
        <Play className="h-3.5 w-3.5" />
        {isRTL ? "ابدأ المحاكاة الصوتية" : "Start voice simulation"}
      </button>
    </SectionShell>
  );
}

function ChecklistSection({ isRTL }: { isRTL: boolean }) {
  const items = [
    { label: isRTL ? "ملخّص القضية" : "Case brief", done: true },
    { label: isRTL ? "الأنظمة ذات الصلة" : "Relevant regulations", done: true },
    { label: isRTL ? "السوابق القضائية" : "Precedent rulings", done: true },
    { label: isRTL ? "نقاط المرافعة" : "Talking points", done: true },
    { label: isRTL ? "المستندات المطلوبة" : "Required exhibits", done: true },
    { label: isRTL ? "حجج الخصم المتوقعة" : "Counter-arguments", done: true },
    { label: isRTL ? "تأكيد الشهود" : "Confirm witnesses", done: false },
    { label: isRTL ? "تمرين الأسئلة" : "Q&A rehearsal", done: false },
  ];
  const done = items.filter((i) => i.done).length;
  return (
    <SectionShell
      icon={CheckCircle2}
      title={isRTL ? "قائمة التحضير" : "Prep Checklist"}
      subtitle={`${done}/${items.length}`}
      accent="bg-emerald-100 text-emerald-700"
    >
      <div className="space-y-2">
        {items.map((i) => (
          <label key={i.label} className="flex items-start gap-2 text-xs cursor-pointer group">
            {i.done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-px" />
            ) : (
              <Circle className="h-4 w-4 text-slate-300 group-hover:text-slate-400 shrink-0 mt-px" />
            )}
            <span
              className={cn(
                "leading-snug",
                i.done ? "text-slate-500 line-through" : "text-[#0F2942] font-medium"
              )}
            >
              {i.label}
            </span>
          </label>
        ))}
      </div>
    </SectionShell>
  );
}

function DocumentsSection({ isRTL }: { isRTL: boolean }) {
  const docs = [
    { name: isRTL ? "عقد المقاولة الأصلي" : "Original contract", status: "ready" as const },
    { name: isRTL ? "إنذار التأخير" : "Delay notice", status: "ready" as const },
    { name: isRTL ? "تقرير الخبير الفني" : "Expert report", status: "ready" as const },
    { name: isRTL ? "جدول حساب التعويض" : "Damages schedule", status: "pending" as const },
  ];
  return (
    <SectionShell
      icon={FileText}
      title={isRTL ? "المستندات المطلوبة" : "Required Exhibits"}
      subtitle={isRTL ? "ما ستحضره للجلسة" : "What to bring"}
      accent="bg-blue-100 text-blue-700"
    >
      <div className="space-y-1.5">
        {docs.map((d) => (
          <div key={d.name} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/70">
            <span className="text-xs text-[#0F2942] font-medium truncate">{d.name}</span>
            <span
              className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0",
                d.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}
            >
              {d.status === "ready"
                ? isRTL ? "جاهز" : "ready"
                : isRTL ? "ناقص" : "pending"}
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function OpposingCounselSection({ isRTL }: { isRTL: boolean }) {
  return (
    <SectionShell
      icon={Users}
      title={isRTL ? "الطرف المقابل" : "Opposing Counsel"}
      accent="bg-slate-100 text-slate-700"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[#0F2942]">
          SK
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#0F2942] truncate">
            {isRTL ? "أ. سعد الكناني" : "Saad Al-Kinani"}
          </p>
          <p className="text-[11px] text-slate-500">
            {isRTL ? "مكتب الكناني ومحامون" : "Al-Kinani & Partners"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-lg font-bold text-[#0F2942]">12</p>
          <p className="text-[9px] text-slate-500 font-bold uppercase">
            {isRTL ? "مواجهات سابقة" : "prior cases"}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-lg font-bold text-emerald-600">67%</p>
          <p className="text-[9px] text-slate-500 font-bold uppercase">
            {isRTL ? "نسبة نجاحنا" : "our win-rate"}
          </p>
        </div>
      </div>
      <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-1.5">
        <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-800 leading-snug">
          {isRTL
            ? "يميل إلى الاعتماد على الدفوع الإجرائية — احضر ردوداً جاهزة."
            : "Tends to rely on procedural objections — have rebuttals ready."}
        </p>
      </div>
    </SectionShell>
  );
}

function CourtDocketSection({ isRTL }: { isRTL: boolean }) {
  return (
    <SectionShell
      icon={MessageSquare}
      title={isRTL ? "رُزنامة المحكمة" : "Court Docket"}
      subtitle={isRTL ? "الجدول اليومي للدائرة" : "Circuit's daily schedule"}
      accent="bg-purple-100 text-purple-700"
    >
      <div className="space-y-1.5">
        {[
          { t: "09:30", c: "CMR-0211", a: isRTL ? "مرافعة" : "Oral arg." },
          { t: "10:15", c: "CMR-1234", a: isRTL ? "قضيتك" : "Your case" },
          { t: "11:00", c: "CMR-0988", a: isRTL ? "نطق حكم" : "Judgment" },
        ].map((row) => (
          <div
            key={row.c}
            className={cn(
              "flex items-center justify-between p-2 rounded-lg text-xs",
              row.c === "CMR-1234"
                ? "bg-[#D97706]/10 border border-[#D97706]/30"
                : "bg-slate-50 border border-slate-100"
            )}
          >
            <span className="font-mono text-slate-600 text-[11px]">{row.t}</span>
            <span className="font-bold text-[#0F2942]">{row.c}</span>
            <span className="text-slate-500 text-[10px]">{row.a}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
