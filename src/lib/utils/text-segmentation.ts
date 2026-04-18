/*
 * File: src/lib/utils/text-segmentation.ts
 * Purpose: Rule-based segmentation of long legal text (Saudi court filings
 *          and MOJ regulations) into readable sections with headings for
 *          TOC anchoring. Deterministic, runs client-side, no AI.
 *
 * Two kinds are supported:
 *   - "case-filing":  court pleadings. Structural markers are narrative
 *                     headings like الوقائع / الأسباب / الحكم.
 *   - "regulation":   legislative text. Structural markers are hierarchical
 *                     (الباب / الفصل / المادة) and produce stable slugs
 *                     (chapter-N, section-N, article-N) so articles can be
 *                     deep-linked from URLs.
 *
 * Both kinds share the same ordinal "item" markers (أولاً، ثانياً …) which
 * produce inline sub-headings inside the body but are excluded from the TOC.
 */

export type LegalSegmentLevel = "section" | "item";
export type LegalTextKind = "case-filing" | "regulation";

export interface LegalSegment {
  id: string;
  heading?: string;
  body: string;
  /** Character offset in the original source text where this segment begins. */
  offset: number;
  /**
   * "section" = top-level structural heading (الوقائع/الأسباب/الحكم for
   * filings, الباب/الفصل/المادة for regulations), shown in the TOC.
   * "item" = enumerative sub-heading (أولاً، ثانياً…), rendered inline in
   * the body only and excluded from the TOC.
   */
  level: LegalSegmentLevel;
}

/* =============================================================================
   Case-filing structural markers
   ============================================================================= */

const ARABIC_STRUCTURAL_MARKERS = [
  "الوقائع",
  "المرافعة",
  "الأسباب",
  "الحكم",
  "الطلبات",
  "الموضوع",
  "المنطوق",
  "تمهيد",
  "التكييف",
  "من الناحية الشكلية",
  "من الناحية الموضوعية",
];

const ARABIC_ITEM_MARKERS = [
  "أولاً",
  "ثانياً",
  "ثالثاً",
  "رابعاً",
  "خامساً",
  "سادساً",
  "سابعاً",
  "ثامناً",
  "تاسعاً",
  "عاشراً",
  "أولًا",
  "ثانيًا",
  "ثالثًا",
  "رابعًا",
  "خامسًا",
  "سادسًا",
  "سابعًا",
  "ثامنًا",
  "تاسعًا",
  "عاشرًا",
];

const ENGLISH_STRUCTURAL_MARKERS = [
  "Facts",
  "Background",
  "Arguments",
  "Reasoning",
  "Ruling",
  "Judgment",
  "Claims",
  "Relief",
  "Procedural History",
  "Conclusion",
];

const ENGLISH_ITEM_MARKERS = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
];

/* =============================================================================
   Regulation markers — Arabic ordinals + regex patterns for الباب / الفصل / المادة
   ============================================================================= */

/**
 * Arabic ordinal words (feminine + masculine variants) → numeric value.
 * Covers simple ordinals 1–19 plus all round tens (20, 30, … 90) and
 * 100/1000. Compound ordinals like "السادسة والثلاثون" (36) or
 * "الحادية والعشرون" (21) are handled separately by combining a units
 * word with a tens word via a `و` conjunction — see `AR_COMPOUND_*`
 * below and `parseArabicOrdinal()`.
 */
