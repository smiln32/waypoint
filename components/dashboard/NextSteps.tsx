"use client";
import { findings } from "@/lib/demo-data";
import { formatFriendlyDate, nextActionViewFor } from "@/lib/opportunities";
import { useWaypoint } from "@/lib/store";
import type { View } from "@/lib/types";
import { useGo } from "@/lib/use-go";

interface Step { label: string; context: string; due: string; view: View; }

export function NextSteps() {
  const { opportunities } = useWaypoint();
  const onGo = useGo();
  const allSteps: Step[] = [
    { label: `Resolve ${findings.length} resume findings`, context: "The editor flagged passages a civilian reader may misread", due: "Today", view: "resume" },
    ...opportunities.filter((record) => record.nextAction.dueDate).map((record): Step => ({
      label: record.nextAction.label,
      context: `${record.role} · ${record.company}`,
      due: formatFriendlyDate(record.nextAction.dueDate),
      view: nextActionViewFor(record.nextAction.kind) ?? "applications",
    })),
  ];
  const steps = allSteps.slice(0, 4);
  return (
    <section className="dash-section" aria-label="Your next steps">
      <div className="dash-section-head"><h2>Your next steps</h2><p>Start at the top — each step opens the workspace where it happens.</p></div>
      <ol className="next-steps">{steps.map((step, index) => (
        <li key={step.label + step.context + step.due}><button type="button" onClick={() => onGo(step.view)}>
          <span className="step-index">{index + 1}</span><span className="step-main"><b>{step.label}</b><small>{step.context}</small></span>
          <span className="step-due">{step.due}</span><span className="step-arrow" aria-hidden>→</span>
        </button></li>
      ))}</ol>
    </section>
  );
}
