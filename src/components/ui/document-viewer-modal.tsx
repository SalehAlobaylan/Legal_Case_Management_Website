import * as React from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/hooks/use-i18n";

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentUrl: string | null;
    documentName: string;
    documentMimeType: string;
}

export function DocumentViewerModal({
    isOpen,
    onClose,
    documentUrl,
    documentName,
    documentMimeType,
}: DocumentViewerModalProps) {
    const { t } = useI18n();

    if (!isOpen || !documentUrl) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="xl" className="h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="shrink-0 border-b p-4 px-6 flex flex-row items-center justify-between">
                    <DialogTitle className="truncate pr-8">{documentName}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden relative bg-slate-100/50">
                    <DocViewer
                        documents={[{
                            uri: documentUrl,
                            fileType: documentMimeType
                        }]}
                        pluginRenderers={DocViewerRenderers}
                        config={{
                            header: {
                                disableHeader: true,
                                disableFileName: true,
                                retainURLParams: false
                            }
                        }}
                        style={{ height: "100%", width: "100%" }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
