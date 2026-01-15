/**
 * File: src/context/locale-context.tsx
 * Purpose: Locale context for RTL/LTR support and language switching.
 *
 * Features:
 * - Language switching (en/ar)
 * - Automatic RTL handling
 * - Document direction management
 * - Translation helper function
 */

"use client";

import * as React from "react";

/* =============================================================================
   TYPES
   ============================================================================= */

export type Locale = "en" | "ar";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

/* =============================================================================
   TRANSLATIONS
   ============================================================================= */

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Common
    "common.back": "Back",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.noResults": "No results found",
    "common.viewAll": "View All",
    "common.viewDetails": "View Details",

    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.cases": "Cases",
    "nav.regulations": "Regulations",
    "nav.clients": "Clients",
    "nav.alerts": "Alerts",
    "nav.settings": "Settings",
    "nav.newCase": "New Case",

    // Dashboard
    "dashboard.welcome": "Welcome back",
    "dashboard.aiAnalyzed": "Your AI assistant analyzed",
    "dashboard.newCases": "new cases",
    "dashboard.whileAway": "while you were away",
    "dashboard.activeCases": "Active Cases",
    "dashboard.pendingRegulations": "Pending Regulations",
    "dashboard.aiDiscoveries": "AI Discoveries",
    "dashboard.pendingHearings": "Pending Hearings",
    "dashboard.recentCases": "Recent Cases",
    "dashboard.regulationUpdates": "Regulation Updates",

    // Cases
    "cases.title": "Case Management",
    "cases.subtitle": "Manage and track your organization's legal cases",
    "cases.newCase": "New Case",
    "cases.noCases": "No cases found",
    "cases.adjustFilters": "Adjust your filters or create a new case",
    "cases.caseDetails": "Case Details",
    "cases.documents": "Documents",
    "cases.uploadDocuments": "Upload Documents",

    // Clients
    "clients.title": "Client Directory",
    "clients.subtitle": "Manage client relationships and contact information",
    "clients.newClient": "New Client",
    "clients.noClients": "No clients found",
    "clients.associatedCases": "Associated Cases",
    "clients.sendMessage": "Send Message to Client",

    // Alerts
    "alerts.title": "Notification Center",
    "alerts.subtitle": "Stay updated on case activities and regulation changes",
    "alerts.markAllRead": "Mark all as read",
    "alerts.markAsRead": "Mark as read",
    "alerts.allNotifications": "All Notifications",
    "alerts.unread": "Unread",
    "alerts.allCaughtUp": "All caught up!",
    "alerts.noNotifications": "You have no new notifications",
    "alerts.reviewMatches": "Review Matches",
    "alerts.viewAmendment": "View Amendment",
    "alerts.viewCase": "View Case",

    // Regulations
    "regulations.title": "Regulation Library",
    "regulations.subtitle": "Browse active laws and track legislative history",
    "regulations.discoverNew": "Discover New",
    "regulations.noRegulations": "No regulations found",
    "regulations.versions": "Versions",
    "regulations.versionHistory": "Version History",
    "regulations.compareVersions": "Compare Versions",

    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account and preferences",
    "settings.profile": "My Profile",
    "settings.organization": "Organization",
    "settings.notifications": "Notifications",
    "settings.security": "Security",
    "settings.integrations": "Integrations",
    "settings.billing": "Billing",
    "settings.saveChanges": "Save Changes",

    // Forms
    "form.name": "Name",
    "form.email": "Email",
    "form.phone": "Phone",
    "form.address": "Address",
    "form.notes": "Notes",
    "form.type": "Type",
    "form.status": "Status",
    "form.required": "Required",
  },
  ar: {
    // Common
    "common.back": "رجوع",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.view": "عرض",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.export": "تصدير",
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.success": "نجاح",
    "common.noResults": "لا توجد نتائج",
    "common.viewAll": "عرض الكل",
    "common.viewDetails": "عرض التفاصيل",

    // Navigation
    "nav.dashboard": "لوحة التحكم",
    "nav.cases": "القضايا",
    "nav.regulations": "الأنظمة",
    "nav.clients": "العملاء",
    "nav.alerts": "التنبيهات",
    "nav.settings": "الإعدادات",
    "nav.newCase": "قضية جديدة",

    // Dashboard
    "dashboard.welcome": "مرحباً بعودتك",
    "dashboard.aiAnalyzed": "قام مساعد الذكاء الاصطناعي بتحليل",
    "dashboard.newCases": "قضايا جديدة",
    "dashboard.whileAway": "أثناء غيابك",
    "dashboard.activeCases": "القضايا النشطة",
    "dashboard.pendingRegulations": "الأنظمة المعلقة",
    "dashboard.aiDiscoveries": "اكتشافات الذكاء الاصطناعي",
    "dashboard.pendingHearings": "جلسات الاستماع المعلقة",
    "dashboard.recentCases": "القضايا الأخيرة",
    "dashboard.regulationUpdates": "تحديثات الأنظمة",

    // Cases
    "cases.title": "إدارة القضايا",
    "cases.subtitle": "إدارة وتتبع القضايا القانونية لمؤسستك",
    "cases.newCase": "قضية جديدة",
    "cases.noCases": "لا توجد قضايا",
    "cases.adjustFilters": "قم بتعديل المرشحات أو أنشئ قضية جديدة",
    "cases.caseDetails": "تفاصيل القضية",
    "cases.documents": "المستندات",
    "cases.uploadDocuments": "رفع المستندات",

    // Clients
    "clients.title": "دليل العملاء",
    "clients.subtitle": "إدارة علاقات العملاء ومعلومات الاتصال",
    "clients.newClient": "عميل جديد",
    "clients.noClients": "لا يوجد عملاء",
    "clients.associatedCases": "القضايا المرتبطة",
    "clients.sendMessage": "إرسال رسالة للعميل",

    // Alerts
    "alerts.title": "مركز الإشعارات",
    "alerts.subtitle": "ابق على اطلاع بأنشطة القضايا وتغييرات الأنظمة",
    "alerts.markAllRead": "تحديد الكل كمقروء",
    "alerts.markAsRead": "تحديد كمقروء",
    "alerts.allNotifications": "جميع الإشعارات",
    "alerts.unread": "غير مقروء",
    "alerts.allCaughtUp": "لا توجد إشعارات جديدة!",
    "alerts.noNotifications": "ليس لديك إشعارات جديدة",
    "alerts.reviewMatches": "مراجعة التطابقات",
    "alerts.viewAmendment": "عرض التعديل",
    "alerts.viewCase": "عرض القضية",

    // Regulations
    "regulations.title": "مكتبة الأنظمة",
    "regulations.subtitle": "تصفح القوانين النشطة وتتبع التاريخ التشريعي",
    "regulations.discoverNew": "اكتشف جديد",
    "regulations.noRegulations": "لا توجد أنظمة",
    "regulations.versions": "الإصدارات",
    "regulations.versionHistory": "سجل الإصدارات",
    "regulations.compareVersions": "مقارنة الإصدارات",

    // Settings
    "settings.title": "الإعدادات",
    "settings.subtitle": "إدارة حسابك وتفضيلاتك",
    "settings.profile": "ملفي الشخصي",
    "settings.organization": "المؤسسة",
    "settings.notifications": "الإشعارات",
    "settings.security": "الأمان",
    "settings.integrations": "التكاملات",
    "settings.billing": "الفواتير",
    "settings.saveChanges": "حفظ التغييرات",

    // Forms
    "form.name": "الاسم",
    "form.email": "البريد الإلكتروني",
    "form.phone": "الهاتف",
    "form.address": "العنوان",
    "form.notes": "ملاحظات",
    "form.type": "النوع",
    "form.status": "الحالة",
    "form.required": "مطلوب",
  },
};

