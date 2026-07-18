"use client";
import { ReviewHead } from "@/components/ui/ReviewHead";

export function LetterReviewPanel({ onRevise }: { onRevise: () => void }) {
  return (
    <aside className="review cover-review">
      <ReviewHead label="3 decisions" />
      <article className="finding">
        <div>
          <small className="high">Impact: High</small>
          <h3>The employer connection is asserted, not demonstrated</h3>
        </div>
        <blockquote>“I would welcome the opportunity to bring that judgment to AeroNorth Systems.”</blockquote>
        <p>
          The letter names AeroNorth, but it does not identify a company need, operating environment, or
          responsibility from the posting. This sentence could be sent to any aviation employer.
        </p>
        <section>
          <b>Your task</b>Choose one responsibility from the posting and explain which verified experience
          prepares you to address it. Do not invent knowledge about the company.
        </section>
      </article>
      <article className="finding">
        <div>
          <small className="medium">Impact: Medium</small>
          <h3>The strongest evidence lacks a result</h3>
        </div>
        <blockquote>
          “I coordinated daily maintenance priorities for 12 F/A-18 aircraft and led 18 technicians across three
          shifts.”
        </blockquote>
        <p>
          The scale is clear, but the reader cannot see what improved, stayed reliable, or became possible
          because of your coordination.
        </p>
        <section>
          <b>Your task</b>Add one defensible operational result or decision outcome already supported by your
          record.
        </section>
      </article>
      <button className="secondary full" onClick={onRevise}>
        Revise the letter
      </button>
    </aside>
  );
}