const ARABIC_ORDINAL_NUM: Record<string, number> = {
  "الأولى": 1, "الأول": 1,
  "الثانية": 2, "الثاني": 2,
  "الثالثة": 3, "الثالث": 3,
  "الرابعة": 4, "الرابع": 4,
  "الخامسة": 5, "الخامس": 5,
  "السادسة": 6, "السادس": 6,
  "السابعة": 7, "السابع": 7,
  "الثامنة": 8, "الثامن": 8,
  "التاسعة": 9, "التاسع": 9,
  "العاشرة": 10, "العاشر": 10,
  "الحادية عشرة": 11, "الحادي عشر": 11,
  "الثانية عشرة": 12, "الثاني عشر": 12,
  "الثالثة عشرة": 13, "الثالث عشر": 13,
  "الرابعة عشرة": 14, "الرابع عشر": 14,
  "الخامسة عشرة": 15, "الخامس عشر": 15,
  "السادسة عشرة": 16, "السادس عشر": 16,
  "السابعة عشرة": 17, "السابع عشر": 17,
  "الثامنة عشرة": 18, "الثامن عشر": 18,
  "التاسعة عشرة": 19, "التاسع عشر": 19,
  "العشرون": 20, "العشرين": 20,
  "الثلاثون": 30, "الثلاثين": 30,
  "الأربعون": 40, "الأربعين": 40,
  "الخمسون": 50, "الخمسين": 50,
  "الستون": 60, "الستين": 60,
  "السبعون": 70, "السبعين": 70,
  "الثمانون": 80, "الثمانين": 80,
  "التسعون": 90, "التسعين": 90,
  "المئة": 100, "المائة": 100,
  "الألف": 1000,
};

// Unit words used in compound ordinals (e.g., "السادسة والثلاثون" → 6 + 30).
const ARABIC_COMPOUND_UNITS: Record<string, number> = {
  "الحادية": 1, "الحادي": 1,
  "الثانية": 2, "الثاني": 2,
  "الثالثة": 3, "الثالث": 3,
  "الرابعة": 4, "الرابع": 4,
  "الخامسة": 5, "الخامس": 5,
  "السادسة": 6, "السادس": 6,
  "السابعة": 7, "السابع": 7,
  "الثامنة": 8, "الثامن": 8,
  "التاسعة": 9, "التاسع": 9,
};

// Tens words (with conjunction prefix "و" as they appear in compounds).
const ARABIC_COMPOUND_TENS: Record<string, number> = {
  "العشرون": 20, "العشرين": 20,
  "الثلاثون": 30, "الثلاثين": 30,
  "الأربعون": 40, "الأربعين": 40,
  "الخمسون": 50, "الخمسين": 50,
  "الستون": 60, "الستين": 60,
  "السبعون": 70, "السبعين": 70,
  "الثمانون": 80, "الثمانين": 80,
  "التسعون": 90, "التسعين": 90,
};

const AR_COMPOUND_UNITS_ALT = Object.keys(ARABIC_COMPOUND_UNITS)
  .sort((a, b) => b.length - a.length)
  .map(escapeRegex)
  .join("|");
const AR_COMPOUND_TENS_ALT = Object.keys(ARABIC_COMPOUND_TENS)
  .sort((a, b) => b.length - a.length)
  .map(escapeRegex)
  .join("|");

// Matches any Arabic ordinal token we understand: a compound form
// ("<unit> و<tens>") OR a simple single-word/two-word form from
// ARABIC_ORDINAL_NUM. Compound is tried first so "السادسة والثلاثون"
// doesn't get truncated to "السادسة".
// Longest-first sorting protects multi-word entries like "الحادية عشرة".
const AR_SIMPLE_ORDINALS_ALT = Object.keys(ARABIC_ORDINAL_NUM)
  .sort((a, b) => b.length - a.length)
  .map(escapeRegex)
  .join("|");

const AR_ORDINALS_ALT = `(?:${AR_COMPOUND_UNITS_ALT})\\s+و(?:${AR_COMPOUND_TENS_ALT})|${AR_SIMPLE_ORDINALS_ALT}`;

/**
 * Hundreds-suffix words that appear after an ordinal to form numbers
 * above 100 in Saudi regulation drafting style — e.g. "المادة العشرون
 * بعد السبعمائة" (720) or "المادة الثامنة والتسعون بعد المئة" (198).
 * Without this, the regex only captures the leading ordinal and the
 * "بعد <hundreds>" tail leaks into the body text, rendering in a
 * smaller body font on a new line.
 */
