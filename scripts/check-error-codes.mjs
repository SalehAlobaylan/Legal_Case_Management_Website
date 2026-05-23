#!/usr/bin/env node
/**
 * Drift check for the unified error code contract.
 *
 * Fails (exit 1) if any error code is missing or extra across:
 *   - Backend canonical:        ../Legal-Case-Management-System/src/errors/codes.ts
 *   - Frontend mirror:          src/lib/api/error-codes.ts
 *   - Frontend i18n (en/ar):    src/lib/i18n/locales/{en,ar}.json   (errors.codes.*)
 *
 * Run via `npm run check:error-codes` (or wired into `lint`).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FRONTEND_ROOT = resolve(__dirname, "..");
const BACKEND_CODES = resolve(
  FRONTEND_ROOT,
  "../Legal-Case-Management-System/src/errors/codes.ts"
);
const FRONTEND_MIRROR = resolve(FRONTEND_ROOT, "src/lib/api/error-codes.ts");
const EN_JSON = resolve(FRONTEND_ROOT, "src/lib/i18n/locales/en.json");
const AR_JSON = resolve(FRONTEND_ROOT, "src/lib/i18n/locales/ar.json");

// Codes that exist only on the frontend (synthetic / client-side)
const FRONTEND_ONLY = new Set(["NETWORK_ERROR", "UNKNOWN"]);

function bail(msg) {
  console.error(`[check-error-codes] ${msg}`);
  process.exit(1);
}

function readBackendCodes() {
  if (!existsSync(BACKEND_CODES)) {
    bail(`Backend codes file not found: ${BACKEND_CODES}`);
  }
  const src = readFileSync(BACKEND_CODES, "utf8");
  // Match `  CODE_NAME: {` at object-literal indent level
  const re = /^\s{2}([A-Z][A-Z0-9_]+):\s*\{/gm;
  const codes = new Set();
  let m;
  while ((m = re.exec(src))) codes.add(m[1]);
  if (codes.size === 0) bail("Backend codes file appears empty");
  return codes;
}

function readFrontendMirror() {
  const src = readFileSync(FRONTEND_MIRROR, "utf8");
  const re = /"([A-Z][A-Z0-9_]+)"/g;
  const codes = new Set();
  let m;
  while ((m = re.exec(src))) codes.add(m[1]);
  return codes;
}

function readI18nCodes(path) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  const codes = data?.errors?.codes;
  if (!codes || typeof codes !== "object") {
    bail(`${path} missing errors.codes namespace`);
  }
  return new Set(Object.keys(codes));
}

function diff(label, expected, actual) {
  const missing = [...expected].filter((c) => !actual.has(c));
  const extra = [...actual].filter(
    (c) => !expected.has(c) && !FRONTEND_ONLY.has(c)
  );
  if (missing.length || extra.length) {
    console.error(`\n[${label}]`);
    if (missing.length) console.error(`  missing: ${missing.join(", ")}`);
    if (extra.length) console.error(`  extra:   ${extra.join(", ")}`);
    return false;
  }
  return true;
}

const backend = readBackendCodes();
const mirror = readFrontendMirror();
const en = readI18nCodes(EN_JSON);
const ar = readI18nCodes(AR_JSON);

let ok = true;
ok = diff("frontend mirror vs backend", backend, mirror) && ok;
ok = diff("en.json vs backend", backend, en) && ok;
ok = diff("ar.json vs backend", backend, ar) && ok;
ok = diff("ar.json vs en.json", en, ar) && ok;

if (!ok) {
  console.error(
    "\nError code drift detected. Sync src/lib/api/error-codes.ts and locale files with the backend's src/errors/codes.ts."
  );
  process.exit(1);
}

console.log(
  `[check-error-codes] OK — ${backend.size} backend codes, ${mirror.size - FRONTEND_ONLY.size} mirrored, en/ar parity confirmed.`
);
