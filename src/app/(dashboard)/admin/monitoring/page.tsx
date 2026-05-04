"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { usePermission } from "@/lib/hooks/use-permission";
import { useAuthStore } from "@/lib/store/auth-store";
import { regulationsApi } from "@/lib/api/regulations";
import { Loader2, Play, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface MonitorRun {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  triggerSource: string;
  dryRun: boolean;
  scanned: number;
  changed: number;
  versionsCreated: number;
  failed: number;
  errorMessage: string | null;
}

interface MonitorHealth {
  hasRun: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
  minutesSinceLastRun: number | null;
  failedRuns24h: number;
  successfulRuns24h: number;
}

export default function MonitoringDashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isAdmin } = usePermission();
  const { toast } = useToast();

  const [runs, setRuns] = React.useState<MonitorRun[]>([]);
  const [health, setHealth] = React.useState<MonitorHealth | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isTriggering, setIsTriggering] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadRuns = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await regulationsApi.getMonitorRuns(50);
      setRuns(data.runs);
      setHealth(data.health);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load monitor runs"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (!isAdmin()) {
      router.replace("/dashboard");
      return;
    }
    loadRuns();
  }, [isAuthenticated, isAdmin, router, loadRuns]);

  const handleTriggerRun = async () => {
    setIsTriggering(true);
    try {
      const result = await regulationsApi.triggerMonitorRun({});
      toast({
        title: "Monitor run completed",
        description: `Scanned ${result.scanned}, changed ${result.changed}, versions created ${result.versionsCreated}, failed ${result.failed}.`,
      });
      await loadRuns();
    } catch (err) {
      toast({
        title: "Monitor run failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const totalRuns24h =
    (health?.successfulRuns24h || 0) + (health?.failedRuns24h || 0);
  const successRate24h =
    totalRuns24h > 0
      ? Math.round(((health?.successfulRuns24h || 0) / totalRuns24h) * 100)
      : null;

  const totals = React.useMemo(() => {
    const since24h = Date.now() - 24 * 60 * 60 * 1000;
    let scanned = 0;
    let changed = 0;
    let versions = 0;
    let failed = 0;
    for (const run of runs) {
      const t = new Date(run.startedAt).getTime();
      if (t < since24h) continue;
      scanned += run.scanned;
      changed += run.changed;
      versions += run.versionsCreated;
      failed += run.failed;
    }
    return { scanned, changed, versions, failed };
  }, [runs]);

  if (isLoading && runs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Regulation Monitoring</h1>
          <p className="text-sm text-muted-foreground">
            Health and recent runs for the regulation source poller.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRuns}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleTriggerRun}
            disabled={isTriggering}
          >
            {isTriggering ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run now
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Runs (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRuns24h}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Success rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {successRate24h !== null ? `${successRate24h}%` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Regs scanned (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.scanned}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Versions created (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {totals.versions}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Failures (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                totals.failed > 0 ? "text-red-600" : ""
              }`}
            >
              {totals.failed}
            </p>
          </CardContent>
        </Card>
      </div>

      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              {health.lastStatus === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : health.lastStatus === "failed" ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : null}
              Last run
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {health.hasRun ? (
              <p>
                <span className="font-medium">{health.lastStatus}</span> at{" "}
                {health.lastRunAt
                  ? new Date(health.lastRunAt).toLocaleString()
                  : "—"}{" "}
                ({health.minutesSinceLastRun} min ago)
              </p>
            ) : (
              <p className="text-muted-foreground">No runs yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent runs</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Started</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Trigger</th>
                <th className="px-4 py-2 text-right">Scanned</th>
                <th className="px-4 py-2 text-right">Changed</th>
                <th className="px-4 py-2 text-right">Versions</th>
                <th className="px-4 py-2 text-right">Failed</th>
                <th className="px-4 py-2 text-right">Duration</th>
                <th className="px-4 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const duration =
                  run.finishedAt && run.startedAt
                    ? new Date(run.finishedAt).getTime() -
                      new Date(run.startedAt).getTime()
                    : null;
                return (
                  <tr key={run.id} className="border-b last:border-b-0">
                    <td className="whitespace-nowrap px-4 py-2 text-xs">
                      {new Date(run.startedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        variant="outline"
                        className={
                          run.status === "success"
                            ? "border-green-300 text-green-700"
                            : run.status === "failed"
                            ? "border-red-300 text-red-700"
                            : "border-slate-300 text-slate-600"
                        }
                      >
                        {run.status}
                        {run.dryRun ? " (dry)" : ""}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {run.triggerSource}
                    </td>
                    <td className="px-4 py-2 text-right">{run.scanned}</td>
                    <td className="px-4 py-2 text-right">{run.changed}</td>
                    <td className="px-4 py-2 text-right text-green-600">
                      {run.versionsCreated}
                    </td>
                    <td
                      className={`px-4 py-2 text-right ${
                        run.failed > 0 ? "text-red-600" : ""
                      }`}
                    >
                      {run.failed}
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                      {duration !== null ? `${duration} ms` : "—"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-2 text-xs text-red-700">
                      {run.errorMessage || ""}
                    </td>
                  </tr>
                );
              })}
              {runs.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No runs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