const ARABIC_HUNDREDS_NUM: Record<string, number> = {
  "المئة": 100, "المائة": 100,
  "المئتين": 200, "المئتان": 200, "المائتين": 200, "المائتان": 200,
  "الثلاثمئة": 300, "الثلاثمائة": 300,
  "الأربعمئة": 400, "الأربعمائة": 400,
  "الخمسمئة": 500, "الخمسمائة": 500,
  "الستمئة": 600, "الستمائة": 600,
  "السبعمئة": 700, "السبعمائة": 700,
  "الثمانمئة": 800, "الثمانمائة": 800, "الثمانيمئة": 800,
  "التسعمئة": 900, "التسعمائة": 900,
};
const AR_HUNDREDS_ALT = Object.keys(ARABIC_HUNDREDS_NUM)
  .sort((a, b) => b.length - a.length)
  .map(escapeRegex)
  .join("|");
// Optional trailing "بعد <hundreds>" — non-capturing so the existing
// ordinal capture group index doesn't shift.
const AR_HUNDREDS_SUFFIX = `(?:\\s+بعد\\s+(?:${AR_HUNDREDS_ALT}))?`;

/**
 * Resolve any Arabic ordinal phrase we accept to its numeric value.
 * Returns null for unknown phrases (caller falls back to positional slug).
 */
function parseArabicOrdinal(phrase: string): number | null {
  let trimmed = phrase.trim().replace(/\s+/g, " ");
  // Optional "... بعد <hundreds>" tail — strip it and add to the base value.
  let hundreds = 0;
  const hundredsMatch = trimmed.match(
    new RegExp(`^(.+?)\\s+بعد\\s+(${AR_HUNDREDS_ALT})$`)
  );
  if (hundredsMatch) {
    trimmed = hundredsMatch[1].trim();
    hundreds = ARABIC_HUNDREDS_NUM[hundredsMatch[2]] ?? 0;
  }
  // Compound: "<unit> و<tens>"
  const compoundMatch = trimmed.match(
    new RegExp(`^(${AR_COMPOUND_UNITS_ALT})\\s+و(${AR_COMPOUND_TENS_ALT})$`)
  );
  if (compoundMatch) {
    const u = ARABIC_COMPOUND_UNITS[compoundMatch[1]];
    const t = ARABIC_COMPOUND_TENS[compoundMatch[2]];
    if (u != null && t != null) return t + u + hundreds;
  }
  const base = ARABIC_ORDINAL_NUM[trimmed];
  if (base != null) return base + hundreds;
  // If we consumed a hundreds suffix but the head is unrecognized, still
  // return the hundreds part rather than null so the slug is deterministic.
  return hundreds > 0 ? hundreds : null;
}

// Converts Arabic-Indic digits (٠-٩) or Western digits to an integer.
function arabicDigitsToInt(s: string): number | null {
  const normalized = s.replace(/[\u0660-\u0669]/g, (d) =>
    String(d.charCodeAt(0) - 0x0660)
  );
  const n = parseInt(normalized, 10);
  return Number.isFinite(n) ? n : null;
}

// Regulation regexes — applied to a slice starting at an eligible position
// (start of text or after whitespace at a line boundary). All use the ^ anchor.
const RE_AR_CHAPTER = new RegExp(
  `^الباب\\s+((?:${AR_ORDINALS_ALT})${AR_HUNDREDS_SUFFIX})(?:\\s*[:：\\-ـ]\\s*([^\\n]+?))?\\s*(?=\\n|$)`
);
const RE_AR_SECTION = new RegExp(
  `^الفصل\\s+((?:${AR_ORDINALS_ALT})${AR_HUNDREDS_SUFFIX})(?:\\s*[:：\\-ـ]\\s*([^\\n]+?))?\\s*(?=\\n|$)`
);
// Article: "المادة <paren-number>" | "المادة <number>" | "المادة <ordinal>",
// optionally followed by a colon-style separator. The body starts immediately
// after the heading + separator. Ordinals may carry a "بعد <hundreds>" tail
// (e.g. "العشرون بعد السبعمائة" = 720) which is captured in the same group
// so it renders inline as part of the heading instead of leaking into the body.
const RE_AR_ARTICLE = new RegExp(
  `^المادة\\s+(?:\\(([\\u0660-\\u06690-9]+)\\)|([\\u0660-\\u06690-9]+)|((?:${AR_ORDINALS_ALT})${AR_HUNDREDS_SUFFIX}))\\s*[:：\\-ـ]?\\s*`
);

