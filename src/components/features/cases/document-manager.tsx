/*
 * File: src/components/features/cases/document-manager.tsx
 * Purpose: Component for uploading, listing, and managing case documents.
 * Used by: Case details page in the Documents tab.
 */

"use client";

import { useState, useCallback } from "react";
import { Upload, Download, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocuments, useUploadDocument, useDeleteDocument, getDocumentDownloadUrl } from "@/lib/hooks/use-documents";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/format";
import { MAX_FILE_SIZE, isAllowedFileType, ALLOWED_EXTENSIONS } from "@/lib/types/document";
import { cn } from "@/lib/utils/cn";

interface DocumentManagerProps {
    caseId: number;
}

export function DocumentManager({ caseId }: DocumentManagerProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { data: documents, isLoading } = useDocuments(caseId);
    const { mutate: uploadDocument, isPending: isUploading } = useUploadDocument(caseId);
    const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

    const handleFile = useCallback(
        (file: File) => {
            setUploadError(null);

            // Validate file type
            if (!isAllowedFileType(file.type)) {
                setUploadError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
                return;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                setUploadError(`File too large. Maximum size: ${formatFileSize(MAX_FILE_SIZE)}`);
                return;
            }

            uploadDocument(file, {
                onError: (error) => {
                    setUploadError(error instanceof Error ? error.message : "Upload failed");
                },
            });
        },
        [uploadDocument]
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
            // Reset input so the same file can be selected again
            e.target.value = "";
        },
        [handleFile]
    );

    const handleDownload = (docId: number, fileName: string) => {
        const url = getDocumentDownloadUrl(docId);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDelete = (docId: number) => {
        if (confirm("Are you sure you want to delete this document?")) {
            deleteDocument(docId);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
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
                        isUploading && "opacity-50 pointer-events-none"
                    )}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                                Drag and drop a file here, or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                                Allowed: {ALLOWED_EXTENSIONS.join(", ")} • Max size: {formatFileSize(MAX_FILE_SIZE)}
                            </p>
                            <label className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept={ALLOWED_EXTENSIONS.join(",")}
                                    onChange={handleFileInput}
                                />
                                Choose File
                            </label>
                        </>
                    )}
                </div>

                {/* Upload Error */}
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
                                        <p className="text-sm font-medium truncate">{doc.fileName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(doc.fileSize)} • {formatRelativeTime(doc.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDownload(doc.id, doc.fileName)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">Download</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(doc.id)}
                                        disabled={isDeleting}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No documents uploaded yet
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
