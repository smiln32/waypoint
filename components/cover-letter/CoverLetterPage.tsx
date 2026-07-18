"use client";
import { useState } from "react";
import { Heading } from "@/components/ui/Heading";
import type { CoverLetterTemplate } from "@/lib/cover-letter-templates.server";
import { requestCritique } from "@/lib/critique/client";
import { useWaypoint } from "@/lib/store";
import type { CritiqueResponse } from "@/lib/types";
import { LetterReviewPanel } from "./LetterReviewPanel";
import { TemplatePicker } from "./TemplatePicker";

const initialDraft =
  "Dear Hiring Manager,\n\nI am applying for the Technical Operations Manager position at AeroNorth Systems. During eight years in Marine Corps aviation maintenance, I coordinated daily maintenance priorities for 12 F/A-18 aircraft and led 18 technicians across three shifts.\n\nThis experience taught me to make clear operational decisions when safety, schedule, parts availability, and personnel capacity were all in tension. I would welcome the opportunity to bring that judgment to AeroNorth Systems.\n\nSincerely,\nAlex Morgan";

export function CoverLetterPage({ templates }: { templates: CoverLetterTemplate[] }) {
  const { note } = useWaypoint();
  const [draft, setDraft] = useState(initialDraft);
  const [role, setRole] = useState("Technical Operations Manager");
  const [company, setCompany] = useState("AeroNorth Systems");
  const [review, setReview] = useState<CritiqueResponse | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const loadTemplate = (template: CoverLetterTemplate) => {
    const draftIsUntouched = draft === initialDraft || !draft.trim();
    if (!draftIsUntouched && !window.confirm("Replace your current draft with this template?")) return;
    setDraft(template.body);
    setReview(null);
    note(template.name + " loaded — replace the brackets with your facts");
  };

  const sendToEditor = async () => {
    if (reviewing) return;
    setReviewing(true);
    const result = await requestCritique("cover-letter", draft, { role, company });
    setReview(result);
    setReviewing(false);
  };

  return (
    <div className="page cover-letter-page">
      <Heading
        kicker="COVER LETTER STUDIO"
        title="Make the connection specific."
        text="Draft for Technical Operations Manager · AeroNorth Systems"
      />
      <TemplatePicker templates={templates} onPick={loadTemplate} />
      <div className="cover-letter-workspace">
        <section>
          <div className="letter-toolbar">
            <label>
              Target role
              <input value={role} onChange={(e) => setRole(e.target.value)} />
            </label>
            <label>
              Company
              <input value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
          </div>
          <label className="letter-draft">
            Cover letter
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setReview(null);
              }}
              rows={20}
            />
          </label>
          <div className="letter-actions">
            <span>{draft.trim().split(/\s+/).length} words</span>
            <button className="primary" disabled={reviewing} onClick={sendToEditor}>
              {reviewing ? "Reviewing…" : "Send to cover letter editor"}
            </button>
          </div>
        </section>
        {review ? (
          <LetterReviewPanel
            findings={review.findings}
            onRevise={() => {
              setReview(null);
              note("Draft reopened for revision");
            }}
          />
        ) : (
          <aside className="empty cover-empty">
            <div>
              <b>The cover letter editor is ready.</b>
              <p>
                It checks whether your letter connects verified experience to this employer and role. It
                critiques weak claims; it does not write the letter for you.
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
