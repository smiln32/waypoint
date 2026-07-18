"use client";
import type { JobResult } from "@/lib/types";

export function JobResultCard({
  job,
  saved,
  onToggleSave,
}: {
  job: JobResult;
  saved: boolean;
  onToggleSave: () => void;
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
        {[job.pay, job.type, job.apply].filter(Boolean).map((fact) => (
          <span key={fact}>{fact}</span>
        ))}
      </div>
      {job.fit && (
        <div className="job-result-actions">
          <b>{job.fit}</b>
        </div>
      )}
    </article>
  );
}
