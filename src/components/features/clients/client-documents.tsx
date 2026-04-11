"use client";

import React, { useState } from "react";
import { useClientDocuments } from "@/lib/hooks/use-clients";
import { useI18n } from "@/lib/hooks/use-i18n";
import { FileText, Download, UploadCloud, Eye, Trash2, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentViewerModal } from "@/components/ui/document-viewer-modal";
import { cn } from "@/lib/utils/cn";

interface Props {
  clientId: number;
}

export function ClientDocuments({ clientId }: Props) {
  const { t, isRTL } = useI18n();
  const { data: documents, isLoading } = useClientDocuments(clientId);
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; type: string; name: string } | null>(null);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const IconType = (type: string) => {
    if (type?.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (type?.includes("image")) return <FileText className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#D97706]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-800">{t("clients.documents.title")}</h3>
          <p className="text-sm text-slate-500 mt-1">{t("clients.documents.description")}</p>
        </div>
        <Button className="bg-[#D97706] hover:bg-[#B45309] text-white flex items-center gap-2 rounded-xl">
          <UploadCloud className="w-4 h-4" />
          {t("clients.documents.uploadDocument")}
        </Button>
      </div>

      {!documents || documents.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={t("clients.documents.noDocumentsYet")}
          description={t("clients.documents.noDocumentsDesc")}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th className="px-5 py-4">{t("clients.documents.documentName")}</th>
                <th className="px-5 py-4">{t("clients.documents.uploadedBy")}</th>
                <th className="px-5 py-4">{t("clients.documents.date")}</th>
                <th className="px-5 py-4">{t("clients.documents.size")}</th>
                <th className={`px-5 py-4 ${isRTL ? "text-left" : "text-right"}`}>{t("clients.documents.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        {IconType(doc.fileType || "")}
                      </div>
                      <span className="font-semibold text-slate-700 text-sm">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">{doc.uploadedBy?.fullName || t("clients.documents.system")}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">{formatFileSize(doc.fileSize)}</span>
                  </td>
                  <td className={`px-5 py-4 ${isRTL ? "text-left" : "text-right"}`}>
                    <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "justify-end")}>
                      <button 
                        onClick={() => setSelectedDoc({ url: doc.fileUrl, type: doc.fileType || "application/pdf", name: doc.name })}
                        className="p-1.5 text-slate-400 hover:text-[#D97706] hover:bg-[#D97706]/10 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DocumentViewerModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        documentUrl={selectedDoc?.url || ""}
        documentMimeType={selectedDoc?.type || "application/pdf"}
        documentName={selectedDoc?.name || "Document"}
      />
    </div>
  );
}
