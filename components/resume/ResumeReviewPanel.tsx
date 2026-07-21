"use client";
import { DemoNotice } from "@/components/review/DemoNotice";
import { ReviewHead } from "@/components/ui/ReviewHead";
import type { Finding } from "@/lib/types";

export function ResumeReviewPanel({
  findings,
  decisions,
  source,
}: {
  findings: Finding[];
  decisions: string[];
  source: "claude" | "demo" | null;
}) {
  return (
    <aside className="review">
      <ReviewHead label={`${findings.length} findings`} />
      <DemoNotice source={source} />
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
      ) : source === "demo" ? (
        <div className="evaluation-clear">
          <b>No findings from this limited review set.</b>
          <p>
            This deterministic sample evaluation checks only a small set of known patterns. It does not
            confirm that the résumé is complete, clear, or ready to submit.
          </p>
        </div>
      ) : source === "claude" ? (
        <div className="evaluation-clear">
          <b>No findings from this review.</b>
          <p>You can continue editing or move this draft forward.</p>
        </div>
      ) : (
        <div className="evaluation-clear">
          <b>No review results yet.</b>
          <p>Submit this draft for evaluation when you are ready.</p>
        </div>
      )}
      {decisions.length > 0 && (
        <section className="decisions" aria-label="Highest-leverage decisions">
          <h3>Highest-leverage decisions</h3>
          <ol>
            {decisions.map((decision) => (
              <li key={decision}>{decision}</li>
            ))}
          </ol>
        </section>
      )}
    </aside>
  );
}
