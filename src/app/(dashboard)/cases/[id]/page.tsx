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
import Link from "next/link";
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
import { useAILinks, useGenerateAILinks } from "@/lib/hooks/use-ai-links";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface CaseDetailPageProps {
  params: {
    id: string;
  };
}

// Mock documents for demo
const MOCK_DOCUMENTS = [
  { id: 1, name: "Employment Contract.pdf", type: "PDF", category: "Contract", date: "Dec 1, 2024", size: "2.4 MB" },
  { id: 2, name: "Termination Letter.pdf", type: "PDF", category: "Correspondence", date: "Nov 28, 2024", size: "156 KB" },
  { id: 3, name: "Salary Slips.pdf", type: "PDF", category: "Evidence", date: "Nov 25, 2024", size: "1.2 MB" },
];

// Mock AI suggestions for demo
const MOCK_AI_SUGGESTIONS = [
  {
    id: 1,
    regTitle: "Labor Law Article 77",
    text: "The employer may not terminate the employment contract without a valid reason...",
    confidence: 95,
    status: "pending",
  },
  {
    id: 2,
    regTitle: "Labor Law Article 80",
    text: "End-of-service benefits must be calculated based on the last wage...",
    confidence: 88,
    status: "verified",
  },
  {
    id: 3,
    regTitle: "Labor Law Article 84",
    text: "The worker shall be entitled to an award for the period of service...",
    confidence: 72,
    status: "pending",
  },
];

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const router = useRouter();
  const caseId = Number(params.id);
  const [activeTab, setActiveTab] = React.useState<"details" | "documents">("details");
  const [suggestions, setSuggestions] = React.useState(MOCK_AI_SUGGESTIONS);

  const { data: case_, isLoading } = useCase(caseId);
  const { mutate: generateLinks, isPending: isGenerating } = useGenerateAILinks(caseId);

  const toggleSuggestionStatus = (id: number, newStatus: string) => {
    setSuggestions(suggestions.map(s => 
      s.id === id ? { ...s, status: newStatus } : s
    ));
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
      <div className="py-16 text-center">
        <p className="text-sm text-slate-500">Case not found.</p>
        <Link href="/cases" className="text-[#D97706] text-sm font-bold hover:underline mt-2 inline-block">
          Back to Cases
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col lg:flex-row -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      {/* Left Panel: Case Info */}
      <div className="flex-1 overflow-y-auto p-8 pb-32 border-r border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push("/dashboard")}
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
            Back to Dashboard
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
                Client: <span className="font-bold text-slate-800">Client Name</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/cases/${caseId}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Case
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-slate-200 mb-8">
            <TabButton
              active={activeTab === "details"}
              onClick={() => setActiveTab("details")}
            >
              Case Details
            </TabButton>
            <TabButton
              active={activeTab === "documents"}
              onClick={() => setActiveTab("documents")}
              count={MOCK_DOCUMENTS.length}
            >
              Documents
            </TabButton>
          </div>

          {/* Tab Content */}
          {activeTab === "details" ? (
            <DetailsTab case_={case_} />
          ) : (
            <DocumentsTab documents={MOCK_DOCUMENTS} />
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
          <span className="text-xs bg-[#D97706] text-white px-3 py-1.5 rounded-lg font-bold shadow-sm shadow-orange-900/20">
            {suggestions.filter(s => s.status === "pending").length} Suggestions
          </span>
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-32">
          {/* Analysis info */}
          <div className="text-xs text-slate-500 text-center mb-2 font-medium bg-[#0F2942]/5 py-2 rounded-lg border border-[#0F2942]/10">
            Analyzed against 204 documents in{" "}
            <span className="font-bold text-[#0F2942]">Saudi Labor Law</span>.
          </div>

          {suggestions.map((sug) => (
            <SuggestionCard
              key={sug.id}
              suggestion={sug}
              onVerify={() => toggleSuggestionStatus(sug.id, "verified")}
              onDismiss={() => toggleSuggestionStatus(sug.id, "dismissed")}
            />
          ))}

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
  return (
    <div className="prose prose-slate max-w-none">
      <h3 className="text-xl font-bold text-[#0F2942] mb-4">Case Description</h3>
      <p className="leading-relaxed mb-8 text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        {case_.description || "No description provided."}
      </p>

      <h3 className="text-xl font-bold text-[#0F2942] mb-4">Client Requirements</h3>
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
  documents: typeof MOCK_DOCUMENTS;
}

function DocumentsTab({ documents }: DocumentsTabProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <File className="text-red-500" />;
      case "Image":
        return <ImageIcon className="text-purple-500" />;
      case "DOC":
        return <FileText className="text-blue-500" />;
      default:
        return <FileText className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-[#D97706] hover:bg-orange-50/10 transition-all group">
        <div className="bg-slate-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-[#D97706]" />
        </div>
        <p className="font-bold text-slate-700 group-hover:text-[#0F2942]">
          Upload Documents
        </p>
        <p className="text-xs mt-1">PDF, DOC, or images up to 10MB</p>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  Category
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
                        {getFileIcon(doc.type)}
                      </div>
                      <p className="font-bold text-[#0F2942] text-sm">{doc.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{doc.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{doc.size}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-[#0F2942]"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-[#0F2942]"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
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
    </div>
  );
}

/* =============================================================================
   SUGGESTION CARD COMPONENT
   ============================================================================= */

interface SuggestionCardProps {
  suggestion: {
    id: number;
    regTitle: string;
    text: string;
    confidence: number;
    status: string;
  };
  onVerify: () => void;
  onDismiss: () => void;
}

function SuggestionCard({ suggestion, onVerify, onDismiss }: SuggestionCardProps) {
  const { regTitle, text, confidence, status } = suggestion;

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
        status === "verified"
          ? "bg-white border-green-500/20 shadow-sm"
          : status === "dismissed"
          ? "bg-slate-100 border-slate-200 opacity-60"
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
          {status === "verified" && (
            <div className="bg-green-100 p-1 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          )}
        </div>

        <h4 className="font-bold text-[#0F2942] text-base mb-2">{regTitle}</h4>
        <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-[#D97706]/30 pl-3 mb-4 bg-slate-50 py-2 pr-2 rounded-r-lg">
          &ldquo;{text}&rdquo;
        </p>

        {status === "pending" && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={onVerify}
              className="flex-1 bg-[#0F2942] hover:bg-[#0a1c2e] text-white text-xs py-2.5 rounded-xl font-bold transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Link to Case
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-xs py-2.5 rounded-xl font-bold transition-all"
            >
              Dismiss
            </button>
          </div>
        )}

        {status === "verified" && (
          <div className="text-xs text-green-700 font-bold mt-2 flex items-center gap-1 bg-green-50 p-2 rounded-lg justify-center border border-green-100">
            Linked to Case Evidence.
          </div>
        )}
      </div>

      {status === "pending" && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D97706]" />
      )}
    </div>
  );
}
