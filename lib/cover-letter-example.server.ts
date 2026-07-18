import fs from "fs";
import path from "path";

export interface CoverLetterExample {
  letter: string;
  notes: string[];
}

/**
 * Server-only: load the example letter from the ICM stage references.
 * Editing stages/04_cover_letter/references/reference/example-letter.md changes the
 * example shown in the app — no code change required.
 */
export function loadCoverLetterExample(): CoverLetterExample | null {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "stages", "04_cover_letter", "references", "reference", "example-letter.md"),
      "utf8",
    );
    const letter = raw.match(/```letter\r?\n([\s\S]*?)```/)?.[1]?.trim();
    if (!letter) return null;
    const notesSection = raw.split(/^## Why this letter works\s*$/m)[1] ?? "";
    const notes = notesSection
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2));
    return { letter, notes };
  } catch {
    return null;
  }
}
