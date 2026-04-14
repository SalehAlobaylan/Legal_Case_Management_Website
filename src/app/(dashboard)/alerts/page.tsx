/**
 * File: src/app/(dashboard)/alerts/page.tsx
 * Purpose: Notifications/Alerts page with Silah design system.
 *
 * Features:
 * - Page header with mark all read button
 * - Filter tabs (All / Unread)
 * - Notification list with type-specific icons
 * - Animated unread indicators
 * - Action links to related pages
 * - Empty state with celebration
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  FileText,
  AlertCircle,
  Check,
  Bell,
  ChevronRight,
  X,
  Settings,
  BellOff,
  Loader2,
  Briefcase,
} from "lucide-react";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { useAlerts, useMarkAlertAsRead, useMarkAllAlertsAsRead, useDeleteAlert, useClearReadAlerts } from "@/lib/hooks/use-alerts";
import { useI18n } from "@/lib/hooks/use-i18n";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Alert, AlertType } from "@/lib/types/alert";

/* =============================================================================
   ICON HELPERS
   ============================================================================= */

const getIcon = (type: AlertType) => {
  switch (type) {
    case "ai_suggestion":
      return { Icon: Sparkles, color: "text-purple-600", bg: "bg-purple-100" };
    case "regulation_update":
      return { Icon: BookOpen, color: "text-[#D97706]", bg: "bg-orange-100" };
    case "case_update":
      return { Icon: Briefcase, color: "text-slate-700", bg: "bg-slate-100" };
    case "document_upload":
      return { Icon: FileText, color: "text-green-600", bg: "bg-green-100" };
    case "system":
    default:
      return { Icon: AlertCircle, color: "text-slate-500", bg: "bg-slate-100" };
  }
};

/* =============================================================================
   PAGE COMPONENT
   ============================================================================= */

