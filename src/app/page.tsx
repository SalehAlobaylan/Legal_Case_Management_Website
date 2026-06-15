"use client";

/*
 * Silah — creative marketing landing page.
 * Adapted from the Claude Design handoff bundle ("connected geometry" motif):
 * getignore.com's floating-decoration energy translated into Silah's navy +
 * orange brand. Saudi legal workflow focus, scroll-reveal,
 * parallax, product mockups, and a geometric "skyline" footer.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Scale,
  BookOpen,
  Sparkles,
  Gavel,
  FileText,
  History,
  CalendarClock,
  Lock,
  Shield,
  MapPin,
  Search,
  Check,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useMuseumLogin } from "@/lib/hooks/use-auth";

/* ──────────────────────────── tokens (literals) ─────────────────────────── */
const NAVY = { 900: "#0a1c2e", 800: "#0F2942", 700: "#152e46", 600: "#1E3A56", 500: "#2A4D70" };
const ORANGE = { 700: "#92400e", 600: "#B45309", 500: "#D97706", 400: "#fb923c" };
const SLATE_200 = "#e5e7eb";
const SLATE_600 = "#4b5563";
const SHADOW_XS = "0 1px 2px 0 rgb(0 0 0 / 0.05)";
const SHADOW_MD = "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";

/* ──────────────────────────── icon map ──────────────────────────── */
const ICONS: Record<string, LucideIcon> = {
  scale: Scale,
  bookOpen: BookOpen,
  sparkles: Sparkles,
  gavel: Gavel,
  fileText: FileText,
  history: History,
  calClock: CalendarClock,
  lock: Lock,
  shield: Shield,
  mapPin: MapPin,
  search: Search,
  check: Check,
  arrowUR: ArrowUpRight,
};

function Icon({
  name,
  size = 20,
  className = "",
  stroke = 2,
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  stroke?: number;
  style?: CSSProperties;
}) {
  const Cmp = ICONS[name] ?? Scale;
  return <Cmp size={size} strokeWidth={stroke} className={className} style={style} aria-hidden="true" />;
}

/* ──────────────────────────── bilingual copy ─────────────────────────── */
type Finding = { t: string; d: string; m: string };
type AlertItem = { icon: string; name: string; meta: string; desc: string; tag: string; tone: BadgeTone };
type TaskItem = { name: string; meta: string; tag: string; tone: string; who: string; urgent?: boolean };

type Copy = {
  dir: "rtl" | "ltr";
  toggle: string;
  ui: string;
  display: string;
  nav: { links: { id: string; t: string }[]; cta: string };
  hero: { eyebrow: string; title: string[]; sub: string; cta1: string; cta2: string; trust: string };
  analysis: {
    eyebrow: string; title: string[]; body: string;
    caseTitle: string; caseMeta: string; caseText: string;
    aiLabel: string; aiHead: string; findings: Finding[]; disclaimer: string; footer: string;
  };
  regs: { eyebrow: string; title: string[]; body: string; panelTitle: string; panelTime: string; items: AlertItem[] };
  priority: { eyebrow: string; title: string[]; body: string; panelTitle: string; panelTime: string; items: TaskItem[] };
  privacy: { eyebrow: string; title: string[]; body: string; bullets: { icon: string; t: string }[]; seal: string; sealSub: string };
  beta: {
    eyebrow: string; title: string[]; body: string; placeholder: string; button: string;
    success: string; successSub: string; fine: string;
  };
  footer: { tagline: string; cols: { h: string; links: string[] }[]; rights: string; made: string };
  appWindow: {
    greet: string; sub: string; stats: [string, string][]; insight: string;
    case: string; caseMeta: string; open: string; search: string;
  };
};

