/**
 * Resolve an error into a human-readable, locale-aware message.
 *
 * Resolution order:
 *   1. i18n translation under `errors.codes.<CODE>`
 *   2. The server's English fallback (`ApiError.serverMessage`)
 *      — used when a new backend code hasn't been added to the locale files
 *   3. `errors.unknown`
 *
 * Step 2 is intentional: it prevents a "Something went wrong" cliff when
 * the backend adds a code before the frontend mirrors it.
 */

import { t, type Locale } from "@/lib/i18n";
import { ApiError } from "./ApiError";

/** JS runtime error names whose messages leak internals (never show to users). */
const INTERNAL_ERROR_NAMES = [
  "ReferenceError",
  "TypeError",
  "SyntaxError",
  "RangeError",
  "URIError",
  "EvalError",
];

/** True for raw JS errors whose `.message` should never be shown to users. */
export function isInternalJsError(error: Error): boolean {
  return INTERNAL_ERROR_NAMES.includes(error.name);
}

export function getErrorMessage(error: unknown, locale: Locale): string {
  if (error instanceof ApiError) {
    const key = `errors.codes.${error.code}`;
    const translated = t(locale, key);
    // t() returns the key itself when no translation is found
    if (translated && translated !== key) return translated;

    if (error.code === "NETWORK_ERROR") {
      const net = t(locale, "errors.network");
      if (net !== "errors.network") return net;
    }

    if (error.serverMessage) return error.serverMessage;
  }

  // For non-ApiError errors, only surface the message if it's safe.
  // Raw JS errors (ReferenceError, TypeError, etc.) expose internals
  // like "X is not defined" which are meaningless to users.
  if (error instanceof Error && error.message) {
    if (!isInternalJsError(error)) {
      return error.message;
    }
  }

  const fallback = t(locale, "errors.unknown");
  return fallback === "errors.unknown" ? "Something went wrong" : fallback;
}
