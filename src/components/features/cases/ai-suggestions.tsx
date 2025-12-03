"use client";

/*
 * File: src/components/features/cases/ai-suggestions.tsx
 * Purpose: Rich AI suggestions panel for case detail view.
 *  - Shows AI-suggested regulations with similarity scores and verification.
 *  - Allows the user to trigger generation and verify individual links.
 * Optimized to rely on React Query for data and avoid unnecessary effects.
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVerifyLink } from "@/lib/hooks/use-ai-links";
import type { CaseRegulationLink } from "@/lib/types/case";
import { Sparkles, Check, Loader2, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AISuggestionsPanelProps {
  caseId: number;
  links: CaseRegulationLink[];
  isLoading: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function AISuggestionsPanel({
  links,
  isLoading,
  isGenerating,
  onGenerate,
}: AISuggestionsPanelProps) {
  const { mutate: verifyLink, isPending: isVerifying } = useVerifyLink();

  if (isLoading || isGenerating) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">
            Generating AI suggestions...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (links.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No AI suggestions yet</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Generate AI-powered regulation suggestions for this case.
          </p>
          <Button onClick={onGenerate}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Suggestions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {links.length} AI-suggested regulations
        </p>
        <Button variant="outline" size="sm" onClick={onGenerate}>
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {links.map((link) => {
          const score = normalizeScore(link.similarity_score);

          return (
            <Card
              key={link.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold text-white",
                          getScoreColor(score)
                        )}
                      >
                        {Math.round(score * 100)}%
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {link.regulation?.title || "Regulation"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {link.regulation?.category ||
                            link.regulation?.regulation_number ||
                            "Suggested by AI based on case facts"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[0.7rem]">
                        {link.method === "ai" ? "AI Generated" : "Manual"}
                      </Badge>
                      {link.verified && (
                        <Badge className="flex items-center gap-1 text-[0.7rem]">
                          <Check className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!link.verified && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isVerifying}
                      onClick={() => verifyLink(link.id)}
                      className="shrink-0 text-xs"
                    >
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      Verify
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function normalizeScore(raw: number | string): number {
  const n = typeof raw === "number" ? raw : parseFloat(raw);
  if (Number.isNaN(n)) return 0;
  if (n > 1) return Math.max(0, Math.min(1, n / 100));
  return Math.max(0, Math.min(1, n));
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return "bg-green-500";
  if (score >= 0.6) return "bg-orange-500";
  return "bg-red-500";
}