const COPY: Record<"ar" | "en", Copy> = {
  ar: {
    dir: "rtl", toggle: "EN", ui: "ui-ar", display: "display-ar",
    nav: {
      links: [
        { id: "analysis", t: "التحليل" },
        { id: "regs", t: "التتبّع" },
        { id: "priority", t: "الأولوية" },
        { id: "privacy", t: "الخصوصية" },
      ],
      cta: "استكشف",
    },
    hero: {
      eyebrow: "مدعومة بالذكاء الاصطناعي",
      title: ["كلّ قضية،", "متصلة بنظامها"],
      sub: "صلة تربط قضاياك بالأنظمة السعودية التي تحكمها، وتنبّهك في اللحظة التي تتغيّر فيها.",
      cta1: "استكشف", cta2: "شاهد كيف تعمل",
      trust: "مصممة لسير العمل القانوني في المملكة",
    },
    analysis: {
      eyebrow: "تحليل القضايا بالذكاء الاصطناعي",
      title: ["تقرأ النظام،", "لا القضية فقط"],
      body: "صلة تطالع وقائع قضيتك، ثم تستحضر المواد والأنظمة ذات الصلة — مع نسبة تطابق لكل مصدر، وتنبيه صريح بمراجعة النص الأصلي قبل الاعتماد عليه.",
      caseTitle: "نزاع عمّالي — فصل تعسّفي",
      caseMeta: "قضية رقم ‎CASE-2025-١٤٢",
      caseText: "أنهى صاحب العمل عقد الموكّل دون إشعار مكتوب بعد ٤ سنوات من الخدمة، مع وجود مستحقات نهاية خدمة غير مسدّدة.",
      aiLabel: "تحليل صلة",
      aiHead: "وُجدت ٣ أنظمة ذات صلة",
      findings: [
        { t: "نظام العمل — المادة ٧٧", d: "تعويض الفصل دون سبب مشروع", m: "٩٨٪" },
        { t: "نظام العمل — المادة ٨٥", d: "احتساب مكافأة نهاية الخدمة", m: "٩٤٪" },
        { t: "اللائحة التنفيذية — الفصل الخامس", d: "إجراءات الإشعار والإنهاء", m: "٨٧٪" },
      ],
      disclaimer: "مُولّد بالذكاء الاصطناعي — راجع النص الأصلي قبل الاعتماد عليه.",
      footer: "وُلّد قبل دقيقتين · مستوى الثقة ٨٧٪",
    },
    regs: {
      eyebrow: "تتبّع تغيّر الأنظمة",
      title: ["حين يتغيّر النظام،", "تعرف أثره فورًا"],
      body: "لا تكتشف التعديل متأخرًا. صلة تراقب الأنظمة المرتبطة بقضاياك، وتُظهر لك القضايا المتأثرة لحظة صدور أي تعديل.",
      panelTitle: "تنبيهات نظامية",
      panelTime: "اليوم ٩:٤١",
      items: [
        { icon: "gavel", name: "نظام العمل — المادة ٧٧", meta: "الآن", desc: "تعديل على صياغة التعويض", tag: "٣ قضايا متأثرة", tone: "accent" },
        { icon: "bookOpen", name: "لائحة المنافسات والمشتريات", meta: "منذ ساعتين", desc: "إصدار نسخة جديدة", tag: "نسخة جديدة", tone: "warning" },
        { icon: "fileText", name: "نظام المعاملات المدنية", meta: "أمس", desc: "مقارنة جاهزة للمراجعة", tag: "المقارنة جاهزة", tone: "info" },
        { icon: "history", name: "نظام الإثبات", meta: "منذ ٣ أيام", desc: "لا تغييرات مؤثرة", tag: "تمت المراجعة", tone: "success" },
      ],
    },
    priority: {
      eyebrow: "ما الذي يحتاجك الآن",
      title: ["ليست كل قضية", "تحتاجك في هذه اللحظة"],
      body: "جلسة غدًا، مراجعة معلّقة، موكّل ينتظر ردًا — صلة ترتّب يومك حسب الأولوية، فتبدأ بما يهم وتؤجّل ما يحتمل الانتظار.",
      panelTitle: "مهام اليوم",
      panelTime: "الثلاثاء · ٤ مهام",
      items: [
        { name: "شركة الأفق · نزاع عمّالي", meta: "جلسة غدًا ٩ ص", tag: "عاجل", tone: "accent", who: "الأفق", urgent: true },
        { name: "مؤسسة البيان · عقد توريد", meta: "مذكرة بانتظار المراجعة", tag: "مراجعة معلّقة", tone: "warning", who: "البيان" },
        { name: "أحمد الزهراني · توكيل", meta: "بانتظار ردّ الموكّل", tag: "منذ ٣ أيام", tone: "default", who: "أحمد" },
        { name: "أرشيف ٢٠٢٤ · قضايا مغلقة", meta: "لا إجراء مطلوب", tag: "مؤرشف", tone: "muted", who: "أرشيف" },
      ],
    },
    privacy: {
      eyebrow: "أمان المؤسسات",
      title: ["بياناتك", "محمية بالكامل"],
      body: "معلومات منشأتك معزولة تماماً. تحكم بدقة في صلاحيات فريقك، وتتبع كل إجراء لضمان الشفافية والمسؤولية الكاملة.",
      bullets: [
        { icon: "shield", t: "عزل تام لبيانات المنشأة" },
        { icon: "users", t: "صلاحيات مخصصة للفريق" },
        { icon: "key", t: "وصول آمن" },
        { icon: "history", t: "سجل كامل للنشاطات" },
      ],
      seal: "آمن ومحمي",
      sealSub: "صلاحيات · سجل نشاطات",
    },
    beta: {
      eyebrow: "نسخة تجريبية خاصة",
      title: ["انضمّ مبكرًا", "إلى صلة"],
      body: "اترك بريدك، وسنرسل لك دعوة فور جاهزية النسخة التجريبية.",
      placeholder: "بريدك الإلكتروني",
      button: "اطلب دعوة",
      success: "تم تسجيلك في القائمة",
      successSub: "سنتواصل معك لحظة فتح النسخة التجريبية.",
      fine: "بلا إزعاج — رسالة واحدة فقط عند جاهزية مقعدك.",
    },
    footer: {
      tagline: "تربط القضايا بالأنظمة، والمحامين بما يهم.",
      cols: [
        { h: "المنتج", links: ["التحليل", "التتبّع", "الأولوية"] },
        { h: "الشركة", links: ["من نحن", "المدوّنة", "الوظائف"] },
        { h: "قانوني", links: ["الخصوصية", "الشروط", "الامتثال"] },
      ],
      rights: "© ٢٠٢٦ صلة. جميع الحقوق محفوظة.",
      made: "صُنع في المملكة العربية السعودية",
    },
    appWindow: {
      greet: "أهلاً، أستاذ صالح", sub: "نظرة سريعة على يومك",
      stats: [["قضايا", "١٢"], ["موكّلون", "٤٧"], ["تنبيهات", "٣"]],
      insight: "المادة ٧٧ عُدّلت — ٣ قضايا متأثرة",
      case: "شركة الأفق · نزاع عمّالي", caseMeta: "جلسة غدًا ٩ ص",
      open: "مفتوحة", search: "ابحث في القضايا والأنظمة…",
    },
  },
  en: {
    dir: "ltr", toggle: "ع", ui: "ui-en", display: "display-en",
    nav: {
      links: [
        { id: "analysis", t: "Analysis" },
        { id: "regs", t: "Tracking" },
        { id: "priority", t: "Priority" },
        { id: "privacy", t: "Privacy" },
      ],
      cta: "Explore",
    },
    hero: {
      eyebrow: "Powered by AI",
      title: ["Every case,", "linked to its law"],
      sub: "Silah connects your cases to the Saudi regulations that govern them — and alerts you the moment they change.",
      cta1: "Explore", cta2: "See how it works",
      trust: "Built for Saudi legal workflows",
    },
    analysis: {
      eyebrow: "AI Case Analysis",
      title: ["It reads the law,", "not just the case"],
      body: "Silah studies the facts of your case, then surfaces the relevant articles and regulations — each with a match score and a clear prompt to verify the original text before relying on it.",
      caseTitle: "Labor Dispute — Wrongful Termination",
      caseMeta: "Case #CASE-2025-142",
      caseText: "The employer ended the client’s contract without written notice after 4 years of service, with unpaid end-of-service entitlements.",
      aiLabel: "Silah Analysis",
      aiHead: "Found 3 relevant regulations",
      findings: [
        { t: "Labor Law — Article 77", d: "Compensation for termination without cause", m: "98%" },
        { t: "Labor Law — Article 85", d: "End-of-service award calculation", m: "94%" },
        { t: "Executive Regulation — Ch. 5", d: "Notice and termination procedure", m: "87%" },
      ],
      disclaimer: "AI generated — verify against the original text before relying on it.",
      footer: "Generated 2 minutes ago · Confidence 87%",
    },
    regs: {
      eyebrow: "Regulation-Change Tracking",
      title: ["When a law changes,", "know its impact at once"],
      body: "Never find out late. Silah watches the regulations linked to your cases and shows you exactly which ones are affected the moment an amendment lands.",
      panelTitle: "Regulation Alerts",
      panelTime: "Today 9:41",
      items: [
        { icon: "gavel", name: "Labor Law — Article 77", meta: "now", desc: "Compensation wording amended", tag: "3 cases affected", tone: "accent" },
        { icon: "bookOpen", name: "Procurement Bylaw", meta: "2h", desc: "New version issued", tag: "New version", tone: "warning" },
        { icon: "fileText", name: "Civil Transactions Law", meta: "yesterday", desc: "Comparison ready to review", tag: "Comparison ready", tone: "info" },
        { icon: "history", name: "Law of Evidence", meta: "3d", desc: "No material changes", tag: "Reviewed", tone: "success" },
      ],
    },
    priority: {
      eyebrow: "What needs you now",
      title: ["Not every case", "needs you right now"],
      body: "A hearing tomorrow, a pending review, a client awaiting reply — Silah orders your day by priority, so you start with what matters and defer what can wait.",
      panelTitle: "Today’s Tasks",
      panelTime: "Tuesday · 4 tasks",
      items: [
        { name: "Ufuq Co. · Labor dispute", meta: "Hearing tomorrow 9 AM", tag: "Urgent", tone: "accent", who: "Ufuq", urgent: true },
        { name: "Bayan Est. · Supply contract", meta: "Brief awaiting review", tag: "Pending review", tone: "warning", who: "Bayan" },
        { name: "Ahmed Alzahrani · Mandate", meta: "Awaiting client reply", tag: "3 days", tone: "default", who: "Ahmed" },
        { name: "Archive 2024 · Closed cases", meta: "No action needed", tag: "Archived", tone: "muted", who: "Arch" },
      ],
    },
    privacy: {
      eyebrow: "Enterprise Security",
      title: ["Your data is", "strictly protected"],
      body: "Your firm's information is completely walled off. Control exactly who sees what, and track every action with complete accountability.",
      bullets: [
        { icon: "shield", t: "Strict firm isolation" },
        { icon: "users", t: "Custom team permissions" },
        { icon: "key", t: "Secure access" },
        { icon: "history", t: "Complete activity logs" },
      ],
      seal: "Secure & Protected",
      sealSub: "Permissions · Activity Logs",
    },
    beta: {
      eyebrow: "Private beta",
      title: ["Join Silah", "early"],
      body: "Drop your email and we’ll send an invite the moment the beta is ready.",
      placeholder: "Your email address",
      button: "Request access",
      success: "You’re on the list",
      successSub: "We’ll be in touch the moment the beta opens.",
      fine: "No spam — just one email when your seat is ready.",
    },
    footer: {
      tagline: "Linking cases to laws, and lawyers to what matters.",
      cols: [
        { h: "Product", links: ["Analysis", "Tracking", "Priority"] },
        { h: "Company", links: ["About", "Blog", "Careers"] },
        { h: "Legal", links: ["Privacy", "Terms", "Compliance"] },
      ],
      rights: "© 2026 Silah. All rights reserved.",
      made: "Made in Saudi Arabia",
    },
    appWindow: {
      greet: "Welcome, Counsel", sub: "A quick view of your day",
      stats: [["Cases", "12"], ["Clients", "47"], ["Alerts", "3"]],
      insight: "Article 77 amended — 3 cases affected",
      case: "Ufuq Co. · Labor dispute", caseMeta: "Hearing tomorrow 9 AM",
      open: "Open", search: "Search cases & regulations…",
    },
  },
};

