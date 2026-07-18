export interface BriefSections {
  whoTheyAre: string;
  whatTheRoleOwns: string;
  whyYourRecordFits: string;
  likelyQuestions: string;
  honestGap: string;
}

export interface CompanyBrief {
  slug: string;
  company: string;
  role: string;
  generatedAt: string;
  source: "claude";
  sections: BriefSections;
}

export function briefSlug(company: string, role: string): string {
  return `${company} ${role}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The user's current resume as plain text, from the persisted document. */
export function resumeTextFromStorage(): string | null {
  try {
    const raw = window.localStorage.getItem("waypoint.resume");
    if (!raw) return null;
    const { html } = JSON.parse(raw) as { html?: string };
    if (!html) return null;
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent?.trim() || null;
  } catch {
    return null;
  }
}
