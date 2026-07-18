"use client";
import type { JobResult } from "@/lib/types";

export function JobResultCard({
  job,
  saved,
  onToggleSave,
  onSeeEvidence,
  onStartApplication,
}: {
  job: JobResult;
  saved: boolean;
  onToggleSave: () => void;
  onSeeEvidence: () => void;
  onStartApplication: () => void;
}) {
  return (
    <article>
      <div className="job-result-main">
        <div>
          <small>{job.age}</small>
          <h3>{job.title}</h3>
          <p>
            <b>{job.company}</b> · {job.place}
          </p>
        </div>
        <button className="save-job" aria-pressed={saved} onClick={onToggleSave}>
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="job-facts">
        <span>{job.pay}</span>
        <span>{job.type}</span>
        <span>{job.apply}</span>
      </div>
      <p className="job-preview">
        Lead maintenance planning, technical teams, readiness reporting, and cross-functional operational
        decisions in a safety-critical environment.
      </p>
      <div className="job-result-actions">
        <b>{job.fit}</b>
        <button className="secondary" onClick={onSeeEvidence}>
          See match evidence
        </button>
        <button className="primary" onClick={onStartApplication}>
          Start application
        </button>
      </div>
    </article>
  );
}
