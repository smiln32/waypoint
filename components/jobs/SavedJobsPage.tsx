"use client";
import { Heading } from "@/components/ui/Heading";
import { useWaypoint } from "@/lib/store";
import type { SavedJobStatus } from "@/lib/types";
import { useGo } from "@/lib/use-go";

const STATUSES: SavedJobStatus[] = ["Saved", "Researching", "Ready to apply"];

export function SavedJobsPage() {
  const onGo = useGo();
  const { savedJobs, setSavedJobStatus, startApplication, note } = useWaypoint();

  return (
    <div className="page">
      <Heading
        kicker="JOB TRACKING"
        title="Roles worth your time."
        text="Fit is evidence, not a verdict. Every score shows what supports it. Move each saved role from research to a started application."
      />
      <div className="pipeline-summary" aria-label="Saved jobs by status">
        {STATUSES.map((status) => (
          <span key={status}>
            <b>{savedJobs.filter((job) => job.status === status).length}</b>
            {status}
          </span>
        ))}
      </div>
      {savedJobs.length ? (
        <div className="jobs">
          {savedJobs.map((job) => (
            <article key={job.id}>
              <strong>
                {job.fit}
                <small>fit</small>
              </strong>
              <div>
                <h2>{job.title}</h2>
                <p>
                  {job.company} · {job.place}
                </p>
                {job.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
                {job.pay && <p className="saved-job-pay">{job.pay}</p>}
              </div>
              <section>
                {job.gap && (
                  <>
                    <small>QUALIFICATION TO ADDRESS</small>
                    <b>{job.gap}</b>
                  </>
                )}
                <label className="job-status">
                  Status
                  <select
                    value={job.status}
                    onChange={(e) => setSavedJobStatus(job.id, e.target.value as SavedJobStatus)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="primary"
                  onClick={() => {
                    startApplication(job);
                    note(job.title + " added to applications");
                    onGo("applications");
                  }}
                >
                  Start application
                </button>
                <button className="link" onClick={() => onGo("interview")}>
                  Prepare for this role →
                </button>
              </section>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <div>
            <b>No saved jobs yet.</b>
            <p>Save roles from Job Search and they will appear here, ready to research and apply.</p>
          </div>
        </div>
      )}
    </div>
  );
}
