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
  FileText,
  Edit2,
  Building2,
  User,
  Users,
  Briefcase,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useClient, useClientCases } from "@/lib/hooks/use-clients";
import { useI18n } from "@/lib/hooks/use-i18n";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClientActivityTimeline } from "@/components/features/clients/client-activity-timeline";
import { ClientDocuments } from "@/components/features/clients/client-documents";
import { ClientFinancials } from "@/components/features/clients/client-financials";
import { ClientMessagingCenter } from "@/components/features/clients/client-messaging-center";

/* =============================================================================
   CLIENT TYPE ICON MAPPING
   ============================================================================= */

const getTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "individual":
      return User;
    case "company":
    case "corporate":
      return Building2;
    case "sme":
      return Briefcase;
    case "group":
      return Users;
    default:
      return User;
  }
};

const getTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "individual":
      return "text-blue-600 bg-blue-100";
    case "company":
    case "corporate":
      return "text-purple-600 bg-purple-100";
    case "sme":
      return "text-green-600 bg-green-100";
    case "group":
      return "text-orange-600 bg-orange-100";
    default:
      return "text-slate-600 bg-slate-100";
  }
};

const getStatusColor = (clientType: string) => {
  // Active clients have associated cases
  return "bg-green-100 text-green-700";
};

/* =============================================================================
   PAGE COMPONENT
   ============================================================================= */

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t, isRTL } = useI18n();
  const clientId = Number(params.id as string);

  // Fetch client and their cases from API
  const { data: client, isLoading: isLoadingClient, error: clientError } = useClient(clientId);
  const { data: clientCases, isLoading: isLoadingCases } = useClientCases(clientId);

  // Loading state
  if (isLoadingClient) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
          <p className="text-slate-500 text-sm">{t("clients.loadingDetails")}</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (clientError || !client) {
    return (
      <EmptyState
        icon={User}
        title={t("clients.clientNotFound")}
        description={t("clients.clientNotFoundDesc")}
        variant="notFound"
        action={{
          label: t("clients.backToClients"),
          onClick: () => router.push("/clients"),
        }}
      />
    );
  }

  const TypeIcon = getTypeIcon(client.type);
  const displayType =
    client.type === "individual"
      ? t("clients.types.individual")
      : client.type === "sme"
        ? t("clients.types.sme")
        : client.type === "group"
          ? t("clients.types.group")
          : t("clients.types.corporate");
  const displayPhone = client.contactPhone || client.phone;
  const displayEmail = client.contactEmail || client.email;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <button
        onClick={() => router.push("/clients")}
        className={cn(
          "flex items-center text-slate-500 hover:text-brand-primary text-sm font-medium group transition-colors",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}
      >
        <ChevronRight className={cn("h-4 w-4", isRTL ? "rotate-0 ml-2" : "rotate-180 mr-2")} />
        {t("clients.backToDirectory")}
      </button>

      {/* Client Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F2942] font-serif">
                {client.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-slate-500 text-sm font-medium">{t("clients.clientId")}: {client.id}</span>
                <span className="text-slate-300">•</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
                    getTypeColor(client.type)
                  )}
                >
                  <TypeIcon className="h-3.5 w-3.5" />
                  {displayType}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold",
                getStatusColor(client.type)
              )}
            >
{t("common.active")}
            </span>
            <Button
              variant="outline"
              className="px-4 py-2 rounded-xl font-bold flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {t("common.edit")}
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
                 {t("clients.form.phone")}
              </p>
               <p className="text-sm text-slate-700 font-semibold">{displayPhone || t("common.notProvided")}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#D97706]/30 hover:shadow-sm transition-all group">
            <div className="p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
              <Mail className="h-5 w-5 text-[#0F2942]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                 {t("clients.form.email")}
              </p>
              <p className="text-sm text-slate-700 font-semibold break-all">
                {displayEmail || t("common.notProvided")}
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
                 {t("clients.form.address")}
              </p>
              <p className="text-sm text-slate-700 font-semibold">{client.address || t("common.notProvided")}</p>
            </div>
          </div>
        </div>

        </div>

        <div className="mt-8">
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-transparent h-auto p-0 mb-8 gap-8 overflow-x-auto">
              <TabsTrigger 
                value="overview" 
                className="bg-transparent! rounded-none border-b-2 border-transparent data-[state=active]:border-[#D97706] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 font-semibold text-slate-500 data-[state=active]:text-[#D97706]"
              >
                {t("clients.overviewCases")}
              </TabsTrigger>
              <TabsTrigger 
                value="timeline" 
                className="bg-transparent! rounded-none border-b-2 border-transparent data-[state=active]:border-[#D97706] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 font-semibold text-slate-500 data-[state=active]:text-[#D97706]"
              >
                {t("clients.activityTimeline")}
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="bg-transparent! rounded-none border-b-2 border-transparent data-[state=active]:border-[#D97706] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 font-semibold text-slate-500 data-[state=active]:text-[#D97706]"
              >
                {t("clients.documents.tab")}
              </TabsTrigger>
              <TabsTrigger 
                value="financials" 
                className="bg-transparent! rounded-none border-b-2 border-transparent data-[state=active]:border-[#D97706] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 font-semibold text-slate-500 data-[state=active]:text-[#D97706]"
              >
                {t("clients.financials.tab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 space-y-8 animate-in fade-in duration-500">
              {/* Notes Section */}
              {client.notes && (
                <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100">
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-2">
                    {t("clients.overview.notes")}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">{client.notes}</p>
                </div>
              )}

              {/* Messaging Center */}
              <ClientMessagingCenter clientId={client.id} />

              {/* Associated Cases */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#0F2942]">
                    {t("clients.associatedCases")} ({isLoadingCases ? "..." : clientCases?.length || 0})
                  </h3>
                  {clientCases && clientCases.length > 0 && (
                    <Button
                      variant="link"
                      className="text-[#D97706] text-sm font-bold hover:underline p-0 h-auto"
                      onClick={() => router.push("/cases")}
                    >
                      {t("clients.viewAllCases")} <ChevronRight className={cn("h-4 w-4", isRTL ? "rotate-180 mr-1" : "ml-1")} />
                    </Button>
                  )}
                </div>

                {isLoadingCases ? (
                  <div className="p-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#D97706] mx-auto" />
                    <p className="text-slate-500 text-sm mt-2">{t("cases.loadingCases")}</p>
                  </div>
                ) : !clientCases || clientCases.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-slate-400 h-7 w-7" />
                    </div>
                    <h4 className="font-bold text-[#0F2942] mb-2">{t("clients.overview.noCasesYet")}</h4>
                    <p className="text-slate-500 text-sm mb-6">
                      {t("clients.overview.noCasesDesc")}
                    </p>
                    <Button
                      onClick={() => router.push("/cases/new")}
                      className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-2.5 rounded-xl font-bold"
                    >
                      {t("clients.overview.createNewCase")}
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
                                {caseItem.case_number} • {caseItem.case_type?.replace(/_/g, " ")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-bold",
                                caseItem.status === "open" || caseItem.status === "in_progress"
                                  ? "bg-[#0F2942]/10 text-[#0F2942]"
                                  : caseItem.status === "pending_hearing"
                                    ? "bg-[#D97706]/10 text-[#D97706]"
                                    : "bg-slate-200 text-slate-600"
                              )}
                            >
                              {caseItem.status?.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-slate-400">
                              {caseItem.updated_at ? new Date(caseItem.updated_at).toLocaleDateString() : ""}
                            </span>
                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#D97706] group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-0 animate-in fade-in duration-500">
              <ClientActivityTimeline clientId={clientId} />
            </TabsContent>

            <TabsContent value="documents" className="mt-0 animate-in fade-in duration-500">
              <ClientDocuments clientId={clientId} />
            </TabsContent>
            
              <TabsContent value="financials" className="mt-0 animate-in fade-in duration-500">
                <ClientFinancials clientId={client.id} />
              </TabsContent>
            </Tabs>
        </div>

    </div>
  );
}
