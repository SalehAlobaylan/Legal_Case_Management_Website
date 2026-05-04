/*
 * File: src/components/features/cases/document-manager.tsx
 * Purpose: Component for uploading, listing, and managing case documents.
 * Used by: Case details page in the Documents tab.
 */

"use client";

import { useState, useCallback } from "react";
import { Upload, Download, Trash2, FileText, Loader2, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/dialog";
import { DocumentViewerModal } from "@/components/ui/document-viewer-modal";
import { useDocuments, useUploadDocument, useDeleteDocument } from "@/lib/hooks/use-documents";
import { documentsApi } from "@/lib/api/documents";
import { useI18n } from "@/lib/hooks/use-i18n";
import { useToast } from "@/components/ui/use-toast";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/format";
import {
    MAX_FILE_SIZE,
    isAllowedFileType,
    ALLOWED_EXTENSIONS,
    ALLOWED_FILE_TYPES,
    type Document,
} from "@/lib/types/document";
import { cn } from "@/lib/utils/cn";

interface DocumentManagerProps {
    caseId: number;
}

type ExtractionStatus = NonNullable<Document["extractionStatus"]>;

const STATUS_VARIANT: Record<ExtractionStatus, BadgeVariant> = {
    pending: "default",
    processing: "info",
    ready: "success",
    failed: "error",
    unsupported: "warning",
};

export function DocumentManager({ caseId }: DocumentManagerProps) {
    const { t } = useI18n();
    const { toast } = useToast();

    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadPercent, setUploadPercent] = useState<number>(0);
    const [pendingDelete, setPendingDelete] = useState<Document | null>(null);
    const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string; mime: string } | null>(null);
    const [previewLoadingId, setPreviewLoadingId] = useState<number | null>(null);

    const { data: documents, isLoading } = useDocuments(caseId);
    const { mutate: uploadDocument, isPending: isUploading } = useUploadDocument(
        caseId,
        (percent) => setUploadPercent(percent)
    );
    const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

    const handleFile = useCallback(
        (file: File) => {
            setUploadError(null);
            setUploadPercent(0);

            if (!isAllowedFileType(file.type, file.name)) {
                setUploadError(
                    t("documents.invalidFileType", { types: ALLOWED_EXTENSIONS.join(", ") })
                );
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                setUploadError(
                    t("documents.fileTooLarge", { size: formatFileSize(MAX_FILE_SIZE) })
                );
                return;
            }

            uploadDocument(file, {
                onError: (error) => {
                    const message =
                        error instanceof Error ? error.message : t("documents.uploadFailed");
                    setUploadError(message);
                    toast({
                        title: t("documents.uploadFailed"),
                        description: message,
                        variant: "destructive",
                    });
                },
                onSettled: () => setUploadPercent(0),
            });
        },
        [uploadDocument, t, toast]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
        },
        [handleFile]
    );

    const handleDownload = (docId: number, fileName: string) => {
        documentsApi.downloadDocument(docId, fileName);
    };

    const handlePreview = async (doc: Document) => {
        try {
            setPreviewLoadingId(doc.id);
            const url = await documentsApi.getDocumentBlobUrl(doc.id);
            setPreviewDoc({ url, name: doc.fileName, mime: doc.mimeType });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : t("documents.previewError");
            toast({
                title: t("documents.previewError"),
                description: message,
                variant: "destructive",
            });
        } finally {
            setPreviewLoadingId(null);
        }
    };

    const closePreview = () => {
        if (previewDoc?.url?.startsWith("blob:")) {
            URL.revokeObjectURL(previewDoc.url);
        }
        setPreviewDoc(null);
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        const docId = pendingDelete.id;
        setPendingDelete(null);
        deleteDocument(docId, {
            onError: (error) => {
                const message =
                    error instanceof Error ? error.message : t("documents.deleteFailed");
                toast({
                    title: t("documents.deleteFailed"),
                    description: message,
                    variant: "destructive",
                });
            },
        });
    };

    const renderStatus = (doc: Document) => {
        const status = doc.extractionStatus;
        if (!status) return null;
        const variant = STATUS_VARIANT[status];
        const label = t(`documents.status${status.charAt(0).toUpperCase()}${status.slice(1)}`);
        const warnings = doc.extractionWarnings ?? [];
        const tooltipParts: string[] = [];
        if (doc.extractionErrorCode) tooltipParts.push(doc.extractionErrorCode);
        if (warnings.length) tooltipParts.push(...warnings);
        return (
            <Badge
                variant={variant}
                size="sm"
                title={tooltipParts.length ? tooltipParts.join(" • ") : undefined}
            >
                {status === "processing" && (
                    <Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />
                )}
                {(status === "failed" || status === "unsupported") && (
                    <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                )}
                {label}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t("documents.title")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upload Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        isDragOver
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-muted-foreground/50",
                        isUploading && "opacity-80 pointer-events-none"
                    )}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                                {uploadPercent > 0
                                    ? t("documents.uploadingPercent", { percent: uploadPercent })
                                    : t("documents.uploading")}
                            </p>
                            <div
                                className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden"
                                role="progressbar"
                                aria-valuenow={uploadPercent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    className="h-full bg-primary transition-all duration-150"
                                    style={{ width: `${uploadPercent}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                                {t("documents.dragDrop")}
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                                {t("documents.allowedTypes", {
                                    types: ALLOWED_EXTENSIONS.join(", "),
                                    size: formatFileSize(MAX_FILE_SIZE),
                                })}
                            </p>
                            <label className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept={[...ALLOWED_FILE_TYPES, ...ALLOWED_EXTENSIONS].join(",")}
                                    onChange={handleFileInput}
                                />
                                {t("documents.chooseFile")}
                            </label>
                        </>
                    )}
                </div>

                {uploadError && (
                    <p className="text-sm text-destructive">{uploadError}</p>
                )}

                {/* Documents List */}
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : documents && documents.length > 0 ? (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-medium truncate">{doc.fileName}</p>
                                            {renderStatus(doc)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(doc.fileSize)} • {formatRelativeTime(doc.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handlePreview(doc)}
                                        disabled={previewLoadingId === doc.id}
                                        className="h-8 w-8 p-0"
                                    >
                                        {previewLoadingId === doc.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">{t("documents.preview")}</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDownload(doc.id, doc.fileName)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">{t("documents.download")}</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPendingDelete(doc)}
                                        disabled={isDeleting}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">{t("documents.delete")}</span>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        {t("documents.noDocuments")}
                    </p>
                )}
            </CardContent>

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                title={t("documents.confirmDeleteTitle")}
                description={t("documents.confirmDelete")}
                confirmText={t("documents.delete")}
                cancelText={t("documents.cancel")}
                variant="danger"
                onConfirm={confirmDelete}
            />

            <DocumentViewerModal
                isOpen={!!previewDoc}
                onClose={closePreview}
                documentUrl={previewDoc?.url ?? null}
                documentName={previewDoc?.name ?? ""}
                documentMimeType={previewDoc?.mime ?? "application/octet-stream"}
            />
        </Card>
    );
}
