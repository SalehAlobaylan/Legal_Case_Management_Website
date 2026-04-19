"use client";

import * as React from "react";
import {
  Gavel,
  BadgeCheck,
  FileSignature,
  ScrollText,
  ScanLine,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Upload,
  Calendar,
  Clock,
  Lock,
} from "lucide-react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { NajizLockOverlay } from "./najiz-lock-overlay";
import { cn } from "@/lib/utils/cn";

/* ──────────────────────────────────────────────────────────────
   Card 1 — Najiz Case Sync
   Feature idea: Silah auto-polls Najiz for every linked case and
   surfaces a live event feed of status changes (new hearing, new
   submission by opposing party, judgment issued). One-click pull
   into the Silah case file.
   ──────────────────────────────────────────────────────────────*/
function CaseSyncCard() {
  const { isRTL } = useI18n();
  const events = [
    {
      tone: "accent",
      case: isRTL ? "قضية #1234" : "Case #1234",
      type: isRTL ? "جلسة مستحدثة" : "New hearing",
      detail: isRTL ? "الأربعاء 25 أبريل — الدائرة التجارية 3" : "Wed Apr 25 — Commercial Circuit 3",
    },
    {
      tone: "info",
      case: isRTL ? "قضية #1187" : "Case #1187",
      type: isRTL ? "لائحة جوابية" : "Response filed",
      detail: isRTL ? "من الطرف الآخر — قبل 3 ساعات" : "by opposing party — 3h ago",
    },
    {
      tone: "success",
      case: isRTL ? "قضية #1092" : "Case #1092",
      type: isRTL ? "حكم ابتدائي" : "Primary judgment",
      detail: isRTL ? "صدر، في انتظار التسبيب" : "issued, reasoning pending",
    },
  ];
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[280px]">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
            <Gavel className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F2942] text-sm leading-tight">
              {isRTL ? "مزامنة قضايا ناجز" : "Najiz Case Sync"}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              {isRTL ? "تحديثات فورية من المحكمة" : "Live updates from the court"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {isRTL ? "متصل" : "live"}
        </div>
      </div>
      <div className="p-3 flex-1 space-y-2">
        {events.map((e, i) => (
          <div key={i} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#0F2942]">{e.case}</span>
              <span
                className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                  e.tone === "accent" && "bg-[#D97706]/10 text-[#D97706]",
                  e.tone === "info" && "bg-blue-100 text-blue-700",
                  e.tone === "success" && "bg-emerald-100 text-emerald-700"
                )}
              >
                {e.type}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">{e.detail}</p>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          {isRTL ? "آخر مزامنة: الآن" : "Last sync: just now"}
        </span>
        <span className="text-[10px] text-blue-700 font-bold flex items-center gap-0.5">
          {isRTL ? "سحب إلى الملف" : "Pull into case"}
          <ArrowRight className={cn("h-3 w-3", isRTL && "rotate-180")} />
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Card 2 — Lawyer License Badge
   Feature idea: Lawyer profile carries a live Najiz-verified seal.
   Silah gates high-stakes actions (filing, signing agencies) on a
   valid license, and warns 30 days before expiry.
   ──────────────────────────────────────────────────────────────*/
export function LicenseBadgeCard() {
  const { isRTL } = useI18n();
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[280px]">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2.5 bg-emerald-50/50">
        <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg">
          <BadgeCheck className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-bold text-[#0F2942] text-sm leading-tight">
            {isRTL ? "ترخيص المحامي" : "Lawyer License"}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            {isRTL ? "موثّق من ناجز" : "Verified via Najiz"}
          </p>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-3">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
            <BadgeCheck className="h-8 w-8 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
            <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
        <div className="text-center mb-3">
          <p className="text-[11px] text-slate-500 font-medium">
            {isRTL ? "رقم الترخيص" : "License #"}
          </p>
          <p className="text-sm font-bold text-[#0F2942] font-mono tracking-wider">SA-12847</p>
        </div>
        <div className="w-full mb-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span>{isRTL ? "متبقٍ" : "Remaining"}</span>
            <span className="font-bold text-emerald-700">
              {isRTL ? "284 يوماً" : "284 days"}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
          </div>
        </div>
        <div className="flex gap-1 flex-wrap justify-center">
          {(isRTL ? ["تجاري", "عمالي", "مدني"] : ["Commercial", "Labor", "Civil"]).map((c) => (
            <span
              key={c}
              className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Card 3 — Active Powers of Attorney
   Feature idea: Every POA issued via Najiz syncs here. Each item
   shows scope, expiry, and a usage log so the lawyer can prove
   which agency authorized which action, per compliance demands.
   ──────────────────────────────────────────────────────────────*/
function AgencyLogCard() {
  const { isRTL } = useI18n();
  const agencies = [
    {
      client: isRTL ? "شركة الراجحي التجارية" : "Al-Rajhi Trading Co.",
      scope: isRTL ? "وكالة شاملة" : "General PoA",
      usage: 4,
      expiring: false,
    },
    {
      client: isRTL ? "أحمد عبدالله العتيبي" : "Ahmed A. Al-Otaibi",
      scope: isRTL ? "جزئية — تمثيل أمام المحكمة" : "Limited — court rep.",
      usage: 2,
      expiring: true,
    },
    {
      client: isRTL ? "مؤسسة نور" : "Noor Establishment",
      scope: isRTL ? "وكالة تقاضٍ" : "Litigation PoA",
      usage: 1,
      expiring: false,
    },
  ];
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[280px]">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2.5 bg-amber-50/50">
        <div className="bg-amber-100 text-[#D97706] p-1.5 rounded-lg">
          <FileSignature className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-bold text-[#0F2942] text-sm leading-tight">
            {isRTL ? "الوكالات النشطة" : "Active Agencies"}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            {isRTL ? "سجل استخدام موثّق للامتثال" : "Audit-ready usage log"}
          </p>
        </div>
      </div>
      <div className="p-3 flex-1 space-y-2">
        {agencies.map((a, i) => (
          <div key={i} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#0F2942] truncate">{a.client}</span>
              {a.expiring && (
                <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold flex items-center gap-0.5">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {isRTL ? "قرب الانتهاء" : "expiring"}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mb-1.5">{a.scope}</p>
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
              <span>
                {isRTL ? `استُخدمت ${a.usage} مرات هذا الشهر` : `Used ${a.usage}× this month`}
              </span>
              <span className="text-slate-600 font-bold">
                {isRTL ? "عرض السجل" : "view log"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Card 4 — Hearing Digest (Session Minutes)
   Feature idea: When minutes land in Najiz, Silah pulls them and
   the AI microservice extracts rulings, deadlines, and actionable
   tasks. The lawyer sees a one-screen digest instead of reading
   the full transcript.
   ──────────────────────────────────────────────────────────────*/
function HearingDigestCard() {
  const { isRTL } = useI18n();
  const rulings = isRTL
    ? [
        "قبول مذكرة التعديل المقدمة من المدعي",
        "إمهال المدعى عليه لتقديم المستندات",
        "تحديد جلسة خبرة محاسبية",
      ]
    : [
        "Plaintiff's amendment memo accepted",
        "Defendant granted extension for docs",
        "Accounting expert session scheduled",
      ];
  const deadline = isRTL ? "تسليم المستندات: 2 مايو 2026" : "Submit docs by: May 2, 2026";
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[280px]">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2.5 bg-purple-50/50">
        <div className="bg-purple-100 text-purple-700 p-1.5 rounded-lg">
          <ScrollText className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[#0F2942] text-sm leading-tight">
            {isRTL ? "خلاصة الجلسة" : "Hearing Digest"}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            {isRTL ? "ملخّص ذكي من محضر ناجز" : "AI summary of Najiz minutes"}
          </p>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold flex items-center gap-0.5">
          <Sparkles className="h-2.5 w-2.5" />
          AI
        </span>
      </div>
      <div className="p-3 flex-1 space-y-2">
        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {isRTL ? "قضية #1234 — 18 أبريل 2026" : "Case #1234 — Apr 18, 2026"}
        </div>
        <div className="space-y-1.5">
          {rulings.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px]">
              <span className="mt-1 h-1 w-1 rounded-full bg-purple-500 shrink-0" />
              <span className="text-slate-700 leading-snug">{r}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-100 flex items-start gap-1.5">
          <Clock className="h-3 w-3 text-red-600 mt-0.5 shrink-0" />
          <span className="text-[10px] text-red-700 font-bold">{deadline}</span>
        </div>
      </div>
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <span className="text-[10px] text-[#0F2942] font-bold flex items-center gap-0.5">
          {isRTL ? "فتح المحضر الكامل" : "Open full minutes"}
          <ArrowRight className={cn("h-3 w-3", isRTL && "rotate-180")} />
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Card 5 — Smart Document Intake
   Feature idea: Upload a scanned PDF; Najiz OCR returns the text,
   Silah's AI microservice classifies the document type, pulls out
   parties, dates, clauses, and auto-links it to the right case +
   matching regulations.
   ──────────────────────────────────────────────────────────────*/
function SmartIntakeCard() {
  const { isRTL } = useI18n();
  const docs = [
    {
      name: isRTL ? "عقد_الشراكة.pdf" : "partnership_agreement.pdf",
      kind: isRTL ? "عقد" : "Contract",
      tags: isRTL ? ["الشركات م.23", "طرفان"] : ["Cos. §23", "2 parties"],
      status: "done" as const,
    },
    {
      name: isRTL ? "لائحة_دعوى.pdf" : "statement_of_claim.pdf",
      kind: isRTL ? "لائحة" : "Petition",
      tags: isRTL ? ["تجاري", "OCR جارٍ"] : ["Commercial", "OCR…"],
      status: "processing" as const,
    },
  ];
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[280px]">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2.5 bg-rose-50/50">
        <div className="bg-rose-100 text-rose-700 p-1.5 rounded-lg">
          <ScanLine className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-bold text-[#0F2942] text-sm leading-tight">
            {isRTL ? "استقبال ذكي للمستندات" : "Smart Document Intake"}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            {isRTL ? "OCR من ناجز + تصنيف بالذكاء" : "Najiz OCR + AI classification"}
          </p>
        </div>
      </div>
      <div className="p-3 flex-1 space-y-2">
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center text-center bg-slate-50/50">
          <Upload className="h-4 w-4 text-slate-400 mb-1" />
          <p className="text-[10px] text-slate-500 font-medium leading-snug">
            {isRTL ? "اسحب الملف لتصنيف تلقائي" : "Drop a file for auto-classification"}
          </p>
        </div>
        {docs.map((d, i) => (
          <div key={i} className="p-2 rounded-xl border border-slate-100 bg-white flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <ScanLine className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-[#0F2942] truncate">{d.name}</p>
              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                <span className="text-[9px] px-1 py-px rounded bg-rose-100 text-rose-700 font-bold">
                  {d.kind}
                </span>
                {d.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] px-1 py-px rounded bg-slate-100 text-slate-600 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <span
              className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0",
                d.status === "done"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {d.status === "done"
                ? isRTL ? "جاهز" : "ready"
                : isRTL ? "معالجة" : "processing"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NajizPlaceholders() {
  const { t } = useI18n();
  const cards = [
    CaseSyncCard,
    AgencyLogCard,
    HearingDigestCard,
    SmartIntakeCard,
  ];
  return (
    <>
      <h2 className="text-2xl font-bold font-serif text-[#0F2942] pt-4 border-t border-slate-200 flex items-center gap-2">
        {t("dashboard.najizPlaceholdersTitle")}
        <span className="inline-flex items-center justify-center bg-[#D97706]/15 text-[#D97706] p-1.5 rounded-full">
          <Lock className="h-3.5 w-3.5" />
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((Card, i) => (
          <NajizLockOverlay key={i} variant="tease">
            <Card />
          </NajizLockOverlay>
        ))}
      </div>
    </>
  );
}
