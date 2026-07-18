import { findings as resumeDemoFindings } from "@/lib/demo-data";
import type { CritiqueResponse, CritiqueStage } from "@/lib/types";

/**
 * Grounded demo evaluators — the pre-AI behavior of the three editors,
 * kept as the offline fallback so the app always works without a key.
 */

const resumePatterns = [
  new RegExp("(^|[^A-Za-z])MC([^A-Za-z]|$)", "i"),
  new RegExp("Chief Information Security Officer", "i"),
  new RegExp("complex avionics|under time pressure", "i"),
];

export function resumeFallback(text: string): CritiqueResponse {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const next = resumeDemoFindings.flatMap((finding, index) => {
    const quote = lines.find((line) => resumePatterns[index].test(line));
    return quote ? [{ ...finding, quote }] : [];
  });
  const note = next.length
    ? "Evaluation updated: " + next.length + " finding" + (next.length === 1 ? "" : "s") + " to review."
    : "Evaluation updated: no current findings from this review set.";
  return { source: "demo", findings: next, note };
}

export function coverLetterFallback(): CritiqueResponse {
  return {
    source: "demo",
    findings: [
      {
        level: "High",
        title: "The employer connection is asserted, not demonstrated",
        quote: "I would welcome the opportunity to bring that judgment to AeroNorth Systems.",
        why: "The letter names AeroNorth, but it does not identify a company need, operating environment, or responsibility from the posting. This sentence could be sent to any aviation employer.",
        task: "Choose one responsibility from the posting and explain which verified experience prepares you to address it. Do not invent knowledge about the company.",
      },
      {
        level: "Medium",
        title: "The strongest evidence lacks a result",
        quote: "I coordinated daily maintenance priorities for 12 F/A-18 aircraft and led 18 technicians across three shifts.",
        why: "The scale is clear, but the reader cannot see what improved, stayed reliable, or became possible because of your coordination.",
        task: "Add one defensible operational result or decision outcome already supported by your record.",
      },
    ],
    note: "The editor reviewed the letter's employer connection and evidence.",
  };
}

const hasOwnership = (answer: string) => /\bI\b/i.test(answer);
const hasEvidence = (answer: string) =>
  /\b(because|result|before|after|reduced|increased|returned|verified|confirmed)\b/i.test(answer);
const hasJargon = (answer: string) => /\b(MC|MOS|NCO|OIC|sortie)\b/i.test(answer);

export function interviewFallback(answer: string): CritiqueResponse {
  const ownership = hasOwnership(answer);
  const evidence = hasEvidence(answer);
  const high = !ownership || !evidence;
  const words = answer.split(/\s+/);
  const quote = words.slice(0, 10).join(" ") + (words.length > 10 ? "…" : "");
  return {
    source: "demo",
    scores: {
      relevance: answer.trim().length > 45 ? 3 : 2,
      ownership: ownership ? 3 : 1,
      evidence: evidence ? 3 : 2,
      translation: hasJargon(answer) ? 1 : 3,
    },
    findings: [
      {
        level: high ? "High" : "Medium",
        title: !ownership
          ? "Your individual action disappears"
          : !evidence
            ? "The result needs stronger evidence"
            : "Your judgment is visible; sharpen the result",
        quote,
        why: !ownership
          ? "The interviewer is testing your technical judgment. Your response describes the group effort but does not yet show what you personally diagnosed, decided, or did."
          : !evidence
            ? "Your individual action is visible, but the interviewer still cannot tell what changed because of it or how you verified the result."
            : "Your action and an outcome are both visible. The remaining opportunity is to connect the technical decision to the evidence you used, so the result sounds demonstrated rather than asserted.",
        task: !ownership
          ? "Identify your first observation and the decision you personally made. Keep the team contribution, but make your own judgment visible."
          : !evidence
            ? "Add the observable result and explain how you knew the solution worked. Do not make the outcome cleaner than it was."
            : "Name the evidence or check that supported your decision. Keep the answer concise and do not add facts you cannot defend.",
      },
    ],
    note: "Evidence-based critique of the practice response.",
  };
}

export function fallbackCritique(stage: CritiqueStage, text: string): CritiqueResponse {
  if (stage === "resume") return resumeFallback(text);
  if (stage === "cover-letter") return coverLetterFallback();
  return interviewFallback(text);
}
