/**
 * File: src/app/(dashboard)/alerts/page.tsx
 * Purpose: Notifications/Alerts page with Madar design system.
 *
 * Layout:
 * - Page header with title and Mark All Read button
 * - Filter tabs (All / Unread)
 * - Notification list with icons by type
 */

"use client";

import * as React from "react";
import {
  Sparkles,
  BookOpen,
  FileText,
  AlertCircle,
  Check,
  Bell,
} from "lucide-react";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { cn } from "@/lib/utils/cn";

// Mock data for alerts
const MOCK_ALERTS = [
  {
    id: 1,
    type: "ai",
    title: "New Regulation Match Found",
    desc: "AI discovered 3 relevant articles from Saudi Labor Law that may apply to Case #C-2024-089.",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "regulation",
    title: "Labor Law Amendment",
    desc: "Article 77 of Saudi Labor Law has been amended. Review the changes for affected cases.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "case",
    title: "Case Status Updated",
    desc: "Case #C-2024-085 'Employment Dispute - Al-Rashid' has been moved to Pending Hearing status.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: 4,
    type: "system",
    title: "Scheduled Maintenance",
    desc: "System maintenance scheduled for Sunday 2-4 AM. Some features may be unavailable.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 5,
    type: "ai",
    title: "Document Analysis Complete",
    desc: "AI has finished analyzing the uploaded documents for Case #C-2024-082.",
    time: "2 days ago",
    read: true,
  },
];

export default function AlertsPage() {
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [alerts, setAlerts] = React.useState(MOCK_ALERTS);

  const unreadCount = alerts.filter((a) => !a.read).length;
  const filteredAlerts = filter === "all" ? alerts : alerts.filter((a) => !a.read);

  const markRead = (id: number) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const markAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ai":
        return <Sparkles className="text-purple-600" size={20} />;
      case "regulation":
        return <BookOpen className="text-[#D97706]" size={20} />;
      case "case":
        return <FileText className="text-[#0F2942]" size={20} />;
      default:
        return <AlertCircle className="text-slate-400" size={20} />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
            Notification Center
          </h1>
          <p className="text-slate-500 mt-2">
            Stay updated on case activities and regulation changes.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[#D97706] text-sm font-bold hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Alerts Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
          <div className="p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h3 className="font-bold text-lg text-[#0F2942] mb-2">
              All caught up!
            </h3>
            <p className="text-slate-500 text-sm">
              You have no new notifications.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                icon={getIcon(alert.type)}
                onMarkRead={() => markRead(alert.id)}
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
  alert: {
    id: number;
    type: string;
    title: string;
    desc: string;
    time: string;
    read: boolean;
  };
  icon: React.ReactNode;
  onMarkRead: () => void;
}

function AlertItem({ alert, icon, onMarkRead }: AlertItemProps) {
  const { type, title, desc, time, read } = alert;

  return (
    <div
      className={cn(
        "p-6 hover:bg-slate-50 transition-colors relative",
        !read && "bg-orange-50/30"
      )}
    >
      {/* Unread indicator */}
      {!read && (
        <div className="absolute left-0 top-0 w-1 h-full bg-[#D97706]" />
      )}

      <div className="flex gap-4">
        {/* Icon */}
        <div
          className={cn(
            "p-3 rounded-xl h-fit",
            !read ? "bg-white shadow-sm" : "bg-slate-100"
          )}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h4 className="font-bold text-[#0F2942] mb-1">{title}</h4>
          <p className="text-sm text-slate-600 mb-2">{desc}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-slate-400">{time}</span>

            {!read && (
              <button
                onClick={onMarkRead}
                className="text-xs text-[#D97706] font-bold hover:underline"
              >
                Mark as read
              </button>
            )}

            {type === "ai" && (
              <button className="text-xs text-[#0F2942] font-bold hover:underline">
                Review Matches
              </button>
            )}

            {type === "regulation" && (
              <button className="text-xs text-[#0F2942] font-bold hover:underline">
                View Amendment
              </button>
            )}

            {type === "case" && (
              <button className="text-xs text-[#0F2942] font-bold hover:underline">
                View Case
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
