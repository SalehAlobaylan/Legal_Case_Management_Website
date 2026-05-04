"use client";

import * as React from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { Download, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/hooks/use-i18n";
import { cn } from "@/lib/utils/cn";

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentUrl: string | null;
    documentName: string;
    documentMimeType: string;
}

// Mime types that react-doc-viewer (or the browser) can render inline.
// Anything outside this set falls back to a "download instead" prompt.
const PREVIEWABLE_MIME = new Set<string>([
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "text/plain",
    "text/csv",
    "text/tab-separated-values",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.ms-excel",
]);

function isPreviewable(mime: string): boolean {
    if (!mime) return false;
    if (PREVIEWABLE_MIME.has(mime)) return true;
    // Be permissive with image/* — DocViewer handles arbitrary image MIME types.
    if (mime.startsWith("image/")) return true;
    return false;
}

export function DocumentViewerModal({
    isOpen,
    onClose,
    documentUrl,
    documentName,
    documentMimeType,
}: DocumentViewerModalProps) {
    const { t } = useI18n();
    const [hasError, setHasError] = React.useState(false);

    // Reset error state every time a new document is opened.
    React.useEffect(() => {
        if (isOpen && documentUrl) {
            setHasError(false);
        }
    }, [isOpen, documentUrl]);

    const handleDownload = () => {
        if (!documentUrl) return;
        const a = document.createElement("a");
        a.href = documentUrl;
        a.download = documentName || "document";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!isOpen || !documentUrl) return null;

    const supported = isPreviewable(documentMimeType);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                size="xl"
                className={cn(
                    "flex flex-col p-0 overflow-hidden",
                    // Mobile: full-screen. Desktop: 90vh modal.
                    "h-[100dvh] max-h-[100dvh] rounded-none w-screen max-w-screen",
                    "sm:h-[90vh] sm:max-h-[90vh] sm:rounded-2xl sm:w-full sm:max-w-4xl"
                )}
            >
                <DialogHeader className="shrink-0 border-b p-4 px-6 flex flex-row items-center justify-between gap-3">
                    <DialogTitle className="truncate pr-8 flex-1 min-w-0">{documentName}</DialogTitle>
                    {supported && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownload}
                            className="shrink-0"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            {t("documents.download")}
                        </Button>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative bg-slate-100/50">
                    {!supported || hasError ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
                            <AlertTriangle className="h-10 w-10 text-amber-500" />
                            <p className="text-sm text-slate-700">
                                {hasError
                                    ? t("documents.previewError")
                                    : t("documents.previewUnsupported")}
                            </p>
                            <Button onClick={handleDownload} variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                {t("documents.downloadInstead")}
                            </Button>
                        </div>
                    ) : (
                        <DocViewerErrorBoundary onError={() => setHasError(true)}>
                            <DocViewer
                                documents={[{
                                    uri: documentUrl,
                                    fileType: documentMimeType,
                                }]}
                                pluginRenderers={DocViewerRenderers}
                                config={{
                                    header: {
                                        disableHeader: true,
                                        disableFileName: true,
                                        retainURLParams: false,
                                    },
                                }}
                                style={{ height: "100%", width: "100%" }}
                            />
                        </DocViewerErrorBoundary>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface ErrorBoundaryProps {
    onError: () => void;
    children: React.ReactNode;
}

class DocViewerErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch() {
        this.props.onError();
    }

    render() {
        if (this.state.hasError) return null;
        return this.props.children;
    }
}
