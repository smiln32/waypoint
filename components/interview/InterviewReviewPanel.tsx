"use client";
import { DemoNotice } from "@/components/review/DemoNotice";
import { ReviewHead } from "@/components/ui/ReviewHead";
import type { CritiqueResponse } from "@/lib/types";
import { ScoreGuide } from "./ScoreGuide";

const SCORE_ORDER: [keyof NonNullable<CritiqueResponse["scores"]>, string][] = [
  ["relevance", "Relevance"],
  ["ownership", "Ownership"],
  ["evidence", "Evidence"],
  ["translation", "Translation"],
];

export function InterviewReviewPanel({ review, onTryAgain }: { review: CritiqueResponse; onTryAgain: () => void }) {
  return (
    <aside className="review">
      <ReviewHead label="Evidence-based critique" />
      <DemoNotice source={review.source} />
      {review.scores && (
        <div className="scores">
          {SCORE_ORDER.map(([key, label]) => (
            <span key={key}>
              <b>{review.scores?.[key]}</b>
              {label}
            </span>
          ))}
        </div>
      )}
      <ScoreGuide />
      {review.findings.map((f) => (
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
      <button className="secondary full" onClick={onTryAgain}>
        Try the answer again
      </button>
    </aside>
  );
}
