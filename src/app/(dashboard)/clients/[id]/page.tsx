/**
 * File: src/app/(dashboard)/clients/[id]/page.tsx
 * Purpose: Client detail page with contact info, cases, and messaging.
 *
 * Layout:
 * - Header with avatar, name, type badge, status
 * - Contact information cards (3-column grid)
 * - Message client CTA button
 * - Associated cases list
 */

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  FileText,
  Edit2,
  Building2,
  User,
  Users,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/* =============================================================================
   MOCK DATA - Replace with API calls
   ============================================================================= */

const MOCK_CLIENTS = [
  {
    id: "C-001",
    name: "Ahmed Al-Rashid",
    type: "Individual",
    phone: "+966 50 123 4567",
    email: "ahmed.rashid@email.com",
    address: "Riyadh, King Fahd District, Building 45",
    status: "Active",
    cases: 3,
    notes: "Long-standing client since 2020. Prefers communication via email.",
  },
  {
    id: "C-002",
    name: "Saudi Tech Corp",
    type: "Corporate",
    phone: "+966 11 456 7890",
    email: "legal@sauditech.com",
    address: "Riyadh, KAFD Tower 3, Floor 15",
    status: "Active",
    cases: 7,
    notes: "Technology company with multiple ongoing commercial disputes.",
  },
  {
    id: "C-003",
    name: "Al-Faisal Trading",
    type: "SME",
    phone: "+966 13 234 5678",
    email: "info@alfaisal.com",
    address: "Dammam, Industrial Area, Zone B",
    status: "Active",
    cases: 2,
    notes: "Import/export business. Focuses on labor and commercial law.",
  },
  {
    id: "C-004",
    name: "Mohammed Enterprises Group",
    type: "Group",
    phone: "+966 12 345 6789",
    email: "legal@meg.com",
    address: "Jeddah, Corniche Commercial Center",
    status: "Inactive",
    cases: 0,
    notes: "Holding company with diverse subsidiaries.",
  },
  {
    id: "C-005",
    name: "Fatima Al-Hassan",
    type: "Individual",
    phone: "+966 55 987 6543",
    email: "fatima.hassan@email.com",
    address: "Riyadh, Al-Olaya District",
    status: "Active",
    cases: 1,
    notes: "Employment dispute case in progress.",
  },
];

const MOCK_CASES = [
  {
    id: "C-2024-089",
    clientId: "C-001",
    title: "Employment Dispute - Al-Rashid",
    type: "Labor Law",
    status: "Active",
    lastUpdated: "2024-12-15",
  },
  {
    id: "C-2024-085",
    clientId: "C-001",
    title: "Contract Review - Al-Rashid Properties",
    type: "Commercial",
    status: "Review",
    lastUpdated: "2024-12-10",
  },
  {
    id: "C-2024-078",
    clientId: "C-001",
    title: "Insurance Claim - Al-Rashid",
    type: "Civil",
    status: "Closed",
    lastUpdated: "2024-11-28",
  },
  {
    id: "C-2024-090",
    clientId: "C-002",
    title: "IP Infringement - Saudi Tech",
    type: "Commercial",
    status: "Active",
    lastUpdated: "2024-12-18",
  },
  {
    id: "C-2024-082",
    clientId: "C-002",
    title: "Partnership Dispute - Saudi Tech",
    type: "Commercial",
    status: "Review",
    lastUpdated: "2024-12-05",
  },
  {
    id: "C-2024-075",
    clientId: "C-003",
    title: "Import License Dispute",
    type: "Commercial",
    status: "Active",
    lastUpdated: "2024-12-01",
  },
  {
    id: "C-2024-070",
    clientId: "C-005",
    title: "Wrongful Termination Case",
    type: "Labor Law",
    status: "Active",
    lastUpdated: "2024-11-20",
  },
];

/* =============================================================================
   CLIENT TYPE ICON MAPPING
   ============================================================================= */

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Individual":
      return User;
    case "Corporate":
      return Building2;
    case "SME":
      return Briefcase;
    case "Group":
      return Users;
    default:
      return User;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Individual":
      return "text-blue-600 bg-blue-100";
    case "Corporate":
      return "text-purple-600 bg-purple-100";
    case "SME":
      return "text-green-600 bg-green-100";
    case "Group":
      return "text-orange-600 bg-orange-100";
    default:
      return "text-slate-600 bg-slate-100";
  }
};

