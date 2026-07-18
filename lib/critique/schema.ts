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
    findings: { type: "array", items: findingSchema },
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
