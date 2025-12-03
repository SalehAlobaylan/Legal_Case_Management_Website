"use client";

/*
 * File: src/app/(dashboard)/cases/[id]/page.tsx
 * Purpose: Case detail page with AI suggestions (Phase 5.2).
 * Uses TanStack Query hooks for data and avoids manual effects.
 */

import { useMemo } from "react";
import { useCase } from "@/lib/hooks/use-cases";
import {
  useAILinks,
  useGenerateAILinks,
} from "@/lib/hooks/use-ai-links";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AISuggestionsPanel } from "@/components/features/cases/ai-suggestions";
import { Loader2, Sparkles } from "lucide-react";

interface CaseDetailPageProps {
  params: {
    id: string;
  };
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const caseId = Number(params.id);

  const {
    data: case_,
    isLoading: caseLoading,
  } = useCase(caseId);
  const {
    data: aiLinks,
    isLoading: linksLoading,
  } = useAILinks(caseId);
  const {
    mutate: generateLinks,
    isPending: isGenerating,
  } = useGenerateAILinks(caseId);

  const hasCase = !!case_;

  const stats = useMemo(
    () => ({
      statusLabel: case_?.status.replace(/_/g, " ").toUpperCase(),
      caseTypeLabel: case_?.case_type.replace(/_/g, " "),
    }),
    [case_]
  );

  if (caseLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!hasCase || !case_) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Case not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {case_.title}
            </h1>
            <Badge variant="outline" className="text-[0.7rem]">
              #{case_.case_number}
            </Badge>
            <Badge className="text-[0.7rem]">
              {stats.statusLabel}
            </Badge>
          </div>
          {case_.description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {case_.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateLinks()}
            disabled={isGenerating}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate AI Links"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="ai-suggestions">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Type
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {stats.caseTypeLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {stats.statusLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Court
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {case_.court_jurisdiction || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Filing Date
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {case_.filing_date
                      ? new Date(case_.filing_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-suggestions">
          <AISuggestionsPanel
            caseId={caseId}
            links={aiLinks || []}
            isLoading={linksLoading}
            isGenerating={isGenerating}
            onGenerate={() => generateLinks()}
          />
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Document management will be implemented in a later phase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


