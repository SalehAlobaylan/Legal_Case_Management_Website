"use client";

/*
 * Last-resort error boundary.
 *
 * Next.js renders this when the root layout itself throws. The i18n provider
 * is NOT mounted here, so we hardcode minimal en/ar strings and read direction
 * from `document.documentElement.dir` to preserve RTL.
 *
 * Must include <html><body> because this replaces the entire document.
 */

import { useEffect } from "react";

const STRINGS = {
  en: {
    title: "Something went wrong",
    description:
      "An unexpected error occurred. Please try refreshing the page.",
    retry: "Try again",
  },
  ar: {
    title: "حدث خطأ ما",
    description: "حدث خطأ غير متوقع. يرجى تحديث الصفحة.",
    retry: "حاول مرة أخرى",
  },
} as const;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  const dir =
    typeof document !== "undefined" ? document.documentElement.dir : "ltr";
  const lang = dir === "rtl" ? "ar" : "en";
  const s = STRINGS[lang];

  return (
    <html lang={lang} dir={dir}>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            maxWidth: "32rem",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
            {s.title}
          </h1>
          <p
            style={{
              color: "#666",
              marginBottom: "1.5rem",
              fontSize: "0.95rem",
            }}
          >
            {s.description}
          </p>
          <button
            onClick={reset}
            style={{
              background: "#0f172a",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            {s.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
