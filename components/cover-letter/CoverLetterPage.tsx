"use client";
import { useState } from "react";
import { Heading } from "@/components/ui/Heading";
import { useWaypoint } from "@/lib/store";
import { LetterReviewPanel } from "./LetterReviewPanel";

const initialDraft =
  "Dear Hiring Manager,\n\nI am applying for the Technical Operations Manager position at AeroNorth Systems. During eight years in Marine Corps aviation maintenance, I coordinated daily maintenance priorities for 12 F/A-18 aircraft and led 18 technicians across three shifts.\n\nThis experience taught me to make clear operational decisions when safety, schedule, parts availability, and personnel capacity were all in tension. I would welcome the opportunity to bring that judgment to AeroNorth Systems.\n\nSincerely,\nAlex Morgan";

export function CoverLetterPage() {
  const { note } = useWaypoint();
  const [draft, setDraft] = useState(initialDraft);
  const [reviewed, setReviewed] = useState(false);

  return (
    <div className="page cover-letter-page">
      <Heading
        kicker="COVER LETTER STUDIO"
        title="Make the connection specific."
        text="Draft for Technical Operations Manager · AeroNorth Systems"
      />
      <div className="cover-letter-workspace">
        <section>
          <div className="letter-toolbar">
            <label>
              Target role
              <input defaultValue="Technical Operations Manager" />
            </label>
            <label>
              Company
              <input defaultValue="AeroNorth Systems" />
            </label>
          </div>
          <label className="letter-draft">
            Cover letter
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setReviewed(false);
              }}
              rows={20}
            />
          </label>
          <div className="letter-actions">
            <span>{draft.trim().split(/\s+/).length} words</span>
            <button className="primary" onClick={() => setReviewed(true)}>
              Send to cover letter editor
            </button>
          </div>
        </section>
        {reviewed ? (
          <LetterReviewPanel
            onRevise={() => {
              setReviewed(false);
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
