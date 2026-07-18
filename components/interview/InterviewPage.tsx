"use client";
import { useEffect, useState } from "react";
import { Heading } from "@/components/ui/Heading";
import { requestCritique } from "@/lib/critique/client";
import { loadPersisted, persist } from "@/lib/persist";
import type { CritiqueResponse } from "@/lib/types";
import { InterviewReviewPanel } from "./InterviewReviewPanel";

interface SavedInterview {
  answer: string;
  review: CritiqueResponse | null;
}

const question = "Tell me about a time you solved a difficult technical problem under pressure.";

const initialAnswer =
  "We had an aircraft return with an intermittent fault. My team worked through it and got the jet back up before the next flight window.";

export function InterviewPage() {
  const [answer, setAnswer] = useState(initialAnswer);
  const [review, setReview] = useState<CritiqueResponse | null>(null);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = loadPersisted<SavedInterview>("waypoint.interview");
      if (!saved) return;
      setAnswer(saved.answer);
      setReview(saved.review);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const sendToEditor = async () => {
    if (reviewing) return;
    setReviewing(true);
    const result = await requestCritique("interview", answer, {
      question,
      role: "Technical Operations Manager",
    });
    setReview(result);
    setReviewing(false);
    persist("waypoint.interview", { answer, review: result });
  };

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
          <h2>{question}</h2>
          <label>
            Your response
            <textarea
              rows={8}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setReview(null);
                persist("waypoint.interview", { answer: e.target.value, review: null });
              }}
            />
          </label>
          <div className="actions">
            <button className="primary" disabled={reviewing} onClick={sendToEditor}>
              {reviewing ? "Reviewing…" : "Send to response editor"}
            </button>
          </div>
        </section>
        {review ? (
          <InterviewReviewPanel review={review} onTryAgain={() => setReview(null)} />
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
