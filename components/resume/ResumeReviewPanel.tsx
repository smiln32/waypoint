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
        <div className="findings-grid">
          {findings.map((f, index) => (
          <article className="finding" key={f.title}>
            <div className="finding-head">
              <span className="step-index" aria-hidden>
                {index + 1}
              </span>
              <div>
                <small className={f.level.toLowerCase()}>Impact: {f.level}</small>
                <h3>
                  <span className="sr-only">Finding {index + 1}: </span>
                  {f.title}
                </h3>
              </div>
            </div>
            <blockquote>“{f.quote}”</blockquote>
            <p>{f.why}</p>
            <section>
              <b>Your task</b>
              {f.task}
            </section>
          </article>
          ))}
        </div>
      ) : (
        <div className="evaluation-clear">
          <b>No findings from this review set.</b>
          <p>
            The three previously identified issues are no longer present. You can continue editing or move this
            draft forward.
          </p>
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