/* ──────────────────────────── primitives ─────────────────────────── */
type BadgeTone = "accent" | "warning" | "info" | "success" | "default" | "muted";

const BADGE_TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  accent: { bg: "rgba(217,119,6,0.12)", fg: "#B45309" },
  warning: { bg: "#fef3c7", fg: "#B45309" },
  info: { bg: "#dbeafe", fg: "#1d4ed8" },
  success: { bg: "#dcfce7", fg: "#15803d" },
  default: { bg: "#f3f4f6", fg: "#4b5563" },
  muted: { bg: "#f3f4f6", fg: "#9ca3af" },
};

function Badge({ tone = "default", children }: { tone?: BadgeTone; children: ReactNode }) {
  const c = BADGE_TONES[tone] ?? BADGE_TONES.default;
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
      style={{ background: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
}

const AVATAR_BG = ["#0F2942", "#D97706", "#1E3A56", "#2A4D70"];
function Avatar({ name, size = 38, idx = 0 }: { name: string; size?: number; idx?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-xl font-extrabold text-white shrink-0"
      style={{ width: size, height: size, background: AVATAR_BG[idx % AVATAR_BG.length], fontSize: size * 0.4 }}
    >
      {[...name][0]}
    </span>
  );
}

/* ──────────────────────────── decorations ─────────────────────────── */
function Deco({
  children, x, y, anim = "", par = 0, z = 0, style = {},
}: {
  children: ReactNode; x?: CSSProperties; y?: CSSProperties; anim?: string; par?: number; z?: number; style?: CSSProperties;
}) {
  return (
    <div
      data-par={par}
      className={anim}
      aria-hidden="true"
      style={{ position: "absolute", ...x, ...y, zIndex: z, pointerEvents: "none", willChange: "transform", ...style }}
    >
      {children}
    </div>
  );
}

function Squircle({ s = 64, fill = "none", stroke, rot = 0, radius }: { s?: number; fill?: string; stroke?: string; rot?: number; radius?: number }) {
  return (
    <div style={{ width: s, height: s, borderRadius: radius ?? s * 0.34, background: fill, border: stroke ? `2px solid ${stroke}` : "none", transform: `rotate(${rot}deg)` }} />
  );
}

function DotPair({ s = 14, gap = 8, color = ORANGE[500] }: { s?: number; gap?: number; color?: string }) {
  return (
    <div style={{ display: "flex", gap }}>
      {[0, 1].map((i) => (
        <div key={i} style={{ width: s, height: s, background: color, borderRadius: s * 0.28, transform: "rotate(45deg)" }} />
      ))}
    </div>
  );
}

function OrbitRing({ s = 120, stroke = "rgba(15,41,66,0.16)", dotColor = ORANGE[500], reverse = false }: { s?: number; stroke?: string; dotColor?: string; reverse?: boolean }) {
  return (
    <div style={{ position: "relative", width: s, height: s }}>
      <div className={reverse ? "spin-rev" : "spin-slow"} style={{ position: "absolute", inset: 0 }}>
        <div style={{ width: s, height: s, borderRadius: "50%", border: `2px dashed ${stroke}` }} />
        <div style={{ position: "absolute", top: -5, left: "50%", marginLeft: -5, width: 10, height: 10, borderRadius: "50%", background: dotColor }} />
      </div>
    </div>
  );
}

function PlusMark({ s = 20, color = NAVY[500], w = 2.5 }: { s?: number; color?: string; w?: number }) {
  return (
    <div style={{ position: "relative", width: s, height: s }}>
      <div style={{ position: "absolute", top: "50%", left: 0, width: s, height: w, marginTop: -w / 2, background: color, borderRadius: 99 }} />
      <div style={{ position: "absolute", left: "50%", top: 0, height: s, width: w, marginLeft: -w / 2, background: color, borderRadius: 99 }} />
    </div>
  );
}

function ArcMark({ s = 70, stroke = ORANGE[400], w = 3 }: { s?: number; stroke?: string; w?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <path d="M10 90 A80 80 0 0 1 90 10" stroke={stroke} strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
}

function PulseNode({ s = 12, color = ORANGE[500] }: { s?: number; color?: string }) {
  return (
    <div style={{ position: "relative", width: s, height: s }}>
      <div className="pulse-dot" style={{ width: s, height: s, borderRadius: "50%", background: color }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1.5px solid ${color}`, animation: "silah-pingRing calc(2.8s / var(--mspeed,1)) var(--ease-out) infinite" }} />
    </div>
  );
}

function AmbientOrbs() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div className="drift" data-par="0.12" style={{ position: "absolute", top: "-12%", insetInlineEnd: "-6%", width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.16), rgba(217,119,6,0) 68%)", filter: "blur(20px)" }} />
      <div className="drift" data-par="0.18" style={{ position: "absolute", top: "24%", insetInlineStart: "-14%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,58,86,0.14), rgba(30,58,86,0) 70%)", filter: "blur(20px)", animationDelay: "-6s" }} />
      <div className="drift" data-par="0.1" style={{ position: "absolute", top: "64%", insetInlineEnd: "6%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,146,60,0.12), rgba(251,146,60,0) 70%)", filter: "blur(18px)", animationDelay: "-11s" }} />
    </div>
  );
}

type WebPoint = { x: number; y: number; r?: number; color?: string };
function ConnectionWeb({ w = 560, h = 360, points, lines, className = "", style = {} }: { w?: number; h?: number; points: WebPoint[]; lines: [number, number][]; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden="true" style={{ overflow: "visible", ...style }}>
      {lines.map(([a, b], k) => {
        const p1 = points[a], p2 = points[b];
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        return (
          <line key={k} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(15,41,66,0.18)" strokeWidth="1.5" strokeDasharray={len} strokeDashoffset={len}
            style={{ animation: `silah-dash calc(2.2s / var(--mspeed,1)) var(--ease-out) ${0.2 + k * 0.15}s forwards` }} />
        );
      })}
      {points.map((p, k) => (
        <g key={"p" + k}>
          <circle cx={p.x} cy={p.y} r={(p.r || 5) + 4} fill={p.color || ORANGE[500]} opacity="0.14" />
          <circle cx={p.x} cy={p.y} r={p.r || 5} fill={p.color || ORANGE[500]} />
        </g>
      ))}
    </svg>
  );
}

/* ──────────────────────────── in-view hook ─────────────────────────── */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

/* ──────────────────────────── mockups ─────────────────────────── */
function WinDots() {
  return (
    <div className="flex gap-1.5">
      {["#ef4444", "#f59e0b", "#22c55e"].map((c) => <span key={c} className="w-3 h-3 rounded-full" style={{ background: c, opacity: 0.85 }} />)}
    </div>
  );
}

function AppWindow({ L }: { L: Copy }) {
  const t = L.appWindow;
  return (
    <div dir={L.dir} className={`${L.ui} bg-white rounded-[26px] border border-gray-100 overflow-hidden`}
      style={{ width: "100%", boxShadow: "0 40px 80px -24px rgba(15,41,66,0.34), 0 12px 28px -12px rgba(15,41,66,0.22)" }}>
      <div className="h-11 px-4 flex items-center justify-between bg-[#0F2942]">
        <WinDots />
        <div className="flex items-center gap-2 text-white/85">
          <Image src="/circle-logo-silah.png" alt="" width={20} height={20} className="w-5 h-5 rounded-full" />
          <span className="text-[13px] font-bold tracking-wide" style={{ fontFamily: "var(--font-kufi)" }}>صلة</span>
        </div>
        <div className="w-12" />
      </div>
      <div className="px-5 pt-4">
        <div className="h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2 px-3 text-gray-400">
          <Icon name="search" size={16} />
          <span className="text-[12px] font-medium truncate">{t.search}</span>
          <span className="ms-auto"><Icon name="sparkles" size={14} className="text-[#D97706]" /></span>
        </div>
      </div>
      <div className="px-5 pt-4">
        <div className="text-[15px] font-bold text-[#0F2942]">{t.greet}</div>
        <div className="text-[12px] text-gray-500 font-medium">{t.sub}</div>
      </div>
      <div className="px-5 pt-3 grid grid-cols-3 gap-2.5">
        {t.stats.map(([k, v], i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-3 text-center" style={{ boxShadow: SHADOW_XS }}>
            <div className="text-3xl font-serif font-bold text-[#0F2942] leading-none">{v}</div>
            <div className="text-[10.5px] text-gray-500 font-semibold mt-1.5">{k}</div>
          </div>
        ))}
      </div>
      <div className="px-5 pt-3">
        <div className="rounded-2xl p-3 flex items-center gap-2.5" style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.18)" }}>
          <span className="w-7 h-7 rounded-lg bg-[#D97706] text-white flex items-center justify-center shrink-0"><Icon name="sparkles" size={14} /></span>
          <span className="text-[12px] font-semibold text-[#92400e] leading-snug">{t.insight}</span>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="rounded-2xl border border-gray-100 p-3 flex items-center gap-3" style={{ boxShadow: SHADOW_XS }}>
          <span className="w-9 h-9 rounded-xl bg-[#0F2942] text-white flex items-center justify-center shrink-0"><Icon name="scale" size={17} /></span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-bold text-[#0F2942] truncate">{t.case}</div>
            <div className="text-[11px] text-gray-500 font-medium truncate flex items-center gap-1"><Icon name="calClock" size={12} className="text-[#D97706]" />{t.caseMeta}</div>
          </div>
          <Badge tone="info">{t.open}</Badge>
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({ c, L }: { c: Copy["analysis"]; L: Copy }) {
  const [ref, seen] = useInView(0.35);
  return (
    <div ref={ref} dir={L.dir} className={`${L.ui} w-full max-w-[440px]`}>
      <div className="bg-white rounded-[22px] border border-gray-100 p-5" style={{ boxShadow: SHADOW_MD }}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[13px] font-bold text-[#0F2942]">{c.caseTitle}</span>
          <span className="landing-mono text-[10px] text-gray-400">{c.caseMeta}</span>
        </div>
        <p className="text-[12.5px] leading-relaxed text-gray-600 font-medium m-0">{c.caseText}</p>
      </div>
      <div className="flex justify-center py-2">
        <div style={{ width: 2, height: 22, background: "linear-gradient(#D9770644, #D97706)" }} />
      </div>
      <div className="bg-white rounded-[22px] border border-gray-100 overflow-hidden" style={{ boxShadow: "0 24px 50px -20px rgba(15,41,66,0.28)" }}>
        <div className="px-5 pt-4 pb-3 flex items-center gap-2.5 border-b border-gray-100">
          <span className="w-8 h-8 rounded-xl bg-[#D97706] text-white flex items-center justify-center"><Icon name="sparkles" size={16} /></span>
          <div className="leading-tight">
            <div className="text-[12px] font-bold text-[#0F2942]">{c.aiLabel}</div>
            <div className="text-[13px] font-extrabold text-[#92400e]">{c.aiHead}</div>
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {c.findings.map((f, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 flex items-center gap-3"
              style={{ opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(10px)", transition: `all .5s var(--ease-out) ${0.25 + i * 0.18}s` }}>
              <span className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-[#0F2942] flex items-center justify-center shrink-0"><Icon name="bookOpen" size={15} /></span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-[#0F2942] truncate">{f.t}</div>
                <div className="text-[11px] text-gray-500 font-medium truncate">{f.d}</div>
              </div>
              <span className="text-[11px] font-extrabold text-[#16a34a] shrink-0">{f.m}</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-2.5 flex items-center gap-2 border-t border-gray-100" style={{ background: "rgba(217,119,6,0.05)" }}>
          <Icon name="sparkles" size={12} className="text-[#D97706] shrink-0" />
          <span className="text-[10.5px] text-gray-500 font-medium leading-snug">{c.disclaimer}</span>
        </div>
        <div className="px-5 py-2 text-[10px] text-gray-400 font-medium border-t border-gray-100 landing-mono">{c.footer}</div>
      </div>
    </div>
  );
}

function ListPanel({ title, time, children, L }: { title: string; time: string; children: ReactNode; L: Copy }) {
  return (
    <div dir={L.dir} className={`${L.ui} bg-white rounded-[26px] border border-gray-100 overflow-hidden w-full max-w-[440px]`}
      style={{ boxShadow: "0 36px 70px -26px rgba(15,41,66,0.3)" }}>
      <div className="px-5 h-14 flex items-center justify-between border-b border-gray-100">
        <span className="text-[14px] font-extrabold text-[#0F2942]">{title}</span>
        <span className="text-[11px] text-gray-400 font-semibold landing-mono">{time}</span>
      </div>
      <div className="p-2.5 flex flex-col">{children}</div>
    </div>
  );
}

function AlertList({ c, L }: { c: Copy["regs"]; L: Copy }) {
  const [ref, seen] = useInView(0.3);
  return (
    <div ref={ref} className="w-full flex justify-center">
      <ListPanel title={c.panelTitle} time={c.panelTime} L={L}>
        {c.items.map((it, i) => {
          const hot = i === 0;
          return (
            <div key={i} className="rounded-2xl p-3 flex items-center gap-3 transition-all"
              style={{ background: hot ? "rgba(217,119,6,0.06)" : "transparent", border: hot ? "1px solid rgba(217,119,6,0.2)" : "1px solid transparent",
                opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(12px)", transition: `all .55s var(--ease-out) ${i * 0.12}s` }}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: hot ? "#D97706" : "#f3f4f6", color: hot ? "#fff" : "#0F2942" }}><Icon name={it.icon} size={18} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-bold text-[#0F2942] truncate">{it.name}</span>
                  <span className="text-[10.5px] text-gray-400 font-semibold shrink-0">{it.meta}</span>
                </div>
                <div className="text-[11.5px] text-gray-500 font-medium truncate mt-0.5">{it.desc}</div>
                <div className="mt-1.5"><Badge tone={it.tone}>{it.tag}</Badge></div>
              </div>
            </div>
          );
        })}
      </ListPanel>
    </div>
  );
}

function PriorityList({ c, L }: { c: Copy["priority"]; L: Copy }) {
  const [ref, seen] = useInView(0.3);
  return (
    <div ref={ref} className="w-full flex justify-center">
      <ListPanel title={c.panelTitle} time={c.panelTime} L={L}>
        {c.items.map((it, i) => (
          <div key={i} className="rounded-2xl p-3 flex items-center gap-3"
            style={{ background: it.urgent ? "#0F2942" : "transparent",
              opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(12px)", transition: `all .55s var(--ease-out) ${i * 0.12}s` }}>
            <Avatar name={it.who} size={38} idx={i} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] font-bold truncate" style={{ color: it.urgent ? "#fff" : "#0F2942" }}>{it.name}</span>
                <span className="text-[10.5px] font-semibold shrink-0" style={{ color: it.urgent ? "rgba(255,255,255,.6)" : "#9ca3af" }}>{it.tag}</span>
              </div>
              <div className="text-[11.5px] font-medium truncate mt-0.5 flex items-center gap-1" style={{ color: it.urgent ? "rgba(255,255,255,.78)" : "#6b7280" }}>
                {it.urgent && <Icon name="calClock" size={12} className="text-[#fb923c]" />}{it.meta}
              </div>
            </div>
            {it.urgent
              ? <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md bg-[#D97706] text-white shrink-0">{it.tag}</span>
              : <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: it.tone === "warning" ? "#D97706" : it.tone === "muted" ? "#d1d5db" : "#cbd5e1" }} />}
          </div>
        ))}
      </ListPanel>
    </div>
  );
}

/* ──────────────────────────── header atoms ─────────────────────────── */
function Pill({ children, invert = false }: { children: ReactNode; invert?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
      style={invert
        ? { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }
        : { background: "#fff", border: `1px solid ${SLATE_200}`, boxShadow: SHADOW_XS }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] pulse-dot" />
      <span style={{ fontFamily: "inherit", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: invert ? "rgba(255,255,255,0.82)" : "#B45309" }}>{children}</span>
    </span>
  );
}

function Title({ lines, D, size = "lg", invert = false }: { lines: string[]; D: Copy; size?: "xl" | "lg" | "md"; invert?: boolean }) {
  const sizes = {
    xl: "text-[40px] sm:text-[58px] lg:text-[68px]",
    lg: "text-[34px] sm:text-[46px] lg:text-[52px]",
    md: "text-[30px] sm:text-[40px]",
  };
  return (
    <h2 className={`${D.display} ${sizes[size]} m-0`} style={{ lineHeight: 1.12, color: invert ? "#fff" : "#0F2942" }}>
      {lines.map((l, i) => (
        <span key={i} className="block">{i === lines.length - 1 ? <span className="gradtext" style={invert ? { WebkitTextFillColor: "#fb923c", color: "#fb923c", background: "none" } : undefined}>{l}</span> : l}</span>
      ))}
    </h2>
  );
}

function Lead({ children, invert = false, className = "" }: { children: ReactNode; invert?: boolean; className?: string }) {
  return <p className={`${className} text-[16px] sm:text-[18px] leading-relaxed font-medium m-0`}
    style={{ color: invert ? "rgba(255,255,255,0.74)" : SLATE_600, maxWidth: "46ch", textWrap: "pretty" }}>{children}</p>;
}

const SECTION = "relative w-full overflow-hidden";
const WRAP = "relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8";

/* ──────────────────────────── sections ─────────────────────────── */
function Hero({ D, onCta, onSecondary }: { D: Copy; onCta: () => void; onSecondary: () => void }) {
  const c = D.hero;
  return (
    <section className={SECTION} style={{ paddingTop: 132, paddingBottom: 96 }}>
      <AmbientOrbs />
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Deco x={{ insetInlineStart: "6%" }} y={{ top: 150 }} anim="floatA" par={0.25}><Squircle s={58} fill="rgba(217,119,6,0.12)" radius={20} rot={-12} /></Deco>
        <Deco x={{ insetInlineStart: "14%" }} y={{ top: 360 }} anim="floatC" par={0.4}><DotPair s={13} /></Deco>
        <Deco x={{ insetInlineStart: "3%" }} y={{ bottom: 120 }} anim="floatB" par={0.18}><OrbitRing s={104} /></Deco>
        <Deco x={{ insetInlineEnd: "7%" }} y={{ top: 120 }} anim="floatB" par={0.3}><Squircle s={42} stroke="rgba(15,41,66,0.18)" radius={14} rot={18} /></Deco>
        <Deco x={{ insetInlineEnd: "4%" }} y={{ top: 300 }} anim="floatA" par={0.5}><ArcMark s={84} /></Deco>
        <Deco x={{ insetInlineEnd: "16%" }} y={{ bottom: 90 }} anim="floatC" par={0.22}><PlusMark s={22} color="rgba(217,119,6,0.6)" /></Deco>
        <Deco x={{ insetInlineEnd: "24%" }} y={{ top: 90 }} anim="floatC" par={0.34}><PulseNode s={12} /></Deco>
      </div>

      <div className={`${WRAP} grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center`}>
        <div className="text-center lg:text-start">
          <div className="reveal flex justify-center lg:justify-start"><Pill>{c.eyebrow}</Pill></div>
          <div className="reveal reveal-d1 mt-5"><Title lines={c.title} D={D} size="xl" /></div>
          <div className="reveal reveal-d2 mt-6 flex justify-center lg:justify-start"><Lead>{c.sub}</Lead></div>
          <div className="reveal reveal-d3 mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
            <button onClick={onCta}
              className="h-14 px-8 rounded-2xl bg-[#D97706] text-white text-[16px] font-bold inline-flex items-center gap-2 transition-all hover:bg-[#B45309] hover:-translate-y-0.5"
              style={{ boxShadow: "0 10px 25px -5px rgba(146,64,14,0.4)" }}>
              {c.cta1}<Icon name="arrowUR" size={18} className="rtl:-scale-x-100" />
            </button>
            <button onClick={onSecondary}
              className="h-14 px-7 rounded-2xl bg-white text-[#0F2942] text-[16px] font-bold border-2 border-gray-200 inline-flex items-center gap-2 transition-all hover:border-[#D97706] hover:bg-orange-50/40">
              {c.cta2}
            </button>
          </div>
          <div className="reveal reveal-d4 mt-7 flex items-center gap-2.5 justify-center lg:justify-start text-gray-500">
            <Icon name="check" size={15} className="text-[#16a34a]" />
            <span className="text-[12.5px] font-semibold">{c.trust}</span>
          </div>
        </div>

        <div className="relative reveal reveal-d2">
          <ConnectionWeb className="absolute floatC" style={{ insetInlineEnd: -40, top: -46, zIndex: 0 }} w={420} h={300}
            points={[{ x: 30, y: 40, r: 5, color: "#D97706" }, { x: 200, y: 18, r: 4, color: "#1E3A56" }, { x: 380, y: 70, r: 6, color: "#fb923c" }, { x: 120, y: 130, r: 4, color: "#1E3A56" }]}
            lines={[[0, 1], [1, 2], [0, 3], [3, 1]]} />
          <div data-par="-0.08" className="relative z-10 floatA" style={{ maxWidth: 420, margin: "0 auto" }}>
            <AppWindow L={D} />
          </div>
          <Deco x={{ insetInlineStart: -28 }} y={{ bottom: -26 }} anim="floatB" par={0.3} z={20}><DotPair s={16} /></Deco>
          <Deco x={{ insetInlineEnd: -20 }} y={{ bottom: 40 }} anim="floatC" par={0.4} z={5}><Squircle s={46} fill="rgba(15,41,66,0.06)" stroke="rgba(15,41,66,0.14)" radius={15} rot={-10} /></Deco>
        </div>
      </div>
    </section>
  );
}

function AnalysisSection({ D }: { D: Copy }) {
  const c = D.analysis;
  return (
    <section id="analysis" className={SECTION} style={{ paddingBlock: 110 }}>
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Deco x={{ insetInlineStart: "8%" }} y={{ top: 60 }} anim="floatA" par={0.3}><OrbitRing s={84} reverse /></Deco>
        <Deco x={{ insetInlineEnd: "10%" }} y={{ bottom: 70 }} anim="floatC" par={0.24}><DotPair s={12} /></Deco>
      </div>
      <div className={`${WRAP} grid lg:grid-cols-2 gap-14 items-center`}>
        <div className="order-2 lg:order-1 flex justify-center reveal"><AnalysisCard c={c} L={D} /></div>
        <div className="order-1 lg:order-2">
          <div className="reveal"><Pill>{c.eyebrow}</Pill></div>
          <div className="reveal reveal-d1 mt-5"><Title lines={c.title} D={D} /></div>
          <div className="reveal reveal-d2 mt-6"><Lead>{c.body}</Lead></div>
        </div>
      </div>
    </section>
  );
}

function RegsSection({ D }: { D: Copy }) {
  const c = D.regs;
  return (
    <section id="regs" className={SECTION} style={{ paddingBlock: 110, background: "linear-gradient(180deg, transparent, rgba(15,41,66,0.025) 50%, transparent)" }}>
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Deco x={{ insetInlineEnd: "6%" }} y={{ top: 80 }} anim="floatB" par={0.34}><Squircle s={54} fill="rgba(217,119,6,0.1)" radius={18} rot={14} /></Deco>
        <Deco x={{ insetInlineStart: "5%" }} y={{ bottom: 90 }} anim="floatA" par={0.2}><ArcMark s={72} stroke="rgba(15,41,66,0.16)" /></Deco>
        <Deco x={{ insetInlineStart: "46%" }} y={{ top: 40 }} anim="floatC" par={0.4}><PulseNode /></Deco>
      </div>
      <div className={`${WRAP} grid lg:grid-cols-2 gap-14 items-center`}>
        <div>
          <div className="reveal"><Pill>{c.eyebrow}</Pill></div>
          <div className="reveal reveal-d1 mt-5"><Title lines={c.title} D={D} /></div>
          <div className="reveal reveal-d2 mt-6"><Lead>{c.body}</Lead></div>
        </div>
        <div className="reveal reveal-d1"><AlertList c={c} L={D} /></div>
      </div>
    </section>
  );
}

function PrioritySection({ D }: { D: Copy }) {
  const c = D.priority;
  return (
    <section id="priority" className={SECTION} style={{ paddingBlock: 110 }}>
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Deco x={{ insetInlineStart: "7%" }} y={{ top: 70 }} anim="floatC" par={0.3}><OrbitRing s={96} /></Deco>
        <Deco x={{ insetInlineEnd: "8%" }} y={{ bottom: 80 }} anim="floatB" par={0.26}><DotPair s={14} /></Deco>
        <Deco x={{ insetInlineEnd: "40%" }} y={{ bottom: 40 }} anim="floatA" par={0.42}><PlusMark s={20} color="rgba(15,41,66,0.4)" /></Deco>
      </div>
      <div className={`${WRAP} grid lg:grid-cols-2 gap-14 items-center`}>
        <div className="order-2 lg:order-1 reveal reveal-d1"><PriorityList c={c} L={D} /></div>
        <div className="order-1 lg:order-2">
          <div className="reveal"><Pill>{c.eyebrow}</Pill></div>
          <div className="reveal reveal-d1 mt-5"><Title lines={c.title} D={D} /></div>
          <div className="reveal reveal-d2 mt-6"><Lead>{c.body}</Lead></div>
        </div>
      </div>
    </section>
  );
}

function PrivacySection({ D }: { D: Copy }) {
  const c = D.privacy;
  return (
    <section id="privacy" className={SECTION} style={{ paddingBlock: 120, background: "linear-gradient(165deg, #0F2942 0%, #0a1c2e 100%)" }}>
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="drift" style={{ position: "absolute", top: "-10%", insetInlineStart: "-6%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.18), transparent 68%)", filter: "blur(20px)" }} />
        <div className="drift" style={{ position: "absolute", bottom: "-14%", insetInlineEnd: "-4%", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(42,77,112,0.5), transparent 70%)", filter: "blur(20px)", animationDelay: "-7s" }} />
        <Deco x={{ insetInlineEnd: "12%" }} y={{ top: 70 }} anim="floatA" par={0.3}><OrbitRing s={100} stroke="rgba(255,255,255,0.14)" dotColor="#fb923c" /></Deco>
        <Deco x={{ insetInlineStart: "8%" }} y={{ bottom: 80 }} anim="floatC" par={0.24}><DotPair s={14} /></Deco>
      </div>
      <div className={`${WRAP} grid lg:grid-cols-2 gap-14 items-center`}>
        <div>
          <div className="reveal"><Pill invert>{c.eyebrow}</Pill></div>
          <div className="reveal reveal-d1 mt-5"><Title lines={c.title} D={D} invert /></div>
          <div className="reveal reveal-d2 mt-6"><Lead invert>{c.body}</Lead></div>
          <div className="reveal reveal-d3 mt-8 grid sm:grid-cols-2 gap-3">
            {c.bullets.map((b, i) => (
              <div key={i} className={`${D.ui} flex items-center gap-3 rounded-2xl px-4 py-3.5`} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(217,119,6,0.16)", color: "#fb923c" }}><Icon name={b.icon} size={17} /></span>
                <span className="text-[13.5px] font-semibold text-white/90">{b.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="reveal reveal-d2 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 -m-8" aria-hidden="true">
              <div className="spin-slow w-full h-full rounded-full" style={{ border: "1px dashed rgba(255,255,255,0.16)" }} />
            </div>
            <div className={`${D.ui} relative bg-white/[0.06] rounded-[30px] p-8 text-center`} style={{ border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", width: 300 }}>
              <div className="mx-auto w-16 h-16 rounded-2xl bg-[#D97706] text-white flex items-center justify-center" style={{ boxShadow: "0 10px 25px -5px rgba(217,119,6,0.5)" }}>
                <Icon name="lock" size={26} />
              </div>
              <div className="mt-5 text-white font-extrabold text-[17px]">{c.seal}</div>
              <div className="mt-3 flex items-center justify-center gap-2 text-white/60 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] pulse-dot" /> {c.sealSub}
              </div>
              <div className="mt-6 flex justify-center gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < 4 ? "#fb923c" : "rgba(255,255,255,0.25)" }} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BetaSection({ D }: { D: Copy }) {
  const c = D.beta;
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setLoading(true);
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/waitlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: email.trim(),
            feedbackType: feedbackType || undefined,
            feedbackText: feedbackText.trim() || undefined
          }),
        });
        setDone(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <section id="beta" className={SECTION} style={{ paddingBlock: 110 }}>
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <AmbientOrbs />
        <Deco x={{ insetInlineStart: "12%" }} y={{ top: 60 }} anim="floatC" par={0.3}><OrbitRing s={88} reverse /></Deco>
        <Deco x={{ insetInlineEnd: "14%" }} y={{ bottom: 70 }} anim="floatA" par={0.26}><DotPair s={14} /></Deco>
      </div>
      <div className={WRAP} style={{ maxWidth: 720 }}>
        <div className="reveal relative rounded-[34px] bg-white px-7 sm:px-12 py-12 text-center overflow-hidden"
          style={{ border: `1px solid ${SLATE_200}`, boxShadow: "0 40px 80px -30px rgba(15,41,66,0.28)" }}>
          <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "linear-gradient(90deg,#0F2942,#D97706,#fb923c)" }} />
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#0F2942] text-white flex items-center justify-center mb-6">
            <Image src="/circle-logo-silah.png" alt="" width={40} height={40} className="w-10 h-10 rounded-full" />
          </div>
          <div className="flex justify-center"><Pill>{c.eyebrow}</Pill></div>
          <div className="mt-5 flex justify-center"><Title lines={c.title} D={D} size="md" /></div>
          {!done ? (
            <>
              <div className="mt-5 flex justify-center"><Lead className="text-center">{c.body}</Lead></div>
              <form onSubmit={submit} className={`${D.ui} mt-8 flex flex-col gap-4 max-w-md mx-auto text-start`}>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">البريد الإلكتروني</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={c.placeholder}
                    className="w-full px-5 rounded-xl bg-gray-50 border border-gray-200 text-[15px] font-medium text-[#0F2942] placeholder:text-gray-400 focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors"
                    style={{ height: 52 }} />
                </div>
                
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">هل لديك ملاحظات أو اقتراحات؟ (اختياري)</label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full px-5 rounded-xl bg-gray-50 border border-gray-200 text-[15px] font-medium text-[#0F2942] focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors appearance-none"
                    style={{ height: 52 }}
                  >
                    <option value="" disabled>اختر نوع الملاحظة...</option>
                    <option value="design">ما أعجبك التصميم أو الهوية البصرية؟</option>
                    <option value="ai">ما أعجبتك مزايا الذكاء الاصطناعي؟</option>
                    <option value="missing">تحس أن المنصة ناقصها مزايا مساعدة؟</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                {feedbackType && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">تفاصيل إضافية</label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="شاركنا أفكارك هنا..."
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-[15px] font-medium text-[#0F2942] placeholder:text-gray-400 focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors resize-none"
                      rows={3}
                    />
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full mt-2 rounded-xl bg-[#D97706] text-white text-[15px] font-bold inline-flex items-center justify-center gap-2 transition-all hover:bg-[#B45309] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  style={{ height: 52, boxShadow: "0 10px 25px -5px rgba(146,64,14,0.4)" }}>{loading ? "..." : c.button}</button>
              </form>
            </>
          ) : (
            <div className={`${D.ui} mt-7`} style={{ animation: "silah-bobIn .5s var(--ease-out)" }}>
              <div className="mx-auto w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><Icon name="check" size={28} stroke={2.6} /></div>
              <div className="mt-4 text-[20px] font-extrabold text-[#0F2942]">{c.success}</div>
              <div className="mt-2 text-[14px] text-gray-500 font-medium">{c.successSub}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── shell ─────────────────────────── */
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = window.pageYOffset + el.getBoundingClientRect().top - 84;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function Nav({ D, onToggleLang, onCta }: { D: Copy; onToggleLang: () => void; onCta: () => void }) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 24);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4" style={{ paddingTop: solid ? 12 : 18, transition: "padding .3s var(--ease-out)" }}>
      <nav dir={D.dir} className={`${D.ui} flex items-center gap-1 sm:gap-2 rounded-full transition-all duration-300`}
        style={{ background: solid ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.62)", backdropFilter: "blur(16px)",
          border: "1px solid " + (solid ? "rgba(15,41,66,0.08)" : "rgba(255,255,255,0.5)"),
          boxShadow: solid ? "0 12px 30px -12px rgba(15,41,66,0.2)" : "0 6px 20px -10px rgba(15,41,66,0.12)",
          padding: "8px 8px 8px 16px", maxWidth: 980, width: "100%" }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 shrink-0">
          <Image src="/circle-logo-silah.png" alt="Silah" width={32} height={32} className="w-8 h-8 rounded-full" />
          <span className="text-[19px] font-extrabold text-[#0F2942]" style={{ fontFamily: "var(--font-kufi)" }}>صلة</span>
        </button>
        <div className="hidden md:flex items-center gap-0.5 mx-auto">
          {D.nav.links.map((l) => (
            <button key={l.id} onClick={() => scrollToId(l.id)}
              className="px-3.5 py-2 rounded-full text-[13.5px] font-bold text-gray-600 hover:text-[#0F2942] hover:bg-black/[0.04] transition-colors">{l.t}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0 ms-auto md:ms-0">
          <button onClick={onToggleLang}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-extrabold text-[#0F2942] border border-gray-200 hover:border-[#D97706] hover:bg-orange-50/50 transition-colors">{D.toggle}</button>
          <Link href="/login" className="hidden sm:inline-flex h-10 items-center px-4 rounded-full text-[13.5px] font-bold text-[#0F2942] hover:bg-black/[0.04] transition-colors">
            {D.dir === "rtl" ? "تسجيل الدخول" : "Sign in"}
          </Link>
          <button onClick={onCta}
            className="h-10 px-5 rounded-full bg-[#0F2942] text-white text-[13.5px] font-bold inline-flex items-center gap-1.5 hover:bg-[#1E3A56] transition-colors">
            {D.nav.cta}
          </button>
        </div>
      </nav>
    </div>
  );
}

function Skyline() {
  const bars = [44, 78, 30, 96, 58, 120, 40, 70, 52, 90, 34, 64];
  return (
    <div className="relative h-[150px] w-full overflow-hidden" aria-hidden="true">
      <ConnectionWeb className="absolute" w={560} h={90} style={{ insetInlineStart: "50%", top: 6, transform: "translateX(-50%)" }}
        points={[{ x: 60, y: 50, r: 4, color: "#fb923c" }, { x: 200, y: 20, r: 3, color: "rgba(255,255,255,0.5)" }, { x: 330, y: 44, r: 4, color: "#fb923c" }, { x: 470, y: 16, r: 3, color: "rgba(255,255,255,0.5)" }, { x: 520, y: 56, r: 5, color: "#D97706" }]}
        lines={[[0, 1], [1, 2], [2, 3], [3, 4]]} />
      <div className="absolute spin-slow" style={{ insetInlineEnd: "14%", top: 10, width: 30, height: 30, borderRadius: "50%", background: "radial-gradient(circle,#fb923c,#D97706)", boxShadow: "0 0 30px 6px rgba(217,119,6,0.4)" }} />
      <div className="absolute bottom-0 inset-x-0 flex items-end justify-center gap-2.5 px-6">
        {bars.map((h, i) => (
          <div key={i} className="relative" style={{ width: 30, height: h, borderRadius: "10px 10px 0 0", background: i % 3 === 0 ? "#1E3A56" : "#152e46", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="absolute left-1/2 -translate-x-1/2 rounded-full pulse-dot" style={{ top: 8, width: 5, height: 5, background: i % 2 ? "#fb923c" : "rgba(255,255,255,0.3)", animationDelay: `${i * 0.2}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer({ D }: { D: Copy }) {
  const f = D.footer;
  return (
    <footer dir={D.dir} className={`${D.ui} relative`} style={{ background: "linear-gradient(180deg,#0a1c2e,#081623)" }}>
      <Skyline />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-8 pb-12 pt-4">
        <div className="grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 sm:gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/circle-logo-silah.png" alt="" width={36} height={36} className="w-9 h-9 rounded-full" />
              <span className="text-[22px] font-extrabold text-white" style={{ fontFamily: "var(--font-kufi)" }}>صلة</span>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed font-medium m-0" style={{ color: "rgba(255,255,255,0.6)", maxWidth: "30ch", textWrap: "pretty" }}>{f.tagline}</p>
          </div>
          {f.cols.map((col, i) => (
            <div key={i}>
              <div className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: "#fb923c" }}>{col.h}</div>
              <ul className="mt-4 m-0 p-0 list-none flex flex-col gap-2.5">
                {col.links.map((l, j) => (
                  <li key={j}><a href="#" className="text-[13.5px] font-semibold transition-colors text-white/65 hover:text-white">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>{f.rights}</span>
          <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] pulse-dot" />{f.made}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────── scroll fx ─────────────────────────── */
function useScrollFx() {
  useEffect(() => {
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const show = (el: HTMLElement) => el.classList.add("in");
    const inView = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return r.top < window.innerHeight * 0.98 && r.bottom > 0; };

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((ents) => {
        ents.forEach((e) => { if (e.isIntersecting && io) { show(e.target as HTMLElement); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach((el) => io!.observe(el));
    }
    reveals.forEach((el) => { if (inView(el)) show(el); });
    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => { if (inView(el)) show(el); });
    }, 600);
    const safetyAll = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => {
        el.style.transition = "none"; el.style.opacity = "1"; el.style.transform = "none"; el.classList.add("in");
      });
    }, 2500);

    let raf = 0;
    const pars = Array.from(document.querySelectorAll<HTMLElement>("[data-par]"));
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const vh = window.innerHeight;
        for (const el of pars) {
          const r = el.getBoundingClientRect();
          const fromCenter = (r.top + r.height / 2) - vh / 2;
          const par = parseFloat(el.getAttribute("data-par") || "0") || 0;
          el.style.translate = "0 " + (-fromCenter * par * 0.12).toFixed(1) + "px";
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (io) io.disconnect();
      window.clearTimeout(safety); window.clearTimeout(safetyAll);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll);
    };
  }, []);
}

/* ──────────────────────────── page ─────────────────────────── */
export default function LandingPage() {
  const { locale, toggleLocale } = useI18n();
  const lang: "ar" | "en" = locale === "en" ? "en" : "ar";
  const D = COPY[lang];
  const museumLogin = useMuseumLogin();
  const enterApp = () => museumLogin.mutate();

  useScrollFx();

  return (
    <div
      dir={D.dir}
      className={`landing-root ${D.ui} relative min-h-screen`}
      style={{ background: "#f7f3ec", color: "#0F2942", overflowX: "clip", ["--m" as string]: "1", ["--mspeed" as string]: "1.5" }}
    >
      <Nav D={D} onToggleLang={toggleLocale} onCta={enterApp} />
      <main>
        <Hero D={D} onCta={enterApp} onSecondary={() => scrollToId("analysis")} />
        <AnalysisSection D={D} />
        <RegsSection D={D} />
        <PrioritySection D={D} />
        <PrivacySection D={D} />
        <BetaSection D={D} />
      </main>
      <Footer D={D} />
    </div>
  );
}
