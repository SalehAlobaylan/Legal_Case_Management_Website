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
  Trash2,
  Settings,
  BellOff,
  Loader2,
  Briefcase,
} from "lucide-react";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useAlerts, useMarkAlertAsRead, useMarkAllAlertsAsRead } from "@/lib/hooks/use-alerts";
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
      return { Icon: Briefcase, color: "text-[#0F2942]", bg: "bg-blue-100" };
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
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const { data: alertsData, isLoading, error } = useAlerts();
  const { mutate: markAsRead, isPending: isMarkingRead } = useMarkAlertAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAllRead } = useMarkAllAlertsAsRead();

  const alerts = alertsData?.alerts || [];
  const unreadCount = alertsData?.unreadCount || 0;
  const filteredAlerts = filter === "all" ? alerts : alerts.filter((a) => !a.isRead);

  const handleMarkRead = (id: number) => {
    markAsRead(id);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500">
          Unable to load notifications. Please try again.
        </p>
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
              Notification Center
            </h1>
          </div>
          <p className="text-slate-500">
            Stay updated on case activities and regulation changes.
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
              Mark all as read
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
          <span className="text-sm text-slate-500">Total</span>
        </div>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#D97706]">{unreadCount}</span>
          <span className="text-sm text-slate-500">Unread</span>
        </div>
      </div>

      {/* Alerts Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        {/* Filter Tabs */}
        <div className="p-6 border-b border-slate-100">
          <FilterPills>
            <FilterPill
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All Notifications
            </FilterPill>
            <FilterPill
              active={filter === "unread"}
              onClick={() => setFilter("unread")}
              count={unreadCount}
            >
              Unread
            </FilterPill>
          </FilterPills>
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
              {filter === "unread" ? "All caught up!" : "No notifications"}
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              {filter === "unread"
                ? "You've read all your notifications. Great job staying on top of things!"
                : "You don't have any notifications yet. They'll appear here when there's activity."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map((alert, index) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onMarkRead={() => handleMarkRead(alert.id)}
                isMarkingRead={isMarkingRead}
                index={index}
              />
            ))}
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
  isMarkingRead: boolean;
  index: number;
}

function AlertItem({ alert, onMarkRead, isMarkingRead, index }: AlertItemProps) {
  const { type, title, message, createdAt, isRead, metadata } = alert;
  const { Icon, color, bg } = getIcon(type);

  const getActionLink = () => {
    switch (type) {
      case "ai_suggestion":
        return metadata?.caseId ? { href: `/cases/${metadata.caseId}`, label: "Review Matches" } : null;
      case "regulation_update":
        return metadata?.regulationId
          ? { href: `/regulations/${metadata.regulationId}`, label: "View Amendment" }
          : { href: "/regulations", label: "View Regulations" };
      case "case_update":
        return metadata?.caseId ? { href: `/cases/${metadata.caseId}`, label: "View Case" } : null;
      case "document_upload":
        return metadata?.caseId ? { href: `/cases/${metadata.caseId}`, label: "View Document" } : null;
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
        "animate-in fade-in slide-in-from-left-2 duration-300"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Unread indicator */}
      {!isRead && (
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#D97706] to-[#B45309] animate-pulse" />
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
              {formatRelativeTime(createdAt)}
            </span>

            {!isRead && (
              <button
                onClick={onMarkRead}
                disabled={isMarkingRead}
                className="text-xs text-[#D97706] font-bold hover:underline inline-flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Check className="h-3 w-3" />
                Mark as read
              </button>
            )}

            {actionLink && (
              <Link
                href={actionLink.href}
                className="text-xs text-[#0F2942] font-bold hover:underline inline-flex items-center gap-1 hover:text-[#D97706] transition-colors"
              >
                {actionLink.label}
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Type indicator pill for AI notifications */}
      {type === "ai_suggestion" && !isRead && (
        <div className="absolute top-4 right-4">
          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-600 animate-pulse">
            AI
          </span>
        </div>
      )}
    </div>
  );
}
