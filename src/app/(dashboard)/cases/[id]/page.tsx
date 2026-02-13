/**
 * File: src/app/(dashboard)/cases/[id]/page.tsx
 * Purpose: Case detail page with split view layout.
 *
 * Layout:
 * - Left panel: Case info, tabs (Details, Documents)
 * - Right panel: AI Assistant with regulation suggestions
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Edit2,
  Sparkles,
  CheckCircle,
  Search,
  X,
  UploadCloud,
  Eye,
  Download,
  Trash2,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { useCase } from "@/lib/hooks/use-cases";
import { useAILinks, useGenerateAILinks, useVerifyLink, useDismissLink } from "@/lib/hooks/use-ai-links";
import { useDocuments, useUploadDocument, useDeleteDocument, getDocumentDownloadUrl } from "@/lib/hooks/use-documents";
import { useI18n } from "@/lib/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import type { Document } from "@/lib/types/document";
import type { CaseRegulationLink } from "@/lib/types/case";

interface CaseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const caseId = Number(resolvedParams.id);
  const [activeTab, setActiveTab] = React.useState<"details" | "documents">("details");
  const { t, isRTL } = useI18n();

  // Fetch case data
  const { data: case_, isLoading } = useCase(caseId);

  // Fetch documents for this case
  const { data: documents, isLoading: isLoadingDocuments } = useDocuments(caseId);

  // Fetch AI links/suggestions for this case
  const { data: aiLinks, isLoading: isLoadingAILinks } = useAILinks(caseId);

  // Mutations
  const { mutate: generateLinks, isPending: isGenerating } = useGenerateAILinks(caseId);
  const verifyLink = useVerifyLink();
  const dismissLink = useDismissLink();
  const uploadDocument = useUploadDocument(caseId);
  const deleteDocument = useDeleteDocument();

  const handleVerifyLink = (linkId: number) => {
    verifyLink.mutate(linkId);
  };

  const handleDismissLink = (linkId: number) => {
    dismissLink.mutate(linkId);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadDocument.mutate(file);
    }
  };

  const handleDeleteDocument = (docId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument.mutate(docId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
      </div>
    );
  }

  if (!case_) {
    return (
      <EmptyState
        icon={FileText}
        title={t("cases.caseNotFound")}
        variant="notFound"
        action={{
          label: t("cases.backToCases"),
          onClick: () => router.push("/cases"),
        }}
      />
    );
  }

  // Count pending suggestions
  const pendingCount = aiLinks?.filter(l => !l.verified)?.length || 0;

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col lg:flex-row -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      {/* Left Panel: Case Info */}
      <div className="flex-1 overflow-y-auto p-8 pb-32 border-r border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
<button
            onClick={() => router.push("/cases")}
            className={cn(
              "flex items-center text-slate-500 hover:text-[#0F2942]",
              "mb-8 text-sm font-medium group transition-colors"
            )}
          >
            <div
              className={cn(
                "bg-slate-100 p-1 rounded-md mr-2",
                "group-hover:bg-[#0F2942] group-hover:text-white transition-colors"
              )}
            >
              <ChevronRight className="rotate-180 h-3.5 w-3.5" />
            </div>
            {t("cases.backToCases")}
          </button>

          {/* Case Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <Badge variant="warning" className="mb-4">
                {case_.case_type?.replace(/_/g, " ") || "General"}
              </Badge>
              <h1 className="text-4xl font-bold text-[#0F2942] font-serif">
                {case_.title}
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Case ID:{" "}
                <span className="font-mono text-slate-700">#{case_.case_number}</span>
                {" • "}
                Client: <span className="font-bold text-slate-800">{case_.client_info || "Unknown"}</span>
              </p>
            </div>
<Button
              variant="outline"
              onClick={() => router.push(`/cases/${caseId}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {t("cases.editCase")}
            </Button>
          </div>

{/* Tab Navigation */}
          <div className="flex gap-8 border-b border-slate-200 mb-8">
            <TabButton
              active={activeTab === "details"}
              onClick={() => setActiveTab("details")}
            >
              {t("cases.caseDetails")}
            </TabButton>
            <TabButton
              active={activeTab === "documents"}
              onClick={() => setActiveTab("documents")}
              count={documents?.length}
            >
              {t("cases.documents")}
            </TabButton>
          </div>

          {/* Tab Content */}
          {activeTab === "details" ? (
            <DetailsTab case_={case_} />
          ) : (
            <DocumentsTab
              documents={documents || []}
              isLoading={isLoadingDocuments}
              onUpload={handleFileUpload}
              onDelete={handleDeleteDocument}
              isUploading={uploadDocument.isPending}
            />
          )}
        </div>
      </div>

      {/* Right Panel: AI Assistant */}
      <div className="w-full lg:w-[480px] bg-slate-50/50 backdrop-blur-sm border-l border-slate-200 flex flex-col h-full shadow-inner">
        {/* AI Header */}
        <div className="p-6 border-b border-slate-200 bg-white shadow-sm flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[#0F2942] p-2 rounded-lg text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F2942] leading-none">AI Assistant</h3>
              <p className="text-xs text-slate-500 mt-1">Regulation Matching</p>
            </div>
          </div>
