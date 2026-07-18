import fs from "fs";
import path from "path";
import type { CritiqueResponse, CritiqueStage } from "./types";

/**
 * Server-only ICM plumbing: assemble editor system prompts from each stage's
 * references/ (Layer 3) and write critique runs to its output/ (Layer 4).
 * Editing the markdown in stages/ changes editor behavior — no code change.
 */

const STAGE_DIRS: Record<CritiqueStage, string> = {
  resume: "01_resume",
  "cover-letter": "04_cover_letter",
  interview: "06_interview",
};

/** ICM layer order: identity → rules → framework/rubric → examples. */
const REFERENCE_ORDER: Record<CritiqueStage, string[]> = {
  resume: ["identity.md", "rules.md", "review-framework.md", "examples.md"],
  "cover-letter": ["identity.md", "rules.md", "connection-framework.md", "examples.md"],
  interview: ["identity.md", "rules.md", "response-rubric.md", "examples.md"],
};

const OUTPUT_CONTRACT = `# Output contract

Return JSON matching the provided schema. Rules:
- Every "quote" MUST be a verbatim substring of the submitted text, character for character — the
  workspace highlights it by exact match. Quote the smallest exact passage containing the problem.
- At most 7 findings, ordered most consequential first. Zero findings is a valid result; then "note"
  should say the review set is clear.
- "note" is one sentence summarizing the evaluation for the writer.
- Findings critique; they never contain replacement prose.`;

function readStageFile(...segments: string[]): string {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8");
}

export function buildSystemPrompt(stage: CritiqueStage): string {
  const dir = STAGE_DIRS[stage];
  const sections = REFERENCE_ORDER[stage].map((file) => readStageFile("stages", dir, "references", file));
  sections.push(readStageFile("_config", "shared", "product-voice.md"));
  sections.push(OUTPUT_CONTRACT);
  return sections.join("\n\n---\n\n");
}

/** Best-effort, dev-only: persist a critique run as a human-editable ICM artifact. */
export function writeRunOutput(stage: CritiqueStage, model: string, inputText: string, result: CritiqueResponse): void {
  if (process.env.NODE_ENV === "production") return;
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const file = path.join(process.cwd(), "stages", STAGE_DIRS[stage], "output", `${stamp}-critique.json`);
    const payload = {
      requested_at: new Date().toISOString(),
      model,
      input_excerpt: inputText.slice(0, 400),
      findings: result.findings,
      ...(result.scores ? { scores: result.scores } : {}),
      note: result.note,
    };
    fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n", "utf8");
  } catch {
    // The response never depends on this write.
  }
}
