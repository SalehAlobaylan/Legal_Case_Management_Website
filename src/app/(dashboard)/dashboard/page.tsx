/*
 * File: src/app/(dashboard)/dashboard/page.tsx
 *  - Shows high-level case statistics (total, open, closed, pending hearings).
 *  - Lists a small set of recent cases for quick access.
 *  - Uses the shared Card and Badge primitives for a polished, consistent UI.
 */

"use client";

import { useCases } from "@/lib/hooks/use-cases";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import type { Case } from "@/lib/types/case";

export default function DashboardPage() {
  const { data: cases, isLoading, error } = useCases();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-red-500">
          Unable to load dashboard data. Please try again.
        </p>
      </div>
    );
  }

  const stats = buildStats(cases ?? []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Cases"
          value={stats.total}
          icon={<Briefcase className="h-8 w-8" />}
          trend="+12% from last month"
        />
        <StatsCard
          title="Open Cases"
          value={stats.open}
          icon={<Clock className="h-8 w-8" />}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Closed Cases"
          value={stats.closed}
          icon={<CheckCircle className="h-8 w-8" />}
          iconColor="text-green-500"
        />
        <StatsCard
          title="Pending Hearings"
          value={stats.pending}
          icon={<TrendingUp className="h-8 w-8" />}
          iconColor="text-orange-500"
        />
      </div>

      {/* Recent Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {cases && cases.length > 0 ? (
            <div className="space-y-3">
              {cases.slice(0, 5).map((case_) => (
                <div
                  key={case_.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3 text-sm dark:border-gray-800"
                >
                  <div>
                    <p className="font-medium">{case_.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Case #{case_.case_number}
                    </p>
                  </div>
                  <Badge className="shrink-0">
                    {formatStatus(case_.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">
              No cases yet. Create your first case to see it here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function buildStats(cases: Case[]) {
  return {
    total: cases.length,
    open: cases.filter((c) => c.status === "open").length,
    closed: cases.filter((c) => c.status === "closed").length,
    pending: cases.filter((c) => c.status === "pending_hearing").length,
  };
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconColor?: string;
  trend?: string;
}

function StatsCard({
  title,
  value,
  icon,
  iconColor = "text-blue-600",
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
          )}
        </div>
        <div className={iconColor}>{icon}</div>
      </CardContent>
    </Card>
  );
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}



