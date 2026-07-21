"use client";
import type { View } from "@/lib/types";
import { useGo } from "@/lib/use-go";

const PATH: { view: View; label: string; context: string }[] = [
  {
    view: "resume",
    label: "Add and review your resume",
    context: "Both happen on one page: load the resume you have, then work through the editor's findings right below.",
  },
  {
    view: "search",
    label: "Search for roles that fit",
    context: "Browse sample federal-style roles and save the ones worth pursuing. Live with API key.",
  },
  {
    view: "applications",
    label: "Track what you save and apply to",
    context: "Keep roles, materials, contacts, and deadlines together in Job Tracking.",
  },
  {
    view: "coverletter",
    label: "Write the cover letter",
    context: "Connect your verified experience to one specific employer and role.",
  },
  {
    view: "interview",
    label: "Practice the interview",
    context: "Rehearse realistic questions and make your experience clear to employers.",
  },
];

export function HowItWorks() {
  const onGo = useGo();
  return (
    <section className="dash-section" aria-label="How Waypoint works">
      <div className="dash-section-head">
        <h2>How Waypoint works</h2>
      </div>
      <ol className="next-steps how-steps">
        {PATH.map((step, index) => (
          <li key={step.view}>
            <button type="button" onClick={() => onGo(step.view)}>
              <span className="step-index">{index + 1}</span>
              <span className="step-main">
                <b>{step.label}</b>
                <small>{step.context}</small>
              </span>
              <span className="step-arrow" aria-hidden>
                →
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
