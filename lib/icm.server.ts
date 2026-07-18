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
  resume: ["identity.md", "rules.md", "reference/review-framework.md", "examples.md"],
  "cover-letter": ["identity.md", "rules.md", "reference/connection-framework.md", "examples.md"],
  interview: ["identity.md", "rules.md", "reference/response-rubric.md", "examples.md"],
};

function readStageFile(...segments: string[]): string {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8");
}

export function buildSystemPrompt(stage: CritiqueStage): string {
  const dir = STAGE_DIRS[stage];
  const sections = [readStageFile("stages", dir, "CONTEXT.md"), ...REFERENCE_ORDER[stage].map((file) =>
    readStageFile("stages", dir, "references", ...file.split("/"))),
  ];
  sections.push(readStageFile("_config", "shared", "product-voice.md"));
  sections.push(readStageFile("_config", "shared", "finding-format.md"));
  return sections.join("\n\n---\n\n");
}

/** Best-effort, dev-only: persist a critique run as a human-editable ICM artifact. */
export function writeRunOutput(stage: CritiqueStage, model: string, inputText: string, result: CritiqueResponse): void {
  if (process.env.NODE_ENV === "production") return;
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const file = path.join(process.cwd(), "stages", STAGE_DIRS[stage], "output", "runtime", `${stamp}-critique.json`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
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
