/**
 * File: src/app/(dashboard)/clients/page.tsx
 * Purpose: Clients directory page with Madar design system.
 *
 * Layout:
 * - Page header with title and New Client button
 * - Type filter pills
 * - Search input
 * - Clients table with avatar, contact info, status
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
} from "lucide-react";
import { FilterPill, FilterPills } from "@/components/ui/filter-pills";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

// Mock data for clients
const MOCK_CLIENTS = [
  {
    id: "C-001",
    name: "Ahmed Al-Rashid",
    type: "Individual",
    phone: "+966 50 123 4567",
    email: "ahmed.rashid@email.com",
    status: "Active",
    cases: 3,
  },
  {
    id: "C-002",
    name: "Saudi Tech Corp",
    type: "Corporate",
    phone: "+966 11 456 7890",
    email: "legal@sauditech.com",
    status: "Active",
    cases: 7,
  },
  {
    id: "C-003",
    name: "Al-Faisal Trading",
    type: "SME",
    phone: "+966 13 234 5678",
    email: "info@alfaisal.com",
    status: "Active",
    cases: 2,
  },
  {
    id: "C-004",
    name: "Mohammed Enterprises Group",
    type: "Group",
    phone: "+966 12 345 6789",
    email: "legal@meg.com",
    status: "Inactive",
    cases: 0,
  },
  {
    id: "C-005",
    name: "Fatima Al-Hassan",
    type: "Individual",
    phone: "+966 55 987 6543",
    email: "fatima.hassan@email.com",
    status: "Active",
    cases: 1,
  },
];

const TYPE_FILTERS = ["All", "Individual", "Corporate", "SME", "Group"];

export default function ClientsPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredClients = React.useMemo(() => {
    return MOCK_CLIENTS.filter((client) => {
      const matchesType = typeFilter === "All" || client.type === typeFilter;
      const matchesSearch =
        !searchTerm ||
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [typeFilter, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
            Client Directory
          </h1>
          <p className="text-slate-500 mt-2">
            Manage client relationships and contact information.
          </p>
        </div>
        <Button className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold flex items-center gap-2">
          <div className="bg-white/20 p-1 rounded-md">
            <Plus className="h-4 w-4" />
          </div>
          New Client
        </Button>
      </div>

      {/* Clients Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                {type}
              </FilterPill>
            ))}
          </FilterPills>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients..."
                className={cn(
                  "w-full pl-10 pr-4 py-2 rounded-lg",
                  "border border-slate-200 bg-white",
                  "text-sm text-[#0F2942]",
                  "placeholder:text-slate-400",
                  "focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                )}
              />
            </div>
            <button
              className={cn(
                "p-2 rounded-lg",
                "border border-slate-200",
                "hover:bg-slate-50 text-slate-600",
                "transition-colors"
              )}
            >
              <Filter className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {/* Table */}
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="text-slate-400 h-7 w-7" />
            </div>
            <h3 className="font-bold text-lg text-[#0F2942] mb-2">
              No clients found
            </h3>
            <p className="text-slate-500 text-sm">
              Try adjusting your filters or search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cases
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <ClientRow
                    key={client.id}
                    client={client}
                    onView={() => router.push(`/clients/${client.id}`)}
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
  client: {
    id: string;
    name: string;
    type: string;
    phone: string;
    email: string;
    status: string;
    cases: number;
  };
  onView: () => void;
}

function ClientRow({ client, onView }: ClientRowProps) {
  const { name, id, type, phone, email, status, cases } = client;
  const initial = name.charAt(0).toUpperCase();

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      {/* Client Name */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "bg-[#0F2942] text-white font-bold text-sm",
              "group-hover:bg-[#D97706] transition-colors"
            )}
          >
            {initial}
          </div>
          <div>
            <h4 className="font-bold text-[#0F2942] text-sm">{name}</h4>
            <p className="text-xs text-slate-500">{id}</p>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="p-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
          {type}
        </span>
      </td>

      {/* Contact */}
      <td className="p-4">
        <div className="space-y-1">
          <p className="text-sm text-slate-600 flex items-center gap-1">
            <Phone className="h-3 w-3 text-slate-400" />
            {phone}
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {email}
          </p>
        </div>
      </td>

      {/* Status */}
      <td className="p-4">
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-slate-200 text-slate-600"
          )}
        >
          {status}
        </span>
      </td>

      {/* Cases */}
      <td className="p-4 text-sm text-slate-600">
        {cases} active {cases === 1 ? "case" : "cases"}
      </td>

      {/* Action */}
      <td className="p-4">
        <button
          onClick={onView}
          className="text-[#D97706] text-sm font-bold hover:underline flex items-center gap-1"
        >
          View Details <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}
