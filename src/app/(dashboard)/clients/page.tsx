/**
 * File: src/app/(dashboard)/clients/page.tsx
 * Purpose: Clients directory page with Silah design system.
 *
 * Layout:
 * - Page header with title and New Client button
 * - Type filter pills
 * - Search input
 * - Clients table with avatar, contact info, status
 * - Client form modal for adding new clients
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  User,
  Download,
  Loader2,
  LayoutList,
  Kanban,
  ClipboardList,
  Workflow,
} from "lucide-react";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { ClientKanbanBoard } from "@/components/features/clients/client-kanban-board";
import { useClients, useCreateClient, useExportClients } from "@/lib/hooks/use-clients";
import { useI18n } from "@/lib/hooks/use-i18n";
import type { Client } from "@/lib/types/client";

/* =============================================================================
   TYPE HELPERS
   ============================================================================= */

const getTypeIcon = (type: string) => {
  switch (type) {
    case "individual":
      return User;
    case "corporate":
    case "company":
    case "sme":
    case "group":
      return Building2;
    default:
      return User;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "individual":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "corporate":
    case "company":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "sme":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "group":
      return "text-amber-700 bg-amber-50 border-amber-200";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200";
  }
};

/* =============================================================================
   PAGE COMPONENT
   ============================================================================= */

