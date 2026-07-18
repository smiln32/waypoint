import fs from "fs";
import path from "path";

export interface CoverLetterTemplate {
  name: string;
  description: string;
  body: string;
  /** A finished sample letter to mirror. */
  example?: string;
}

/**
 * Server-only: load the letter templates from the ICM stage references.
 * Editing stages/04_cover_letter/references/templates.md changes the
 * templates offered in the app — no code change required.
 */
export function loadCoverLetterTemplates(): CoverLetterTemplate[] {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "stages", "04_cover_letter", "references", "templates.md"),
      "utf8",
    );
    return raw
      .split(/^## /m)
      .slice(1)
      .map((section) => {
        const name = section.split("\n")[0].trim();
        const description = section.match(/^_(.+)_\s*$/m)?.[1] ?? "";
        const body = section.match(/```template\r?\n([\s\S]*?)```/)?.[1]?.trim() ?? "";
        const example = section.match(/```example\r?\n([\s\S]*?)```/)?.[1]?.trim();
        return { name, description, body, example };
      })
      .filter((template) => template.name && template.body);
  } catch {
    return [];
  }
}
