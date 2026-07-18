import type { CritiqueStage } from "@/lib/types";

const findingSchema = {
  type: "object",
  properties: {
    level: { type: "string", enum: ["High", "Medium", "Low"] },
    title: { type: "string" },
    quote: {
      type: "string",
      description: "Smallest exact passage containing the problem — a verbatim substring of the submitted text.",
    },
    why: { type: "string" },
    task: { type: "string" },
  },
  required: ["level", "title", "quote", "why", "task"],
  additionalProperties: false,
} as const;

const scoreValue = { type: "integer", enum: [0, 1, 2, 3, 4] } as const;

/** JSON schema for structured critique output; the interview stage adds four 0–4 scores. */
export function critiqueSchema(stage: CritiqueStage) {
  const properties: Record<string, unknown> = {
    findings: { type: "array", maxItems: 7, items: findingSchema },
    note: { type: "string", description: "One-sentence human-readable summary of the evaluation." },
  };
  const required = ["findings", "note"];
  if (stage === "interview") {
    properties.scores = {
      type: "object",
      properties: {
        relevance: scoreValue,
        ownership: scoreValue,
        evidence: scoreValue,
        translation: scoreValue,
      },
      required: ["relevance", "ownership", "evidence", "translation"],
      additionalProperties: false,
    };
    required.push("scores");
  }
  return { type: "object", properties, required, additionalProperties: false };
}

export function validateCritiqueResult(stage: CritiqueStage, submittedText: string, value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const result = value as { findings?: unknown; note?: unknown; scores?: unknown };
  if (!Array.isArray(result.findings) || result.findings.length > 7 || typeof result.note !== "string") return false;
  const valid = result.findings.every((item) => {
    if (!item || typeof item !== "object") return false;
    const finding = item as Record<string, unknown>;
    return ["High", "Medium", "Low"].includes(String(finding.level)) && ["title", "quote", "why", "task"].every((key) => typeof finding[key] === "string") && submittedText.includes(String(finding.quote));
  });
  if (!valid || stage !== "interview") return valid;
  const scores = result.scores as Record<string, unknown> | undefined;
  return !!scores && ["relevance", "ownership", "evidence", "translation"].every((key) => Number.isInteger(scores[key]) && Number(scores[key]) >= 0 && Number(scores[key]) <= 4);
}
