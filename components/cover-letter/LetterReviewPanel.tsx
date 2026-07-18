"use client";
import { DemoNotice } from "@/components/review/DemoNotice";
import { ReviewHead } from "@/components/ui/ReviewHead";
import type { CritiqueResponse } from "@/lib/types";

export function LetterReviewPanel({ review, onRevise }: { review: CritiqueResponse; onRevise: () => void }) {
  const findings = review.findings;
  return (
    <aside className="review cover-review">
      <ReviewHead label={`${findings.length} decisions`} />
      <DemoNotice source={review.source} />
      {findings.map((f) => (
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
      ))}
      <button className="secondary full" onClick={onRevise}>
        Revise the letter
      </button>
    </aside>
  );
}
