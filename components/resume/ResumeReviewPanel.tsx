"use client";
import { ReviewHead } from "@/components/ui/ReviewHead";
import type { Finding } from "@/lib/types";

export function ResumeReviewPanel({ findings }: { findings: Finding[] }) {
  return (
    <aside className="review">
      <ReviewHead label={`${findings.length} decisions`} />
      {findings.length ? (
        findings.map((f) => (
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
    </aside>
  );
}
