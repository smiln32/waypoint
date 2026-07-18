"use client";
import { ReviewHead } from "@/components/ui/ReviewHead";
import type { Finding } from "@/lib/types";

export function ResumeReviewPanel({
  findings,
  selected,
  onToggle,
  onCreateDraft,
}: {
  findings: Finding[];
  selected: number[];
  onToggle: (index: number) => void;
  onCreateDraft: () => void;
}) {
  return (
    <aside className="review">
      <ReviewHead label={`${findings.length} decisions`} />
      {findings.length ? (
        findings.map((f, i) => (
          <article className="finding" key={f.title}>
            <div>
              <small className={f.level.toLowerCase()}>Impact: {f.level}</small>
              <h3>{f.title}</h3>
            </div>
            <blockquote>“{f.quote}”</blockquote>
            <p>{f.why}</p>
            <section>
              <b>Your task</b>
              {f.task}
            </section>
            <label>
              <input type="checkbox" checked={selected.includes(i)} onChange={() => onToggle(i)} /> Use this
              finding when creating the next draft
            </label>
            <small className="decision-help">
              Checking this adds the finding to “Create next draft.” It does not change your resume yet.
            </small>
          </article>
        ))
      ) : (
        <div className="evaluation-clear">
          <b>No findings from this review set.</b>
          <p>
            The three previously identified issues are no longer present. You can continue editing or move this
            draft forward.
          </p>
        </div>
      )}
      <button className="primary full" disabled={!selected.length} onClick={onCreateDraft}>
        Create next draft from {selected.length || "selected"} decisions
      </button>
    </aside>
  );
}