export default function AlertsPage() {
  const router = useRouter();
  const { t, isRTL, locale } = useI18n();
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = React.useState<"all" | AlertType>("all");
  const [limit, setLimit] = React.useState(25);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [markingId, setMarkingId] = React.useState<number | null>(null);

  const { data: alertsData, isLoading, error, refetch } = useAlerts({ limit, offset: 0 });
  const { mutate: markAsRead, isPending: isMarkingRead } = useMarkAlertAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAllRead } = useMarkAllAlertsAsRead();
  const { mutate: deleteAlert } = useDeleteAlert();
  const { mutate: clearReadAlerts, isPending: isClearingRead } = useClearReadAlerts();

  const alerts = React.useMemo(() => {
    const list = alertsData?.alerts || [];
    return list.filter((alert) => {
      const merged = `${alert.title || ""} ${alert.message || ""}`.toLowerCase();
      return !(merged.includes("operational mode") || merged.includes("system-reminder"));
    });
  }, [alertsData]);
  const unreadCount = alertsData?.unreadCount || 0;
  const filteredAlerts = alerts.filter((a) => {
    if (filter === "unread" && a.isRead) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    return true;
  });

  const countsByType = React.useMemo(
    () =>
      alerts.reduce<Record<AlertType, number>>(
        (acc, alert) => {
          acc[alert.type] += 1;
          return acc;
        },
        {
          ai_suggestion: 0,
          case_update: 0,
          regulation_update: 0,
          document_upload: 0,
          system: 0,
        }
      ),
    [alerts]
  );

  const handleMarkRead = (id: number) => {
    setMarkingId(id);
    markAsRead(id, {
      onSettled: () => setMarkingId(null),
    });
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteAlert(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  const handleClearRead = () => {
    clearReadAlerts();
  };

  const readCount = Math.max(0, alerts.length - unreadCount);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <EmptyState
          icon={AlertCircle}
          title={t("alerts.unableToLoad")}
          variant="error"
          action={{
            label: t("common.retry"),
            onClick: () => refetch(),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-[#0F2942] text-white">
              <Bell className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
              {t("alerts.title")}
            </h1>
          </div>
          <p className="text-slate-500">
            {t("alerts.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              disabled={isMarkingAllRead}
              variant="outline"
              className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm"
            >
              {isMarkingAllRead ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {t("alerts.markAllRead")}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => router.push("/settings")}
            className="p-2 rounded-xl text-slate-500 hover:text-[#0F2942]"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#0F2942]">{alerts.length}</span>
          <span className="text-sm text-slate-500">{t("alerts.total")}</span>
        </div>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#D97706]">{unreadCount}</span>
          <span className="text-sm text-slate-500">{t("alerts.unread")}</span>
        </div>
      </div>

      {/* Alerts Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        {/* Filter Tabs */}
        <div className="p-6 border-b border-slate-100 sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
          <FilterPills>
            <FilterPill
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              {t("alerts.allNotifications")}
            </FilterPill>
            <FilterPill
              active={filter === "unread"}
              onClick={() => setFilter("unread")}
              count={unreadCount}
            >
              {t("alerts.unread")}
            </FilterPill>
          </FilterPills>

          <div className="mt-3 flex flex-wrap gap-2">
            {([
              { key: "all", label: t("alerts.allNotifications"), count: alerts.length },
              { key: "ai_suggestion", label: t("alerts.types.ai_suggestion"), count: countsByType.ai_suggestion },
              { key: "case_update", label: t("alerts.types.case_update"), count: countsByType.case_update },
              { key: "regulation_update", label: t("alerts.types.regulation_update"), count: countsByType.regulation_update },
              { key: "document_upload", label: t("alerts.types.document_upload"), count: countsByType.document_upload },
              { key: "system", label: t("alerts.types.system"), count: countsByType.system },
            ] as const).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTypeFilter(item.key as "all" | AlertType)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors",
                  typeFilter === item.key
                    ? "bg-[#0F2942] text-white border-[#0F2942]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                )}
              >
                {item.label} {item.count > 0 ? `(${item.count})` : ""}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {isRTL
                ? `${filteredAlerts.length} نتيجة حالياً`
                : `${filteredAlerts.length} results shown`}
            </p>

            {readCount > 0 && (
              <button
                type="button"
                onClick={handleClearRead}
                disabled={isClearingRead}
                className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                {isClearingRead
                  ? isRTL
                    ? "جارٍ الحذف..."
                    : "Clearing..."
                  : isRTL
                    ? "حذف التنبيهات المقروءة"
                    : "Clear read notifications"}
              </button>
            )}
          </div>
        </div>

        {/* Alerts List or Empty State */}
        {filteredAlerts.length === 0 ? (
          <div className="p-16 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
              {filter === "unread" ? (
                <BellOff className="text-green-600 h-10 w-10" />
              ) : (
                <Check className="text-green-600 h-10 w-10" />
              )}
            </div>
            <h3 className="font-bold text-xl text-[#0F2942] mb-2">
              {filter === "unread" ? t("alerts.allCaughtUp") : t("alerts.noAlerts")}
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              {filter === "unread"
                ? t("alerts.allCaughtUpDesc")
                : t("alerts.noAlertsDesc")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map((alert, index) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onMarkRead={() => handleMarkRead(alert.id)}
                onDelete={() => handleDelete(alert.id)}
                isMarkingRead={isMarkingRead && markingId === alert.id}
                isDeleting={deletingId === alert.id}
                index={index}
                t={t}
                isRTL={isRTL}
                locale={locale}
              />
            ))}

            {alerts.length >= limit && (
              <div className="p-4 border-t border-slate-100 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setLimit((prev) => prev + 25)}
                  className="text-sm font-bold"
                >
                  {isRTL ? "تحميل المزيد" : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =============================================================================
   ALERT ITEM COMPONENT
   ============================================================================= */

interface AlertItemProps {
  alert: Alert;
  onMarkRead: () => void;
  onDelete: () => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
  index: number;
  t: (key: string) => string;
  isRTL: boolean;
  locale: "ar" | "en";
}

function AlertItem({ alert, onMarkRead, onDelete, isMarkingRead, isDeleting, index, t, isRTL, locale }: AlertItemProps) {
  const { type, title, message, createdAt, isRead, metadata } = alert;
  const { Icon, color, bg } = getIcon(type);

  const getActionLink = () => {
    const isValidId = (value: unknown): value is number =>
      typeof value === "number" && Number.isFinite(value) && value > 0;

    switch (type) {
      case "ai_suggestion":
        return isValidId(metadata?.caseId)
          ? { href: `/cases/${metadata?.caseId}`, label: t("alerts.reviewMatches") }
          : { href: "/cases", label: t("alerts.viewCase") };
      case "regulation_update":
        return isValidId(metadata?.regulationId)
          ? { href: `/regulations/${metadata.regulationId}`, label: t("alerts.viewAmendment") }
          : { href: "/regulations", label: t("alerts.viewRegulations") };
      case "case_update":
        return isValidId(metadata?.caseId)
          ? { href: `/cases/${metadata.caseId}`, label: t("alerts.viewCase") }
          : { href: "/cases", label: t("alerts.viewCase") };
      case "document_upload":
        return isValidId(metadata?.caseId)
          ? { href: `/cases/${metadata.caseId}`, label: t("alerts.viewDocument") }
          : { href: "/cases", label: t("alerts.viewDocument") };
      default:
        return null;
    }
  };

  const actionLink = getActionLink();

  return (
    <div
      className={cn(
        "p-6 hover:bg-slate-50 transition-all relative group",
        !isRead && "bg-orange-50/30",
        "animate-in fade-in duration-300",
        isRTL ? "slide-in-from-right-2" : "slide-in-from-left-2"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Unread indicator */}
      {!isRead && (
        <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-0 w-1 h-full bg-gradient-to-b from-[#D97706] to-[#B45309] animate-pulse`} />
      )}

      <div className="flex gap-4">
        {/* Icon */}
        <div
          className={cn(
            "p-3 rounded-xl h-fit transition-all duration-300",
            !isRead ? "bg-white shadow-md ring-1 ring-slate-100" : bg,
            "group-hover:scale-105"
          )}
        >
          <Icon className={cn("h-5 w-5", color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className={cn(
                "font-bold mb-1 transition-colors",
                !isRead ? "text-[#0F2942]" : "text-slate-600"
              )}>
                {title}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <span className="text-xs text-slate-400 font-medium">
              {formatRelativeTime(createdAt, locale === "ar" ? "ar" : "en")}
            </span>

            {!isRead && (
              <button
                onClick={onMarkRead}
                disabled={isMarkingRead}
                className="text-xs text-[#D97706] font-bold hover:underline inline-flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Check className="h-3 w-3" />
                {t("alerts.markAsRead")}
              </button>
            )}

            {actionLink && (
              <Link
                href={actionLink.href}
                className="text-xs text-[#0F2942] font-bold hover:underline inline-flex items-center gap-1 hover:text-[#D97706] transition-colors"
              >
                {actionLink.label}
                <ChevronRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            )}

            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="text-xs text-slate-400 hover:text-red-600 inline-flex items-center gap-1 transition-colors disabled:opacity-50"
              aria-label={isRTL ? "حذف التنبيه" : "Delete alert"}
            >
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
              {isRTL ? "حذف" : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* Type indicator pill for AI notifications */}
      {type === "ai_suggestion" && !isRead && (
        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
          <span className="px-2 py-1 rounded-full text-[10px] font-bold tracking-wider bg-purple-100 text-purple-600 animate-pulse">
            {t("alerts.aiBadge")}
          </span>
        </div>
      )}
    </div>
  );
}
