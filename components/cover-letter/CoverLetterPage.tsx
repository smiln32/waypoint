"use client";
import { useEffect, useState } from "react";
import { Heading } from "@/components/ui/Heading";
import type { CoverLetterExample } from "@/lib/cover-letter-example.server";
import { requestCritique } from "@/lib/critique/client";
import { loadPersisted, persist } from "@/lib/persist";
import { useWaypoint } from "@/lib/store";
import type { CritiqueResponse } from "@/lib/types";
import { ExampleLetter } from "./ExampleLetter";
import { LetterReviewPanel } from "./LetterReviewPanel";

interface SavedLetter {
  draft: string;
  role: string;
  company: string;
  review: CritiqueResponse | null;
}

export function CoverLetterPage({ example }: { example: CoverLetterExample | null }) {
  const { note } = useWaypoint();
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [review, setReview] = useState<CritiqueResponse | null>(null);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = loadPersisted<SavedLetter>("waypoint.letter");
      if (!saved) return;
      setDraft(saved.draft);
      setRole(saved.role);
      setCompany(saved.company);
      setReview(saved.review);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const persistLetter = (partial: Partial<SavedLetter>) => {
    persist("waypoint.letter", { draft, role, company, review, ...partial });
  };

  const sendToEditor = async () => {
    if (reviewing) return;
    setReviewing(true);
    const result = await requestCritique("cover-letter", draft, { role, company });
    setReview(result);
    setReviewing(false);
    persistLetter({ review: result });
  };

  return (
    <div className="page cover-letter-page">
      <Heading
        kicker="COVER LETTER STUDIO"
        title="Make the connection specific."
        text="Write your letter for one employer and one role. The editor critiques the connection — it never writes for you."
      />
      <ExampleLetter example={example} />
      <div className="cover-letter-workspace">
        <section>
          <div className="letter-toolbar">
            <label>
              Target role
              <input
                value={role}
                placeholder="Operations Supervisor"
                onChange={(e) => {
                  setRole(e.target.value);
                  persistLetter({ role: e.target.value });
                }}
              />
            </label>
            <label>
              Company
              <input
                value={company}
                placeholder="Company name"
                onChange={(e) => {
                  setCompany(e.target.value);
                  persistLetter({ company: e.target.value });
                }}
              />
            </label>
          </div>
          <label className="letter-draft">
            Cover letter
            <textarea
              value={draft}
              placeholder="Write your letter here. Not sure how to start? Open the example above."
              onChange={(e) => {
                setDraft(e.target.value);
                setReview(null);
                persistLetter({ draft: e.target.value, review: null });
              }}
              rows={20}
            />
          </label>
          <div className="letter-actions">
            <span>{draft.trim() ? draft.trim().split(/\s+/).length : 0} words</span>
            <button className="primary" disabled={reviewing || !draft.trim()} onClick={sendToEditor}>
              {reviewing ? "Reviewing…" : "Send to cover letter editor"}
            </button>
          </div>
        </section>
        {review ? (
          <LetterReviewPanel
            review={review}
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
