/*
 * File: src/components/features/chat/starter/prompt-composer.ts
 * Purpose: Pure functions that turn a StarterSelection into the final prompt string.
 *
 * Kept framework-free so it can be unit tested without React.
 */

export type StarterMode = "analyze" | "regulations" | "draft" | "explain";

export interface StarterSelection {
  mode: StarterMode;

  // Case context (Analyze required; Regulations/Draft optional)
  caseId?: number;
  caseTitle?: string;
  caseNumber?: string;

  // Analyze
  focus?: string[]; // option ids: parties | summary | weaknesses | legalPoints | recommendations
  note?: string;

  // Regulations
  topic?: string; // option id: labor | commercial | ...
  scope?: "general" | "caseRelated";
  keyword?: string;

  // Draft
  docType?: string; // option id: reply | objection | ...
  keyPoints?: string;

  // Explain
  term?: string;
  depth?: "simple" | "detailed" | "examples";
}

type TranslateFn = (
  key: string,
  variables?: Record<string, string | number>
) => string;

/**
 * Compose the final prompt string that will be sent to the chat API.
 * Returns a non-empty, trimmed string ready for the user-facing transcript.
 */
export function composeStarterPrompt(
  sel: StarterSelection,
  t: TranslateFn
): string {
  switch (sel.mode) {
    case "analyze":
      return composeAnalyze(sel, t);
    case "regulations":
      return composeRegulations(sel, t);
    case "draft":
      return composeDraft(sel, t);
    case "explain":
      return composeExplain(sel, t);
  }
}

/**
 * Whether the current selection is complete enough to submit.
 * Used by the Generate button.
 */
export function isStarterComplete(sel: StarterSelection): boolean {
  switch (sel.mode) {
    case "analyze":
      return !!sel.caseId && !!sel.focus && sel.focus.length > 0;
    case "regulations":
      if (!sel.topic) return false;
      if (sel.scope === "caseRelated" && !sel.caseId) return false;
      return true;
    case "draft":
      return !!sel.docType && !!sel.keyPoints && sel.keyPoints.trim().length > 0;
    case "explain":
      return !!sel.term && sel.term.trim().length > 0 && !!sel.depth;
  }
}

/* ---------- internal composers ---------- */

function composeAnalyze(sel: StarterSelection, t: TranslateFn): string {
  const focusLabels = (sel.focus || []).map((id) =>
    t(`chat.starter.analyze.focus.${id}`)
  );
  const sep = t("chat.starter.template.listSeparator");
  const base = t("chat.starter.template.analyze", {
    title: sel.caseTitle || "",
    caseNumber: sel.caseNumber || "",
    focus: focusLabels.join(sep),
  });
  const note = sel.note && sel.note.trim()
    ? t("chat.starter.template.analyzeNote", { note: sel.note.trim() })
    : "";
  return `${base}${note}`.trim();
}

function composeRegulations(sel: StarterSelection, t: TranslateFn): string {
  const topicLabel = t(`chat.starter.regulations.topic.${sel.topic}`);
  const keywordPart =
    sel.keyword && sel.keyword.trim()
      ? t("chat.starter.template.regulationsKeyword", {
          keyword: sel.keyword.trim(),
        })
      : "";
  const casePart =
    sel.scope === "caseRelated" && sel.caseId
      ? t("chat.starter.template.regulationsCase", {
          title: sel.caseTitle || "",
          caseNumber: sel.caseNumber || "",
        })
      : "";
  return t("chat.starter.template.regulations", {
    topic: topicLabel,
    keywordPart,
    casePart,
  }).trim();
}

function composeDraft(sel: StarterSelection, t: TranslateFn): string {
  const docTypeLabel = t(`chat.starter.draft.types.${sel.docType}`);
  const casePart = sel.caseId
    ? t("chat.starter.template.draftCase", {
        title: sel.caseTitle || "",
        caseNumber: sel.caseNumber || "",
      })
    : "";
  return t("chat.starter.template.draft", {
    docType: docTypeLabel,
    casePart,
    keyPoints: (sel.keyPoints || "").trim(),
  }).trim();
}

function composeExplain(sel: StarterSelection, t: TranslateFn): string {
  const depthLabel = t(`chat.starter.explain.depth.${sel.depth}`);
  return t("chat.starter.template.explain", {
    term: (sel.term || "").trim(),
    depth: depthLabel,
  }).trim();
}