/* =============================================================================
   CONTEXT
   ============================================================================= */

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const context = React.useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

/* =============================================================================
   PROVIDER
   ============================================================================= */

interface LocaleProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function LocaleProvider({ children, defaultLocale = "en" }: LocaleProviderProps) {
  const [locale, setLocaleState] = React.useState<Locale>(defaultLocale);
  const isRTL = locale === "ar";

  // Update document direction when locale changes
  React.useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = locale;

    // Update font family for Arabic
    if (isRTL) {
      document.body.style.fontFamily = "'Noto Sans Arabic', var(--font-sans)";
    } else {
      document.body.style.fontFamily = "var(--font-sans)";
    }
  }, [locale, isRTL]);

  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("silah-locale", newLocale);
    }
  }, []);

  // Load locale from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("silah-locale") as Locale | null;
      if (saved && (saved === "en" || saved === "ar")) {
        setLocaleState(saved);
      }
    }
  }, []);

  const t = React.useCallback(
    (key: string): string => {
      return translations[locale][key] || key;
    },
    [locale]
  );

  const value = React.useMemo(
    () => ({ locale, setLocale, isRTL, t }),
    [locale, setLocale, isRTL, t]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

/* =============================================================================
   LANGUAGE SWITCHER COMPONENT
   ============================================================================= */

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      className="px-3 py-1.5 rounded-lg text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
      aria-label={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      {locale === "en" ? "العربية" : "English"}
    </button>
  );
}
