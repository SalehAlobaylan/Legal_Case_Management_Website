/*
 * File: src/components/features/cases/case-card.tsx
 * Purpose: Compact, clickable card representation of a case for list/grid views.
 */

"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Case } from "@/lib/types/case";
import { CalendarClock, MapPin, Briefcase } from "lucide-react";

interface CaseCardProps {
  case_: Case;
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CaseCard({ case_ }: CaseCardProps) {
  return (
    <Link href={`/cases/${case_.id}`}>
      <Card className="h-full cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">
              {case_.title}
            </CardTitle>
            <Badge className="shrink-0 text-[0.65rem]">
              {formatStatus(case_.status)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Case #{case_.case_number}
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-xs">
          {case_.description && (
            <p className="line-clamp-2 text-muted-foreground">
              {case_.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              {formatStatus(case_.case_type)}
            </span>
            {case_.court_jurisdiction && (
              <span className="inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {case_.court_jurisdiction}
              </span>
            )}
            {case_.next_hearing && (
              <span className="inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                <CalendarClock className="h-3 w-3" />
                Next hearing: {new Date(case_.next_hearing).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