<div className="flex items-center gap-2">
            <span className="text-xs bg-[#D97706] text-white px-3 py-1.5 rounded-lg font-bold shadow-sm shadow-orange-900/20">
              {pendingCount} {t("cases.suggestions")}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateLinks()}
              disabled={isGenerating}
              className="text-xs"
            >
              {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-32">
          {isLoadingAILinks ? (
<div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#D97706] mx-auto" />
              <p className="text-slate-500 text-sm mt-2">{t("common.loading")}</p>
            </div>
          ) : !aiLinks || aiLinks.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-slate-100 p-4 rounded-full w-fit mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 font-medium mb-2">{t("cases.noAiSuggestions")}</p>
              <p className="text-xs text-slate-400 mb-4">
                {t("cases.noAiSuggestionsDesc")}
              </p>
              <Button
                size="sm"
                onClick={() => generateLinks()}
                disabled={isGenerating}
                className="bg-[#D97706] hover:bg-[#B45309] text-white"
              >
                {isGenerating ? t("cases.generating") : t("cases.generateSuggestions")}
              </Button>
            </div>
          ) : (
            <>
              {/* Analysis info */}
              <div className="text-xs text-slate-500 text-center mb-2 font-medium bg-[#0F2942]/5 py-2 rounded-lg border border-[#0F2942]/10">
                {t("cases.foundMatches", { count: aiLinks.length })}
              </div>

              {aiLinks.map((link) => (
                <SuggestionCard
                  key={link.id}
                  link={link}
                  onVerify={() => handleVerifyLink(link.id)}
                  onDismiss={() => handleDismissLink(link.id)}
                  isVerifying={verifyLink.isPending}
                  isDismissing={dismissLink.isPending}
                />
              ))}
            </>
          )}

          {/* Manual Search CTA */}
          <div className="p-6 border-2 border-dashed border-slate-300 hover:border-[#D97706] rounded-2xl text-center group transition-colors cursor-pointer bg-slate-50 hover:bg-white">
            <div className="bg-white p-3 rounded-full w-fit mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <Search className="h-5 w-5 text-slate-400 group-hover:text-[#D97706]" />
            </div>
            <p className="text-sm font-bold text-slate-600 mb-1">
              Not finding what you need?
            </p>
            <p className="text-xs text-slate-400 mb-4">
              The AI might have missed something.
            </p>
            <span className="text-xs font-bold text-[#D97706] group-hover:underline">
              Search Regulations Manually
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   TAB BUTTON COMPONENT
   ============================================================================= */

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}

function TabButton({ active, onClick, children, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pb-4 text-sm font-bold tracking-wide transition-all relative",
        active ? "text-[#0F2942]" : "text-slate-400 hover:text-[#0F2942]"
      )}
    >
      {children}
      {count !== undefined && ` (${count})`}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-1 bg-[#D97706] rounded-t-full" />
      )}
    </button>
  );
}

/* =============================================================================
   DETAILS TAB
   ============================================================================= */

interface DetailsTabProps {
  case_: {
    description?: string;
  };
}

function DetailsTab({ case_ }: DetailsTabProps) {
  const { t } = useI18n();
  return (
    <div className="prose prose-slate max-w-none">
      <h3 className="text-xl font-bold text-[#0F2942] mb-4">{t("cases.caseDescription")}</h3>
      <p className="leading-relaxed mb-8 text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        {case_.description || t("cases.noDescription")}
      </p>

      <h3 className="text-xl font-bold text-[#0F2942] mb-4">{t("cases.clientRequirements")}</h3>
      <ul className="space-y-3 mb-8">
        <li className="flex items-start gap-3">
          <CheckCircle className="h-[18px] w-[18px] text-green-600 mt-1 shrink-0" />
          <span className="text-slate-700">
            Full payment of End-of-Service Benefit (SAR 145,000).
          </span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-[18px] w-[18px] text-green-600 mt-1 shrink-0" />
          <span className="text-slate-700">
            Compensation for arbitrary dismissal (3 months salary).
          </span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="h-[18px] w-[18px] text-green-600 mt-1 shrink-0" />
          <span className="text-slate-700">Certificate of Service.</span>
        </li>
      </ul>
    </div>
  );
}

