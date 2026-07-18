"use client";
import { useState } from "react";
import { useWaypoint } from "@/lib/store";
import type { OpportunityStatus, View } from "@/lib/types";

const STAGE_OPTIONS: { label: OpportunityStatus; className: string }[] = [
  { label: "Saved", className: "saved-stage" },
  { label: "Researching", className: "saved-stage" },
  { label: "Preparing", className: "saved-stage" },
  { label: "Ready to Apply", className: "saved-stage" },
  { label: "Application Started", className: "applied-stage" },
  { label: "Applied", className: "applied-stage" },
  { label: "Screening", className: "applied-stage" },
  { label: "Interview", className: "interview-stage" },
  { label: "Offer", className: "interview-stage" },
  { label: "Closed", className: "saved-stage" },
];

const ACTION_TARGETS: { label: string; view: View | "" }[] = [
  { label: "No page", view: "" },
  { label: "Resume Studio", view: "resume" },
  { label: "Cover Letter", view: "coverletter" },
  { label: "Interview Prep", view: "interview" },
];

export function AddPositionForm() {
  const { addPosition, note } = useWaypoint();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [stage, setStage] = useState<OpportunityStatus>("Saved");
  const [contact, setContact] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [target, setTarget] = useState<View | "">("");
  const [due, setDue] = useState("");

  const reset = () => {
    setRole("");
    setCompany("");
    setStage("Saved");
    setContact("");
    setNextAction("");
    setTarget("");
    setDue("");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!role.trim() || !company.trim()) return;
    const added = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    addPosition({
      id: crypto.randomUUID(),
      role: role.trim(),
      roleDetail: `${company.trim()} · Added ${added}`,
      stage,
      stageClass: STAGE_OPTIONS.find((option) => option.label === stage)?.className ?? "saved-stage",
      materials: "Resume not tailored yet",
      materialsDetail: "Cover letter not started",
      contact: contact.trim() || "No contact yet",
      contactDetail: "",
      nextAction: nextAction.trim() || "Research the role and company",
      nextActionDetail: "",
      nextActionView: target || undefined,
      due: due.trim() || "—",
    });
    note(role.trim() + " added to Job Tracking");
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="add-position-trigger">
        <button className="primary" onClick={() => setOpen(true)}>
          Add Position
        </button>
        <small>from another source</small>
      </div>
    );
  }

  return (
    <form className="add-position" onSubmit={submit} aria-label="Add a new position">
      <div className="add-position-grid">
        <label>
          Role title *
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Operations Supervisor" />
        </label>
        <label>
          Company *
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Northgate Logistics" />
        </label>
        <label>
          Stage
          <select value={stage} onChange={(e) => setStage(e.target.value as OpportunityStatus)}>
            {STAGE_OPTIONS.map((option) => (
              <option key={option.label}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Contact
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Name, if you have one" />
        </label>
        <label>
          Next action
          <input
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="Tailor resume"
          />
        </label>
        <label>
          Action opens
          <select value={target} onChange={(e) => setTarget(e.target.value as View | "")}>
            {ACTION_TARGETS.map((option) => (
              <option key={option.label} value={option.view}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Due
          <input value={due} onChange={(e) => setDue(e.target.value)} placeholder="Jul 30" />
        </label>
      </div>
      <div className="add-position-actions">
        <button type="submit" className="primary" disabled={!role.trim() || !company.trim()}>
          Add position
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            reset();
            setOpen(false);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