/* =============================================================================
   Helpers
   ============================================================================= */

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strip decorative divider lines (≥10 chars of `=`, `-`, `_`, `*`, `~` on
 * their own line) — MOJ extractors emit these as visual separators that
 * pollute the rendered output.
 *
 * Exported for use by `findSegmentById` so offsets line up with what the
 * reader renders (the reader consumes segments from the cleaned text).
 */
export function stripDecorativeDividers(raw: string): string {
  return raw.replace(/^[ \t]*[=\-_*~]{10,}[ \t]*$/gm, "");
}

/**
 * Aggressive divider cleanup for AI-generated content. MOJ-sourced text
 * contains `====` / `----` sequences that the LLM sometimes echoes back
 * *inline* (collapsed onto one line with surrounding text), where the
 * line-anchored `stripDecorativeDividers` can't reach them.
 *
 * Strips runs of ≥4 of those chars anywhere in the string and collapses
 * the whitespace left behind. Use this for summaries, titles, snippets,
 * etc. — do NOT use for text passed to the reader (it breaks segment
 * offsets).
 */
export function stripInlineDecorations(raw: string): string {
  if (!raw) return "";
  return raw
    // Line-level dividers first (covers the non-inline case too).
    .replace(/^[ \t]*[=\-_*~]{4,}[ \t]*$/gm, "")
    // Inline runs of divider chars — require ≥4 so we don't eat things
    // like an em-dash pair or "----" in URLs/code (unlikely in legal text
    // but cheap insurance).
    .replace(/[=\-_*~]{4,}/g, " ")
    // Collapse the whitespace/newlines the strip leaves behind.
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugifyGeneric(input: string, fallbackIndex: number): string {
  const base = input
    .trim()
    .replace(/[:\u060C\u061B.]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return base ? `sec-${fallbackIndex}-${base}` : `sec-${fallbackIndex}`;
}

/* =============================================================================
   Marker detection — case-filing kind (string enumeration)
   ============================================================================= */

interface DetectedMarker {
  heading: string;
  headingLen: number;
  level: LegalSegmentLevel;
  /** Optional stable slug override (regulation markers only). */
  slug?: string;
}

function detectCaseFilingMarker(
  slice: string,
  locale: "ar" | "en"
): DetectedMarker | null {
  const structural =
    locale === "ar" ? ARABIC_STRUCTURAL_MARKERS : ENGLISH_STRUCTURAL_MARKERS;
  const items = locale === "ar" ? ARABIC_ITEM_MARKERS : ENGLISH_ITEM_MARKERS;

  for (const marker of structural) {
    const re = new RegExp(`^${escapeRegex(marker)}\\s*[:：\\-ـ]`, "i");
    if (re.test(slice)) {
      const head = slice.match(
        new RegExp(`^${escapeRegex(marker)}\\s*[:：\\-ـ]\\s*`, "i")
      );
      return {
        heading: marker,
        headingLen: head ? head[0].length : marker.length,
        level: "section",
      };
    }
  }
  for (const marker of items) {
    const re = new RegExp(`^${escapeRegex(marker)}\\s*[:：\\-ـ]`, "i");
    if (re.test(slice)) {
      const head = slice.match(
        new RegExp(`^${escapeRegex(marker)}\\s*[:：\\-ـ]\\s*`, "i")
      );
      return {
        heading: marker,
        headingLen: head ? head[0].length : marker.length,
        level: "item",
      };
    }
  }
  return null;
}

/* =============================================================================
   Marker detection — regulation kind (regex-based)
   ============================================================================= */

function detectRegulationMarker(slice: string): DetectedMarker | null {
  // Chapter (الباب الأول)
  const chapterMatch = slice.match(RE_AR_CHAPTER);
  if (chapterMatch) {
    const ordinal = chapterMatch[1];
    const title = chapterMatch[2]?.trim();
    const num = parseArabicOrdinal(ordinal);
    const heading = title ? `الباب ${ordinal} — ${title}` : `الباب ${ordinal}`;
    return {
      heading,
      headingLen: chapterMatch[0].length,
      level: "section",
      slug: num != null ? `chapter-${num}` : undefined,
    };
  }

  // Section (الفصل الأول)
  const sectionMatch = slice.match(RE_AR_SECTION);
  if (sectionMatch) {
    const ordinal = sectionMatch[1];
    const title = sectionMatch[2]?.trim();
    const num = parseArabicOrdinal(ordinal);
    const heading = title ? `الفصل ${ordinal} — ${title}` : `الفصل ${ordinal}`;
    return {
      heading,
      headingLen: sectionMatch[0].length,
      level: "section",
      slug: num != null ? `section-${num}` : undefined,
    };
  }

  // Article (المادة X)
  const articleMatch = slice.match(RE_AR_ARTICLE);
  if (articleMatch) {
    const parenNum = articleMatch[1]; // digits inside ()
    const plainNum = articleMatch[2]; // bare digits
    const ordinal = articleMatch[3]; // ordinal word
    let num: number | null = null;
    let label = "";
    if (parenNum) {
      num = arabicDigitsToInt(parenNum);
      label = `(${parenNum})`;
    } else if (plainNum) {
      num = arabicDigitsToInt(plainNum);
      label = plainNum;
    } else if (ordinal) {
      num = parseArabicOrdinal(ordinal);
      label = ordinal;
    }
    return {
      heading: `المادة ${label}`,
      headingLen: articleMatch[0].length,
      level: "section",
      slug: num != null ? `article-${num}` : undefined,
    };
  }

  // Ordinal items (أولاً، ثانياً…) — shared with case filings.
  for (const marker of ARABIC_ITEM_MARKERS) {
    const re = new RegExp(`^${escapeRegex(marker)}\\s*[:：\\-ـ]`);
    if (re.test(slice)) {
      const head = slice.match(
        new RegExp(`^${escapeRegex(marker)}\\s*[:：\\-ـ]\\s*`)
      );
      return {
        heading: marker,
        headingLen: head ? head[0].length : marker.length,
        level: "item",
      };
    }
  }

  return null;
}

/* =============================================================================
   Main entry: splitLegalText
   ============================================================================= */

/**
 * Split long legal text into readable segments.
 *
 * Strategy:
 *   1. Preprocess: strip decorative divider lines (===== / ----- / ___).
 *   2. Scan for structural markers at eligible positions (start of text or
 *      after a line/sentence boundary). Each match starts a new segment.
 *   3. If no markers found, fall back to sentence-based chunking so we
 *      never return a single wall of text.
 *
 * Segment offsets refer to the *cleaned* (divider-stripped) text, so they
 * line up with what the reader renders.
 */
export function splitLegalText(
  text: string,
  locale: "ar" | "en" = "ar",
  kind: LegalTextKind = "case-filing"
): LegalSegment[] {
  const cleaned = stripDecorativeDividers(text || "").trim();
  if (!cleaned) return [];

  const source = cleaned;

  type Match = {
    offset: number;
    heading: string;
    headingLen: number;
    level: LegalSegmentLevel;
    slug?: string;
  };
  const matches: Match[] = [];

  for (let i = 0; i < source.length; i++) {
    // Position eligibility guard:
    // - At index 0 we always check.
    // - Otherwise the previous char must be whitespace/newline/tab, AND
    //   either the previous non-whitespace char is terminal punctuation,
    //   or (regulation kind only) the previous char is a newline (legal
    //   articles commonly start on their own line without a preceding .).
    if (i > 0) {
      const prev = source[i - 1];
      if (prev !== " " && prev !== "\n" && prev !== "\t") continue;

      const relaxNewline = kind === "regulation" && prev === "\n";
      if (!relaxNewline) {
        const back = source.slice(Math.max(0, i - 4), i).trim();
        const lastChar = back.slice(-1);
        const terminal = /[.!؟?\)\]\u06D4]/.test(lastChar);
        if (!terminal && back.length > 0) continue;
      }
    }

    const slice = source.slice(i);
    const hit =
      kind === "regulation"
        ? detectRegulationMarker(slice)
        : detectCaseFilingMarker(slice, locale);

    if (hit) {
      matches.push({
        offset: i,
        heading: hit.heading,
        headingLen: hit.headingLen,
        level: hit.level,
        slug: hit.slug,
      });
      // Skip past the heading to avoid re-matching inside it.
      i += hit.headingLen - 1;
    }
  }

  if (matches.length > 0) {
    const segments: LegalSegment[] = [];

    if (matches[0].offset > 20) {
      const intro = source.slice(0, matches[0].offset).trim();
      if (intro) {
        segments.push({
          id: "sec-0-intro",
          body: intro,
          offset: 0,
          level: "section",
        });
      }
    }

    // Track duplicate slugs within the document — in the rare case a
    // regulation repeats an ordinal across chapters, fall back to a
    // positional slug so anchors stay unique.
    const usedIds = new Set<string>();

    matches.forEach((m, idx) => {
      const end =
        idx + 1 < matches.length ? matches[idx + 1].offset : source.length;
      const body = source.slice(m.offset + m.headingLen, end).trim();

      let id = m.slug ?? slugifyGeneric(m.heading, idx + 1);
      if (usedIds.has(id)) id = `${id}-${idx + 1}`;
      usedIds.add(id);

      segments.push({
        id,
        heading: m.heading,
        body,
        offset: m.offset,
        level: m.level,
      });
    });

    return segments;
  }

  // Fallback: no markers — chunk by sentence boundaries into ~600-char pieces.
  const sentenceBoundary = /(?<=[.؟!?])\s+/g;
  const sentences = source.split(sentenceBoundary);
  const chunks: string[] = [];
  let buffer = "";
  for (const s of sentences) {
    if ((buffer + " " + s).length > 600 && buffer) {
      chunks.push(buffer.trim());
      buffer = s;
    } else {
      buffer = buffer ? `${buffer} ${s}` : s;
    }
  }
  if (buffer.trim()) chunks.push(buffer.trim());

  if (chunks.length <= 1) {
    return [{ id: "sec-0", body: source, offset: 0, level: "section" }];
  }

  let runningOffset = 0;
  return chunks.map((body, idx) => {
    const offset = source.indexOf(body, runningOffset);
    runningOffset = offset >= 0 ? offset + body.length : runningOffset;
    return {
      id: `sec-${idx}`,
      body,
      offset: offset >= 0 ? offset : runningOffset,
      level: "section" as LegalSegmentLevel,
    };
  });
}

/**
 * Look up a segment by its id (e.g., "article-5") without making callers
 * re-implement segmentation logic. Used by the regulation detail page to
 * resolve URL hashes like `#article-5` into a HighlightRange.
 */
export function findSegmentById(
  text: string,
  id: string,
  options?: { locale?: "ar" | "en"; kind?: LegalTextKind }
): LegalSegment | null {
  if (!text || !id) return null;
  const segments = splitLegalText(
    text,
    options?.locale ?? "ar",
    options?.kind ?? "case-filing"
  );
  return segments.find((s) => s.id === id) ?? null;
}

/**
 * Estimate reading time in minutes given total chars.
 * Assumes ~900 Arabic chars/min or ~1200 Latin chars/min of casual reading.
 */
export function estimateReadingTime(
  text: string,
  locale: "ar" | "en" = "ar"
): number {
  const chars = text?.length || 0;
  const rate = locale === "ar" ? 900 : 1200;
  return Math.max(1, Math.round(chars / rate));
}
