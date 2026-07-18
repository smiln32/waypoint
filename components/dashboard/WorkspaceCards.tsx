"use client";
import type { View } from "@/lib/types";
import { useGo } from "@/lib/use-go";

const WORKSPACES: { view: View; name: string; text: string }[] = [
  {
    view: "resume",
    name: "Resume Studio",
    text: "Translate your experience, review editor findings, and approve every change.",
  },
  {
    view: "search",
    name: "Job Search",
    text: "Find roles worth your time and see where your verified skills align.",
  },
  {
    view: "applications",
    name: "Job Tracking",
    text: "Keep roles, materials, contacts, and deadlines together in one place.",
  },
  {
    view: "coverletter",
    name: "Cover Letter",
    text: "Connect your verified experience to one specific employer and role.",
  },
  {
    view: "interview",
    name: "Interview Prep",
    text: "Practice realistic questions and make your experience clear to employers.",
  },
];

export function WorkspaceCards() {
  const onGo = useGo();
  return (
    <section className="dash-section" aria-label="Your workspaces">
      <div className="dash-section-head">
        <h2>Your workspaces</h2>
        <p>Each one handles a single part of your transition — you don&apos;t have to finish everything today.</p>
      </div>
      <div className="workspace-cards">
        {WORKSPACES.map((workspace) => (
          <button key={workspace.view} type="button" onClick={() => onGo(workspace.view)}>
            <b>{workspace.name}</b>
            <small>{workspace.text}</small>
            <em>Open →</em>
          </button>
        ))}
      </div>
    </section>
  );
}
