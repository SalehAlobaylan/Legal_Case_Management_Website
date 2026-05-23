/**
 * Typed wrapper for backend errors.
 *
 * Every Axios rejection is normalized into an ApiError by the response
 * interceptor in src/lib/api/client.ts, so downstream callers can branch
 * on `error.code` instead of poking at `error.response.data`.
 *
 * Canonical envelope from the backend:
 *   { error: { code, message, details?, traceId, timestamp } }
 */

import type { AxiosError } from "axios";
import { isKnownErrorCode, type ErrorCode } from "./error-codes";

interface BackendErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    traceId?: string;
    timestamp?: string;
  };
}

export class ApiError extends Error {
  readonly code: ErrorCode | string;
  readonly status: number;
  readonly serverMessage: string;
  readonly details?: unknown;
  readonly traceId?: string;

  constructor(
    code: ErrorCode | string,
    status: number,
    serverMessage: string,
    details?: unknown,
    traceId?: string
  ) {
    super(serverMessage);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.serverMessage = serverMessage;
    this.details = details;
    this.traceId = traceId;
  }

  isCode(code: ErrorCode): boolean {
    return this.code === code;
  }

  /**
   * True when the code is one we recognize (i.e. shipping a stale frontend
   * against a newer backend introduces an unknown code — UI should fall
   * back to the server's English message rather than translating).
   */
  isKnown(): boolean {
    return typeof this.code === "string" && isKnownErrorCode(this.code);
  }

  static fromAxiosError(err: AxiosError): ApiError {
    // Network-level failure (no response received)
    if (!err.response) {
      const isTimeout = err.code === "ECONNABORTED";
      return new ApiError(
        isTimeout ? "EXTERNAL_AI_TIMEOUT" : "NETWORK_ERROR",
        0,
        err.message || "Network unavailable",
      );
    }

    const status = err.response.status;
    const body = err.response.data as BackendErrorEnvelope | undefined;
    const envelope = body?.error;

    if (envelope?.code) {
      return new ApiError(
        envelope.code,
        status,
        envelope.message ?? err.message,
        envelope.details,
        envelope.traceId,
      );
    }

    // Backend hasn't emitted the new envelope (e.g. unmapped 404 from Fastify)
    const FALLBACK_CODE_MAP: Record<number, ErrorCode> = {
      401: "AUTH_TOKEN_INVALID",
      403: "AUTHZ_FORBIDDEN",
      404: "NOT_FOUND_ROUTE",
    };
    const fallbackCode =
      FALLBACK_CODE_MAP[status] ?? (status >= 500 ? "INTERNAL_ERROR" : "UNKNOWN");
    return new ApiError(
      fallbackCode,
      status,
      typeof (body as { error?: string })?.error === "string"
        ? ((body as { error?: string }).error as string)
        : err.message,
    );
  }
}
