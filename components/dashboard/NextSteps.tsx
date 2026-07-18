"use client";
import { findings } from "@/lib/demo-data";
import { useWaypoint } from "@/lib/store";
import type { View } from "@/lib/types";
import { useGo } from "@/lib/use-go";

interface Step {
  label: string;
  context: string;
  due: string;
  view: View;
}

export function NextSteps() {
  const { applications } = useWaypoint();
  const onGo = useGo();

  const steps: Step[] = [
    {
      label: `Resolve ${findings.length} resume findings`,
      context: "The editor flagged passages a civilian reader may misread",
      due: "Today",
      view: "resume",
    },
    ...applications
      .filter((row) => row.due !== "—")
      .map(
        (row): Step => ({
          label: row.nextAction,
          context: `${row.role} · ${row.roleDetail.split(" · ")[0]}`,
          due: row.due,
          view: row.nextActionView ?? "applications",
        }),
      ),
  ].slice(0, 4);

  return (
    <section className="dash-section" aria-label="Your next steps">
      <div className="dash-section-head">
        <h2>Your next steps</h2>
        <p>Start at the top — each step opens the workspace where it happens.</p>
      </div>
      <ol className="next-steps">
        {steps.map((step, index) => (
          <li key={step.label + step.due}>
            <button type="button" onClick={() => onGo(step.view)}>
              <span className="step-index">{index + 1}</span>
              <span className="step-main">
                <b>{step.label}</b>
                <small>{step.context}</small>
              </span>
              <span className="step-due">{step.due}</span>
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
