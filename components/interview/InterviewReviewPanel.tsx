"use client";
import { ReviewHead } from "@/components/ui/ReviewHead";
import { ScoreGuide } from "./ScoreGuide";

const ownership = (answer: string) => /\bI\b/i.test(answer);
const evidence = (answer: string) =>
  /\b(because|result|before|after|reduced|increased|returned|verified|confirmed)\b/i.test(answer);
const jargon = (answer: string) => /\b(MC|MOS|NCO|OIC|sortie)\b/i.test(answer);

export function InterviewReviewPanel({ answer, onTryAgain }: { answer: string; onTryAgain: () => void }) {
  const scores: [string, string][] = [
    [answer.trim().length > 45 ? "3" : "2", "Relevance"],
    [ownership(answer) ? "3" : "1", "Ownership"],
    [evidence(answer) ? "3" : "2", "Evidence"],
    [jargon(answer) ? "1" : "3", "Translation"],
  ];
  const high = !ownership(answer) || !evidence(answer);

  return (
    <aside className="review">
      <ReviewHead label="Evidence-based critique" />
      <div className="scores">
        {scores.map((s) => (
          <span key={s[1]}>
            <b>{s[0]}</b>
            {s[1]}
          </span>
        ))}
      </div>
      <ScoreGuide />
      <article className="finding">
        <div>
          <small className={high ? "high" : "medium"}>Impact: {high ? "High" : "Medium"}</small>
          <h3>
            {!ownership(answer)
              ? "Your individual action disappears"
              : !evidence(answer)
                ? "The result needs stronger evidence"
                : "Your judgment is visible; sharpen the result"}
          </h3>
        </div>
        <blockquote>
          “{answer.split(/\s+/).slice(0, 10).join(" ")}
          {answer.split(/\s+/).length > 10 ? "…" : ""}”
        </blockquote>
        <p>
          {!ownership(answer)
            ? "The interviewer is testing your technical judgment. Your response describes the group effort but does not yet show what you personally diagnosed, decided, or did."
            : !evidence(answer)
              ? "Your individual action is visible, but the interviewer still cannot tell what changed because of it or how you verified the result."
              : "Your action and an outcome are both visible. The remaining opportunity is to connect the technical decision to the evidence you used, so the result sounds demonstrated rather than asserted."}
        </p>
        <section>
          <b>Your task</b>
          {!ownership(answer)
            ? "Identify your first observation and the decision you personally made. Keep the team contribution, but make your own judgment visible."
            : !evidence(answer)
              ? "Add the observable result and explain how you knew the solution worked. Do not make the outcome cleaner than it was."
              : "Name the evidence or check that supported your decision. Keep the answer concise and do not add facts you cannot defend."}
        </section>
      </article>
      <button className="secondary full" onClick={onTryAgain}>
        Try the answer again
      </button>
    </aside>
  );
}