/* =============================================================================
   DOCUMENTS TAB
   ============================================================================= */

interface DocumentsTabProps {
  documents: Document[];
  isLoading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (docId: number) => void;
  isUploading: boolean;
}

function DocumentsTab({ documents, isLoading, onUpload, onDelete, isUploading }: DocumentsTabProps) {
  const { t } = useI18n();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes("pdf")) {
      return <File className="text-red-500" />;
    }
    if (mimeType?.includes("image")) {
      return <ImageIcon className="text-purple-500" />;
    }
    if (mimeType?.includes("word") || mimeType?.includes("document")) {
      return <FileText className="text-blue-500" />;
    }
    return <FileText className="text-slate-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
      />

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-[#D97706] hover:bg-orange-50/10 transition-all group",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <div className="bg-slate-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-[#D97706] animate-spin" />
          ) : (
            <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-[#D97706]" />
          )}
        </div>
<p className="font-bold text-slate-700 group-hover:text-[#0F2942]">
          {isUploading ? t("cases.uploading") : t("cases.uploadDocuments")}
        </p>
        <p className="text-xs mt-1">PDF, DOC, or images up to 10MB</p>
      </div>

      {/* Documents Table */}
      {isLoading ? (
<div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#D97706] mx-auto" />
          <p className="text-slate-500 text-sm mt-2">{t("common.loading")}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
          <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">{t("documents.noDocuments")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Size
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          {getFileIcon(doc.mimeType)}
                        </div>
                        <p className="font-bold text-[#0F2942] text-sm">{doc.fileName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                        {doc.mimeType?.split("/")[1]?.toUpperCase() || "FILE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={getDocumentDownloadUrl(doc.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-[#0F2942]"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={getDocumentDownloadUrl(doc.id)}
                          download
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-[#0F2942]"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => onDelete(doc.id)}
                          className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   SUGGESTION CARD COMPONENT
   ============================================================================= */

interface SuggestionCardProps {
  link: CaseRegulationLink;
  onVerify: () => void;
  onDismiss: () => void;
  isVerifying: boolean;
  isDismissing: boolean;
}

function SuggestionCard({ link, onVerify, onDismiss, isVerifying, isDismissing }: SuggestionCardProps) {
  const confidence = Math.round((link.similarity_score || 0) * 100);
  const isVerified = link.verified;

  const confidenceColor =
    confidence > 90
      ? "bg-green-100 text-green-700"
      : confidence > 70
        ? "bg-[#0F2942]/10 text-[#0F2942]"
        : "bg-slate-100 text-slate-600";

  return (
    <div
      className={cn(
        "rounded-2xl border-2 transition-all duration-300 overflow-hidden relative",
        isVerified
          ? "bg-white border-green-500/20 shadow-sm"
          : "bg-white border-[#D97706] shadow-lg shadow-orange-900/10 ring-4 ring-orange-50"
      )}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide",
              confidenceColor
            )}
          >
            {confidence}% Confidence
          </span>
          {isVerified && (
            <div className="bg-green-100 p-1 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          )}
        </div>

        <h4 className="font-bold text-[#0F2942] text-base mb-2">
          {link.regulation?.title || `Regulation #${link.regulation_id}`}
        </h4>
        {link.regulation?.regulation_number && (
          <p className="text-xs text-slate-500 mb-2">
            {link.regulation.regulation_number}
          </p>
        )}
        <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-[#D97706]/30 pl-3 mb-4 bg-slate-50 py-2 pr-2 rounded-r-lg">
          Matched via {link.method || "AI"} analysis
        </p>

        {!isVerified && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={onVerify}
              disabled={isVerifying}
              className="flex-1 bg-[#0F2942] hover:bg-[#0a1c2e] text-white text-xs py-2.5 rounded-xl font-bold transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              Link to Case
            </button>
            <button
              onClick={onDismiss}
              disabled={isDismissing}
              className="flex-1 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-xs py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        )}

        {isVerified && (
          <div className="text-xs text-green-700 font-bold mt-2 flex items-center gap-1 bg-green-50 p-2 rounded-lg justify-center border border-green-100">
            Linked to Case Evidence.
          </div>
        )}
      </div>

      {!isVerified && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D97706]" />
      )}
    </div>
  );
}