/* =============================================================================
   PAGE COMPONENT
   ============================================================================= */

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  // Find client from mock data
  const client = MOCK_CLIENTS.find((c) => c.id === clientId);
  const clientCases = MOCK_CASES.filter((c) => c.clientId === clientId);

  if (!client) {
    return (
      <div className="p-8 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <User className="text-slate-400 h-8 w-8" />
        </div>
        <h3 className="font-bold text-lg text-[#0F2942] mb-2">Client Not Found</h3>
        <p className="text-slate-500 text-sm mb-6">
          The client you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/clients")} variant="outline">
          Back to Clients
        </Button>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(client.type);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <button
        onClick={() => router.push("/clients")}
        className="flex items-center text-slate-500 hover:text-[#0F2942] text-sm font-medium group transition-colors"
      >
        <div className="bg-slate-100 p-1.5 rounded-md mr-2 group-hover:bg-[#0F2942] group-hover:text-white transition-colors">
          <ChevronRight className="rotate-180 h-4 w-4" />
        </div>
        Back to Client Directory
      </button>

      {/* Client Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0F2942] to-[#1E3A56] flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
                {client.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-slate-500 text-sm font-medium">{client.id}</span>
                <span className="text-slate-300">•</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
                    getTypeColor(client.type)
                  )}
                >
                  <TypeIcon className="h-3.5 w-3.5" />
                  {client.type}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold",
                client.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-200 text-slate-600"
              )}
            >
              {client.status}
            </span>
            <Button
              variant="outline"
              className="px-4 py-2 rounded-xl font-bold flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Phone */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#D97706]/30 hover:shadow-sm transition-all group">
            <div className="p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
              <Phone className="h-5 w-5 text-[#0F2942]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Phone
              </p>
              <p className="text-sm text-slate-700 font-semibold">{client.phone}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#D97706]/30 hover:shadow-sm transition-all group">
            <div className="p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
              <Mail className="h-5 w-5 text-[#0F2942]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Email
              </p>
              <p className="text-sm text-slate-700 font-semibold break-all">
                {client.email}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#D97706]/30 hover:shadow-sm transition-all group">
            <div className="p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
              <MapPin className="h-5 w-5 text-[#0F2942]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Address
              </p>
              <p className="text-sm text-slate-700 font-semibold">{client.address}</p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {client.notes && (
          <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100 mb-8">
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-2">
              Notes
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">{client.notes}</p>
          </div>
        )}

        {/* Message Button */}
        <Button
          className="w-full bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-base"
        >
          <MessageSquare className="h-5 w-5" />
          Send Message to Client
        </Button>
      </div>

      {/* Associated Cases */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-[#0F2942]">
            Associated Cases ({clientCases.length})
          </h3>
          {clientCases.length > 0 && (
            <Button
              variant="link"
              className="text-[#D97706] text-sm font-bold hover:underline p-0 h-auto"
              onClick={() => router.push("/cases")}
            >
              View All Cases <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {clientCases.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-400 h-7 w-7" />
            </div>
            <h4 className="font-bold text-[#0F2942] mb-2">No Cases Yet</h4>
            <p className="text-slate-500 text-sm mb-6">
              This client doesn&apos;t have any associated cases.
            </p>
            <Button
              onClick={() => router.push("/cases/new")}
              className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-2.5 rounded-xl font-bold"
            >
              Create New Case
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {clientCases.map((caseItem, index) => (
              <div
                key={caseItem.id}
                onClick={() => router.push(`/cases/${caseItem.id}`)}
                className={cn(
                  "p-6 hover:bg-slate-50 transition-all cursor-pointer group",
                  "animate-in fade-in slide-in-from-left-2 duration-300"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0F2942] flex items-center justify-center text-white group-hover:bg-[#D97706] transition-colors shadow-md">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F2942] group-hover:text-[#D97706] transition-colors">
                        {caseItem.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {caseItem.id} • {caseItem.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold",
                        caseItem.status === "Active"
                          ? "bg-[#0F2942]/10 text-[#0F2942]"
                          : caseItem.status === "Review"
                            ? "bg-[#D97706]/10 text-[#D97706]"
                            : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {caseItem.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(caseItem.lastUpdated).toLocaleDateString()}
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#D97706] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