export default function ClientsPage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list");

  const TYPE_FILTERS = ["All", "individual", "corporate", "sme", "group"];
  const TYPE_LABELS: Record<string, string> = {
    All: t("common.all"),
    individual: t("clients.types.individual"),
    corporate: t("clients.types.corporate"),
    sme: t("clients.types.sme"),
    group: t("clients.types.group"),
  };

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: clientsData, isLoading, error, refetch } = useClients({
    type: typeFilter !== "All" ? (typeFilter as "individual" | "corporate" | "sme" | "group") : undefined,
    search: debouncedSearch || undefined,
  });

  const { mutate: exportClients, isPending: isExporting } = useExportClients();

  const clients = clientsData?.clients || [];

  // Stats from real data
  const stats = React.useMemo(() => ({
    total: clientsData?.total || 0,
    active: clients.length, // All fetched clients are active
    inactive: 0,
    totalCases: clients.reduce((sum, c) => sum + (c.casesCount || 0), 0),
  }), [clients, clientsData?.total]);

  // Create client logic moved to components/features/clients/client-form.tsx

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Users}
        title={t("clients.unableToLoad")}
        variant="error"
        action={{
          label: t("common.retry"),
          onClick: () => refetch(),
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F2942] font-serif">
            {t("clients.title")}
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-2">
            {t("clients.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            aria-label={isRTL ? "نماذج الاستقبال" : "Intake Forms"}
            className="px-3 md:px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
            onClick={() => router.push("/clients/intake")}
          >
            <ClipboardList className="h-4 w-4 shrink-0" />
            <span className="truncate">{isRTL ? "نماذج الاستقبال" : "Intake Forms"}</span>
          </Button>
          <Button
            variant="outline"
            aria-label={isRTL ? "أتمتة التواصل" : "Automations"}
            className="px-3 md:px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
            onClick={() => router.push("/clients/automations")}
          >
            <Workflow className="h-4 w-4 shrink-0" />
            <span className="truncate">{isRTL ? "أتمتة التواصل" : "Automations"}</span>
          </Button>
          <Button
            variant="outline"
            aria-label={isExporting ? t("common.exporting") : t("common.export")}
            className="px-3 md:px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
            onClick={() => exportClients("csv")}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 shrink-0" />
            <span className="truncate">{isExporting ? t("common.exporting") : t("common.export")}</span>
          </Button>
          <Button
            onClick={() => router.push("/clients/new")}
            className="bg-[#D97706] hover:bg-[#B45309] text-white px-4 md:px-6 py-2.5 h-auto rounded-xl shadow-lg hover:shadow-xl md:hover:-translate-y-0.5 font-bold flex items-center justify-center gap-2 transition-all text-sm"
          >
            <div className="bg-white/20 p-1 rounded-md shrink-0">
              <Plus className="h-4 w-4" />
            </div>
            <span className="truncate">{t("clients.newClient")}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {t("clients.totalClients")}
          </p>
          <p className="text-2xl font-bold text-[#0F2942]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {t("clients.active")}
          </p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {t("clients.inactive")}
          </p>
          <p className="text-2xl font-bold text-slate-400">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {t("clients.totalCases")}
          </p>
          <p className="text-2xl font-bold text-[#D97706]">{stats.totalCases}</p>
        </div>
      </div>

      {/* Clients Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        {/* Filters & Search */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col gap-3 md:gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
          {/* View toggle */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl w-full md:w-auto overflow-hidden order-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                viewMode === "list"
                  ? "bg-white text-[#D97706] shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutList className="w-4 h-4" />
              <span>{t("clients.viewMode.list")}</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                viewMode === "kanban"
                  ? "bg-white text-[#D97706] shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Kanban className="w-4 h-4" />
              <span>{t("clients.viewMode.board")}</span>
            </button>
          </div>

          {/* Type filter pills */}
          <div className="w-full md:w-auto order-3 md:order-2 -mx-1 md:mx-0">
            <FilterPills>
              {TYPE_FILTERS.map((type) => (
                <FilterPill
                  key={type}
                  active={typeFilter === type}
                  onClick={() => setTypeFilter(type)}
                >
                  {TYPE_LABELS[type] || type}
                </FilterPill>
              ))}
            </FilterPills>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto order-2 md:order-3">
            <div className="relative flex-1 md:w-72 group">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#D97706] transition-colors`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("clients.searchClients")}
                className={cn(
                  "w-full py-2.5 rounded-xl",
                  isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                  "border border-slate-200 bg-slate-50",
                  "text-sm text-[#0F2942]",
                  "placeholder:text-slate-400",
                  "focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/10 focus:bg-white",
                  "transition-all duration-200"
                )}
              />
            </div>
            <button
              className={cn(
                "p-2.5 rounded-xl",
                "border border-slate-200 bg-white",
                "hover:bg-slate-50 hover:border-slate-300 text-slate-600",
                "transition-all duration-200"
              )}
            >
              <Filter className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {/* Table, Kanban or Empty State */}
        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t("clients.noClients")}
            description={t("clients.noClientsDesc")}
            action={
              !debouncedSearch
                ? { label: t("clients.addFirstClient"), onClick: () => router.push("/clients/new") }
                : undefined
            }
          />
        ) : viewMode === "kanban" ? (
          <div className="p-3 md:p-6 bg-slate-50/50">
            <ClientKanbanBoard clients={clients} isRTL={isRTL} />
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {clients.map((client, index) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onView={() => router.push(`/clients/${client.id}`)}
                  index={index}
                  t={t}
                  isRTL={isRTL}
                />
              ))}
            </div>

            {/* Desktop: data table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("clients.clientName")}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("clients.type")}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("clients.contact")}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("clients.cases")}
                    </th>
                    <th className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((client, index) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      onView={() => router.push(`/clients/${client.id}`)}
                      index={index}
                      t={t}
                      isRTL={isRTL}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =============================================================================
   CLIENT ROW COMPONENT
   ============================================================================= */

interface ClientRowProps {
  client: Client;
  onView: () => void;
  index: number;
  t: (key: string) => string;
  isRTL: boolean;
}

function ClientRow({ client, onView, index, t, isRTL }: ClientRowProps) {
  const { name, id, type, contactPhone, contactEmail, phone, email, casesCount } = client;
  const initial = name.charAt(0).toUpperCase();
  const TypeIcon = getTypeIcon(type);
  const displayPhone = contactPhone || phone;
  const displayEmail = contactEmail || email;

  return (
    <tr
      className={cn(
        "hover:bg-slate-50 transition-all group cursor-pointer",
        "animate-in fade-in slide-in-from-left-2 duration-300"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={onView}
    >
      {/* Client Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-brand-primary to-brand-accent text-white font-bold text-sm",
              "group-hover:from-[#D97706] group-hover:to-[#B45309] transition-all duration-300",
              "shadow-md ring-2 ring-white"
            )}
          >
            {initial}
          </div>
          <div>
            <h4 className="font-bold text-[#0F2942] text-sm group-hover:text-[#D97706] transition-colors">
              {name}
            </h4>
            <p className="text-xs text-slate-500">#{id}</p>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-6 py-4">
        <span
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit border",
            getTypeColor(type)
          )}
        >
          <TypeIcon className="h-3.5 w-3.5" />
          {type === "individual"
            ? t("clients.types.individual")
            : type === "sme"
              ? t("clients.types.sme")
              : type === "group"
                ? t("clients.types.group")
                : t("clients.types.corporate")}
        </span>
      </td>

      {/* Contact */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          {displayPhone && (
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {displayPhone}
            </p>
          )}
          {displayEmail && (
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              {displayEmail}
            </p>
          )}
        </div>
      </td>

      {/* Cases */}
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600 font-medium">
          {casesCount || 0} {(casesCount || 0) === 1 ? t("clients.case") : t("clients.casesPlural")}
        </span>
      </td>

      {/* Action */}
      <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="text-[#D97706] text-sm font-bold hover:underline inline-flex items-center gap-1 group/btn"
        >
          {t("common.viewDetails")}
          <ChevronRight className={`h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </td>
    </tr>
  );
}

/* =============================================================================
   CLIENT CARD COMPONENT (mobile)
   ============================================================================= */

function ClientCard({ client, onView, index, t, isRTL }: ClientRowProps) {
  const { name, id, type, contactPhone, contactEmail, phone, email, casesCount } = client;
  const initial = name.charAt(0).toUpperCase();
  const TypeIcon = getTypeIcon(type);
  const displayPhone = contactPhone || phone;
  const displayEmail = contactEmail || email;
  const typeLabel =
    type === "individual"
      ? t("clients.types.individual")
      : type === "sme"
        ? t("clients.types.sme")
        : type === "group"
          ? t("clients.types.group")
          : t("clients.types.corporate");

  return (
    <button
      type="button"
      onClick={onView}
      className={cn(
        "w-full text-start p-4 flex items-start gap-3 hover:bg-slate-50 active:bg-slate-100 transition-colors",
        "animate-in fade-in slide-in-from-bottom-1 duration-300"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div
        className={cn(
          "w-11 h-11 shrink-0 rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-brand-primary to-brand-accent text-white font-bold text-sm",
          "shadow-md ring-2 ring-white"
        )}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-bold text-[#0F2942] text-sm truncate">{name}</h4>
            <p className="text-[11px] text-slate-400 font-mono">#{id}</p>
          </div>
          <span
            className={cn(
              "shrink-0 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border",
              getTypeColor(type)
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {typeLabel}
          </span>
        </div>
        <div className="mt-2 space-y-1 text-xs text-slate-600">
          {displayPhone && (
            <p className="flex items-center gap-2 truncate">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate" dir="ltr">{displayPhone}</span>
            </p>
          )}
          {displayEmail && (
            <p className="flex items-center gap-2 text-slate-400 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{displayEmail}</span>
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            {casesCount || 0} {(casesCount || 0) === 1 ? t("clients.case") : t("clients.casesPlural")}
          </span>
          <span className="text-xs font-bold text-[#D97706] inline-flex items-center gap-1">
            {t("common.viewDetails")}
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          </span>
        </div>
      </div>
    </button>
  );
}
