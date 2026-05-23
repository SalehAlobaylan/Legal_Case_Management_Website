"use client";

/*
 * Segment-level error boundary.
 *
 * Next.js renders this when a server/client component below the root layout
 * throws during render. The layout (and our i18n provider) is still mounted,
 * so it's safe to use the locale store and Tailwind classes here.
 *
 * UX rules:
 *  - Never show raw JS errors (ReferenceError, TypeError, etc.) to users —
 *    they leak internals and are meaningless to non-developers.
 *  - ApiError messages are safe (they come from our canonical envelope).
 *  - Stack traces are dev-only AND behind a toggle (collapsed by default).
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/ApiError";
import { getErrorMessage, isInternalJsError } from "@/lib/api/get-error-message";
import { useUIStore } from "@/lib/store/ui-store";
import { t } from "@/lib/i18n";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useUIStore((s) => s.locale);
  const [showStack, setShowStack] = useState(false);
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    // Always log the full error for debugging (dev console / Sentry).
    console.error("[error-boundary]", error, error.digest ? `digest=${error.digest}` : "");
  }, [error]);

  const title =
    t(locale, "errors.boundary.title") === "errors.boundary.title"
      ? "Something went wrong"
      : t(locale, "errors.boundary.title");

  const retry =
    t(locale, "errors.boundary.retry") === "errors.boundary.retry"
      ? "Try again"
      : t(locale, "errors.boundary.retry");

  // For ApiErrors, show the translated message (safe, user-facing).
  // For raw JS errors (ReferenceError, TypeError, etc.), show a generic message
  // — never expose "X is not defined" or similar internals to end-users.
  const message =
    error instanceof ApiError
      ? getErrorMessage(error, locale)
      : isInternalJsError(error)
        ? (t(locale, "errors.unknown") === "errors.unknown"
            ? "Something went wrong. Please try again."
            : t(locale, "errors.unknown"))
        : getErrorMessage(error, locale);

  const traceId = error instanceof ApiError ? error.traceId : undefined;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      {traceId ? (
        <p className="text-xs text-muted-foreground/70 font-mono">
          trace: {traceId}
        </p>
      ) : null}
      <Button onClick={reset}>{retry}</Button>
      {isDev && error.stack ? (
        <div className="mt-4 max-w-2xl w-full">
          <button
            type="button"
            onClick={() => setShowStack((v) => !v)}
            className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
          >
            {showStack ? "Hide" : "Show"} stack trace
          </button>
          {showStack ? (
            <pre className="text-[10px] text-left text-muted-foreground/60 overflow-auto mt-2 p-2 bg-muted rounded">
              {error.stack}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
