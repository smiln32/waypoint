"use client";
import { jobTrackingButtonFor } from "@/lib/opportunities";
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
  const button = jobTrackingButtonFor(trackingState);

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
          aria-label={`${button.label} ${job.title} at ${job.company}`}
          aria-pressed={button.pressed}
          disabled={button.disabled}
          onClick={onToggleSave}
        >
          {button.label}
        </button>
      </div>
      <div className="job-facts">
        {[job.pay, job.type, job.apply].filter(Boolean).map((fact) => (
          <span key={fact}>{fact}</span>
        ))}
      </div>
      {(job.fit || job.url) && (
        <div className="job-result-actions">
          {job.fit && <b>{job.fit}</b>}
          {job.url && (
            <a className="job-result-link secondary" href={job.url} target="_blank" rel="noopener noreferrer">
              View on USAJOBS
            </a>
          )}
        </div>
      )}
    </article>
  );
}
