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
  Briefcase,
  Download,
  Loader2,
} from "lucide-react";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { ClientFormModal, type ClientFormData } from "@/components/features/clients/client-form-modal";
import { useClients, useCreateClient } from "@/lib/hooks/use-clients";
import type { Client } from "@/lib/types/client";

const TYPE_FILTERS = ["All", "individual", "company"];

const TYPE_LABELS: Record<string, string> = {
  All: "All",
  individual: "Individual",
  company: "Corporate",
};

/* =============================================================================
   TYPE HELPERS
   ============================================================================= */

const getTypeIcon = (type: string) => {
  switch (type) {
    case "individual":
      return User;
    case "company":
      return Building2;
    default:
      return User;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "individual":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "company":
      return "text-purple-600 bg-purple-50 border-purple-200";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200";
  }
};

/* =============================================================================
   PAGE COMPONENT
   ============================================================================= */

export default function ClientsPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: clientsData, isLoading, error } = useClients({
    type: typeFilter !== "All" ? (typeFilter as "individual" | "company") : undefined,
    search: debouncedSearch || undefined,
  });

  const { mutate: createClient, isPending: isCreating } = useCreateClient();

  const clients = clientsData?.clients || [];

  // Stats from real data
  const stats = React.useMemo(() => ({
    total: clientsData?.total || 0,
    active: clients.length, // All fetched clients are active
    inactive: 0,
    totalCases: clients.reduce((sum, c) => sum + (c.casesCount || 0), 0),
  }), [clients, clientsData?.total]);

  const handleAddClient = (data: ClientFormData) => {
    // Map UI types to API types
    const typeMapping: Record<string, "individual" | "company"> = {
      "Individual": "individual",
      "Corporate": "company",
      "SME": "company",
      "Group": "company",
    };

    createClient({
      name: data.name,
      type: typeMapping[data.type] || "individual",
      contactEmail: data.email,
      contactPhone: data.phone,
      notes: data.notes,
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
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
          Unable to load clients. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Client Form Modal */}
      <ClientFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddClient}
        mode="create"
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
            Client Directory
          </h1>
          <p className="text-slate-500 mt-2">
            Manage client relationships and contact information.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={isCreating}
            className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-2.5 h-auto rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold flex items-center gap-2 transition-all"
          >
            <div className="bg-white/20 p-1 rounded-md">
              <Plus className="h-4 w-4" />
            </div>
            {isCreating ? "Creating..." : "New Client"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Clients
          </p>
          <p className="text-2xl font-bold text-[#0F2942]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active
          </p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Inactive
          </p>
          <p className="text-2xl font-bold text-slate-400">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Cases
          </p>
          <p className="text-2xl font-bold text-[#D97706]">{stats.totalCases}</p>
        </div>
      </div>

      {/* Clients Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        {/* Filters & Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Type Filters */}
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

          {/* Search & Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#D97706] transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients by name, ID, or email..."
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-xl",
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

        {/* Table */}
        {clients.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="text-slate-400 h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg text-[#0F2942] mb-2">
              No clients found
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Try adjusting your filters or add a new client.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-2.5 rounded-xl font-bold"
            >
              Add Your First Client
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cases
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Action
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
                  />
                ))}
              </tbody>
            </table>
          </div>
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
}

function ClientRow({ client, onView, index }: ClientRowProps) {
  const { name, id, type, contactPhone, contactEmail, casesCount } = client;
  const initial = name.charAt(0).toUpperCase();
  const TypeIcon = getTypeIcon(type);

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
              "bg-gradient-to-br from-[#0F2942] to-[#1E3A56] text-white font-bold text-sm",
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
          {type === "company" ? "Corporate" : "Individual"}
        </span>
      </td>

      {/* Contact */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          {contactPhone && (
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {contactPhone}
            </p>
          )}
          {contactEmail && (
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              {contactEmail}
            </p>
          )}
        </div>
      </td>

      {/* Cases */}
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600 font-medium">
          {casesCount || 0} {(casesCount || 0) === 1 ? "case" : "cases"}
        </span>
      </td>

      {/* Action */}
      <td className="px-6 py-4 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="text-[#D97706] text-sm font-bold hover:underline inline-flex items-center gap-1 group/btn"
        >
          View Details
          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </td>
    </tr>
  );
}
