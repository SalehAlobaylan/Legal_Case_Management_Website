/**
 * File: src/app/(dashboard)/alerts/page.tsx
 * Purpose: Notifications/Alerts page with Madar design system.
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
} from "lucide-react";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/* =============================================================================
   TYPES
   ============================================================================= */

interface Alert {
  id: number;
  type: "ai" | "regulation" | "case" | "system";
  title: string;
  desc: string;
  time: string;
  read: boolean;
  caseId?: string;
  regulationId?: string;
}

/* =============================================================================
   MOCK DATA
   ============================================================================= */

const INITIAL_ALERTS: Alert[] = [
  {
    id: 1,
    type: "ai",
    title: "New Regulation Match Found",
    desc: "AI discovered 3 relevant articles from Saudi Labor Law that may apply to Case #C-2024-089.",
    time: "2 minutes ago",
    read: false,
    caseId: "C-2024-089",
  },
  {
    id: 2,
    type: "regulation",
    title: "Labor Law Amendment",
    desc: "Article 77 of Saudi Labor Law has been amended. Review the changes for affected cases.",
    time: "1 hour ago",
    read: false,
    regulationId: "R-001",
  },
  {
    id: 3,
    type: "case",
    title: "Case Status Updated",
    desc: "Case #C-2024-085 'Employment Dispute - Al-Rashid' has been moved to Pending Hearing status.",
    time: "3 hours ago",
    read: false,
    caseId: "C-2024-085",
  },
  {
    id: 4,
    type: "ai",
    title: "Document Analysis Complete",
    desc: "AI has finished analyzing the uploaded documents for Case #C-2024-082. 5 relevant regulations found.",
    time: "5 hours ago",
    read: false,
    caseId: "C-2024-082",
  },
  {
    id: 5,
    type: "system",
    title: "Scheduled Maintenance",
    desc: "System maintenance scheduled for Sunday 2-4 AM. Some features may be unavailable.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 6,
    type: "regulation",
    title: "Commercial Law Update",
    desc: "New provisions added to Commercial Registration Law regarding digital businesses.",
    time: "2 days ago",
    read: true,
    regulationId: "R-002",
  },
  {
    id: 7,
    type: "case",
    title: "Hearing Reminder",
    desc: "Upcoming hearing for Case #C-2024-075 scheduled for December 20, 2024 at 10:00 AM.",
    time: "2 days ago",
    read: true,
    caseId: "C-2024-075",
  },
];

/* =============================================================================
   ICON HELPERS
   ============================================================================= */

const getIcon = (type: Alert["type"]) => {
  switch (type) {
    case "ai":
      return { Icon: Sparkles, color: "text-purple-600", bg: "bg-purple-100" };
    case "regulation":
      return { Icon: BookOpen, color: "text-[#D97706]", bg: "bg-orange-100" };
    case "case":
      return { Icon: FileText, color: "text-[#0F2942]", bg: "bg-blue-100" };
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
  const [alerts, setAlerts] = React.useState<Alert[]>(INITIAL_ALERTS);

  const unreadCount = alerts.filter((a) => !a.read).length;
  const filteredAlerts = filter === "all" ? alerts : alerts.filter((a) => !a.read);

  const markRead = (id: number) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const markAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const clearAll = () => {
    setAlerts([]);
  };

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
              onClick={markAllRead}
              variant="outline"
              className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm"
            >
              <Check className="h-4 w-4" />
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
        <div className="flex-1" />
        {alerts.length > 0 && (
          <Button
            variant="ghost"
            onClick={clearAll}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
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
                onMarkRead={() => markRead(alert.id)}
                onDelete={() => deleteAlert(alert.id)}
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
  onDelete: () => void;
  index: number;
}

function AlertItem({ alert, onMarkRead, onDelete, index }: AlertItemProps) {
  const router = useRouter();
  const { type, title, desc, time, read, caseId, regulationId } = alert;
  const { Icon, color, bg } = getIcon(type);

  const getActionLink = () => {
    switch (type) {
      case "ai":
        return caseId ? { href: `/cases/${caseId}`, label: "Review Matches" } : null;
      case "regulation":
        return { href: "/regulations", label: "View Amendment" };
      case "case":
        return caseId ? { href: `/cases/${caseId}`, label: "View Case" } : null;
      default:
        return null;
    }
  };

  const actionLink = getActionLink();

  return (
    <div
      className={cn(
        "p-6 hover:bg-slate-50 transition-all relative group",
        !read && "bg-orange-50/30",
        "animate-in fade-in slide-in-from-left-2 duration-300"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Unread indicator */}
      {!read && (
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#D97706] to-[#B45309] animate-pulse" />
      )}

      <div className="flex gap-4">
        {/* Icon */}
        <div
          className={cn(
            "p-3 rounded-xl h-fit transition-all duration-300",
            !read ? "bg-white shadow-md ring-1 ring-slate-100" : bg,
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
                !read ? "text-[#0F2942]" : "text-slate-600"
              )}>
                {title}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
            
            {/* Delete button (appears on hover) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <span className="text-xs text-slate-400 font-medium">{time}</span>

            {!read && (
              <button
                onClick={onMarkRead}
                className="text-xs text-[#D97706] font-bold hover:underline inline-flex items-center gap-1 transition-colors"
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
      {type === "ai" && !read && (
        <div className="absolute top-4 right-4">
          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-600 animate-pulse">
            AI
          </span>
        </div>
      )}
    </div>
  );
}
