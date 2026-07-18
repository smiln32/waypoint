"use client";
import type { JobResult, JobTrackingState } from "@/lib/types";

export function JobResultCard({
  job,
  trackingState,
  onToggleSave,
}: {
  job: JobResult;
  trackingState: JobTrackingState;
  onToggleSave: () => void;
}) {
  const isTracked = trackingState !== "not-tracked";
  const label = trackingState === "not-tracked" ? "Save" : trackingState === "saved" ? "Saved" : "Tracked";

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
        <button
          className="save-job"
          aria-pressed={isTracked}
          disabled={trackingState === "tracked"}
          onClick={onToggleSave}
        >
          {label}
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
