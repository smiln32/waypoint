"use client";
import { useState } from "react";
import { useWaypoint } from "@/lib/store";
import type { NextActionKind, OpportunityStatus } from "@/lib/types";

const STAGE_OPTIONS: OpportunityStatus[] = [
  "Saved",
  "Researching",
  "Preparing",
  "Ready to Apply",
  "Application Started",
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Closed",
];

const ACTION_TARGETS: { label: string; kind: NextActionKind }[] = [
  { label: "No page", kind: "custom" },
  { label: "Resume Studio", kind: "review-resume" },
  { label: "Cover Letter", kind: "write-cover-letter" },
  { label: "Interview Prep", kind: "practice-interview" },
];

export function AddPositionForm() {
  const { addOpportunity, note } = useWaypoint();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [stage, setStage] = useState<OpportunityStatus>("Saved");
  const [contact, setContact] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [actionKind, setActionKind] = useState<NextActionKind>("custom");
  const [dueDate, setDueDate] = useState("");

  const reset = () => {
    setRole("");
    setCompany("");
    setStage("Saved");
    setContact("");
    setNextAction("");
    setActionKind("custom");
    setDueDate("");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!role.trim() || !company.trim()) return;
    const now = new Date().toISOString();
    addOpportunity({
      id: crypto.randomUUID(),
      company: company.trim(),
      role: role.trim(),
      source: "manual",
      status: stage,
      createdAt: now,
      statusChangedAt: now,
      materials: {
        resume: "Resume not tailored yet",
        coverLetter: "Cover letter not started",
      },
      ...(contact.trim() ? { contact: { name: contact.trim() } } : {}),
      nextAction: {
        kind: actionKind,
        label: nextAction.trim() || "Research the role and company",
        ...(dueDate ? { dueDate } : {}),
      },
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
    <form
      className="add-position"
      onSubmit={submit}
      aria-label="Add a new position"
    >
      <p id="add-position-required">Fields marked * are required.</p>
      <div className="add-position-grid">
        <label>
          Role title *
          <input
            value={role}
            required
            onChange={(e) => setRole(e.target.value)}
            placeholder="Operations Supervisor"
          />
        </label>
        <label>
          Company *
          <input
            value={company}
            required
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Northgate Logistics"
          />
        </label>
        <label>
          Stage
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as OpportunityStatus)}
          >
            {STAGE_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Contact
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Name, if you have one"
          />
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
          <select
            value={actionKind}
            onChange={(e) => setActionKind(e.target.value as NextActionKind)}
          >
            {ACTION_TARGETS.map((option) => (
              <option key={option.label} value={option.kind}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Due
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
      </div>
      <div className="add-position-actions">
        <button
          type="submit"
          className="primary"
          aria-describedby="add-position-required"
        >
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
