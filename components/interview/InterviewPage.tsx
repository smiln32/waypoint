"use client";
import { useState } from "react";
import { Heading } from "@/components/ui/Heading";
import { InterviewReviewPanel } from "./InterviewReviewPanel";

const initialAnswer =
  "We had an aircraft return with an intermittent fault. My team worked through it and got the jet back up before the next flight window.";

export function InterviewPage() {
  const [answer, setAnswer] = useState(initialAnswer);
  const [reviewed, setReviewed] = useState(false);

  return (
    <div className="page">
      <Heading
        kicker="INTERVIEW PRACTICE"
        title="Show employers how you solve problems."
        text="Scenario 2 of 5 · Technical Operations Manager"
      />
      <div className="interview">
        <section>
          <small>QUESTION</small>
          <h2>Tell me about a time you solved a difficult technical problem under pressure.</h2>
          <label>
            Your response
            <textarea rows={8} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </label>
          <div className="actions">
            <span>{answer.split(/\s+/).length} words</span>
            <button className="primary" onClick={() => setReviewed(true)}>
              Send to response editor
            </button>
          </div>
        </section>
        {reviewed ? (
          <InterviewReviewPanel answer={answer} onTryAgain={() => setReviewed(false)} />
        ) : (
          <aside className="empty">
            <b>The editor is ready.</b>
            <p>
              It will identify the exact phrases that hide your judgment, evidence, or civilian relevance. It
              will not write an answer for you.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
