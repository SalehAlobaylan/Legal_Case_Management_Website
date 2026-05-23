/**
 * Frontend mirror of the backend's canonical error code list.
 * Source of truth: Legal-Case-Management-System/src/errors/codes.ts
 *
 * Kept in sync manually. The CI script `scripts/check-error-codes.mjs`
 * fails the build if these keys diverge from the backend or from the
 * `errors.codes.*` keys in src/lib/i18n/locales/{en,ar}.json.
 */

export const ERROR_CODES = [
  // AUTH
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_TOKEN_MISSING",
  "AUTH_TOKEN_EXPIRED",
  "AUTH_TOKEN_INVALID",
  "AUTH_ACCOUNT_DISABLED",
  "AUTH_EMAIL_NOT_VERIFIED",
  // AUTHZ
  "AUTHZ_FORBIDDEN",
  "AUTHZ_RESOURCE_ACCESS_DENIED",
  "AUTHZ_ROLE_REQUIRED",
  "AUTHZ_CLIENT_ACCOUNT_RESTRICTED",
  // VALIDATION
  "VALIDATION_FAILED",
  "VALIDATION_INVALID_ID",
  "VALIDATION_MISSING_BODY",
  "VALIDATION_BAD_FORMAT",
  // NOT_FOUND
  "NOT_FOUND_RESOURCE",
  "NOT_FOUND_ROUTE",
  // CONFLICT
  "CONFLICT_RESOURCE_EXISTS",
  "CONFLICT_INVALID_STATE",
  "CONFLICT_DEPENDENCY",
  // RATE_LIMIT
  "RATE_LIMIT_EXCEEDED",
  "RATE_LIMIT_QUOTA_EXHAUSTED",
  // DB
  "DB_UNIQUE_VIOLATION",
  "DB_FOREIGN_KEY_VIOLATION",
  "DB_NOT_NULL_VIOLATION",
  "DB_STRING_TOO_LONG",
  "DB_INVALID_TEXT_REPRESENTATION",
  "DB_SCHEMA_OUT_OF_DATE",
  "DB_CONNECTION_FAILED",
  // EXTERNAL
  "EXTERNAL_AI_UNAVAILABLE",
  "EXTERNAL_AI_TIMEOUT",
  "EXTERNAL_AI_BAD_RESPONSE",
  "EXTERNAL_TAVILY_DISABLED",
  "EXTERNAL_TAVILY_FAILED",
  // OAUTH
  "OAUTH_CALLBACK_FAILED",
  "OAUTH_NO_CODE",
  "OAUTH_TOKEN_EXCHANGE_FAILED",
  "OAUTH_PROFILE_FETCH_FAILED",
  // FILE
  "FILE_REQUIRED",
  "FILE_TOO_LARGE",
  "FILE_UNSUPPORTED_TYPE",
  "FILE_STORAGE_FAILED",
  // BILLING
  "BILLING_PLAN_UNAVAILABLE",
  "BILLING_SUBSCRIPTION_NOT_FOUND",
  "BILLING_ALREADY_CANCELLED",
  // INTERNAL
  "INTERNAL_ERROR",
  "INTERNAL_NOT_IMPLEMENTED",
  // AI (mirrored from AI microservice)
  "AI_INPUT_INVALID",
  "AI_MODEL_LOADING",
  "AI_EMBEDDING_FAILED",
  "AI_LLM_FAILED",
  "AI_LLM_TIMEOUT",
  "AI_INTERNAL",
  // Client-side synthetic codes (never sent by backend)
  "NETWORK_ERROR",
  "UNKNOWN",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const ERROR_CODE_SET: ReadonlySet<string> = new Set(ERROR_CODES);

export function isKnownErrorCode(code: string): code is ErrorCode {
  return ERROR_CODE_SET.has(code);
}
