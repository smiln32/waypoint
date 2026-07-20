"use client";
import { useCallback, useEffect, useState } from "react";
import { Heading } from "@/components/ui/Heading";
import { useWaypoint } from "@/lib/store";
import type { JobResult } from "@/lib/types";
import { JobResultCard } from "./JobResultCard";
import { defaultJobSearchFilters, SearchFilters, type JobSearchFilters } from "./SearchFilters";

const unavailableMessage = "Live USAJOBS search is temporarily unavailable.";

export function JobSearchPage() {
  const { note, jobTrackingState, toggleTrackedJob } = useWaypoint();
  const [query, setQuery] = useState("operations");
  const [location, setLocation] = useState("Jacksonville, NC");
  const [alert, setAlert] = useState(false);
  const [filters, setFilters] = useState<JobSearchFilters>(defaultJobSearchFilters);
  const [results, setResults] = useState<JobResult[]>([]);
  const [source, setSource] = useState<"usajobs" | "sample" | "error">("error");
  const [searching, setSearching] = useState(false);
  const [resolved, setResolved] = useState(false);

  const runSearch = useCallback(async (q: string, loc: string, selectedFilters: JobSearchFilters) => {
    setSearching(true);
    try {
      const params = new URLSearchParams({ q, loc });
      Object.entries(selectedFilters).forEach(([name, value]) => {
        if (value) params.set(name, value);
      });
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { source: "usajobs" | "sample"; results: JobResult[] };
      setResults(data.results);
      setSource(data.source);
      return true;
    } catch {
      setResults([]);
      setSource("error");
      return false;
    } finally {
      setSearching(false);
      setResolved(true);
    }
  }, []);

  // Load live results on arrival when the API is configured.
  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch("operations", "Jacksonville, NC", defaultJobSearchFilters);
    }, 0);
    return () => clearTimeout(timer);
  }, [runSearch]);

  return (
    <div className="page job-search-page">
      <Heading
        kicker="JOB SEARCH"
        title="Find work worth pursuing."
        text="Search live federal openings by keyword, location, date posted, schedule, salary, and distance."
      />
      <section className="search-bar">
        <label>
          <span>Job title, skill, or company</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label>
          <span>City, state, or remote</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>
        <button
          className="primary"
          disabled={searching}
          onClick={async () => {
            const succeeded = await runSearch(query, location, filters);
            note(succeeded ? "Search results updated" : unavailableMessage);
          }}
        >
          {searching ? "Searching…" : "Search jobs"}
        </button>
      </section>
      <SearchFilters value={filters} onChange={setFilters} />
      <div className="results-heading">
        <div>
          <h2>
            {!resolved ? "Finding roles" : source === "error" ? "Search unavailable" : source === "usajobs" ? "USAJOBS results" : "Sample results"}
          </h2>
          <span>
            {!resolved
              ? `Searching near ${location}…`
              : source === "error"
                ? "Try again in a few minutes."
                : `${results.length} role${results.length === 1 ? "" : "s"} match “${query}” near ${location}`}
          </span>
        </div>
        <label>
          <input
            type="checkbox"
            checked={alert}
            onChange={(e) => {
              setAlert(e.target.checked);
              note(e.target.checked ? "Job alert created" : "Job alert paused");
            }}
          />{" "}
          Alert me to new jobs
        </label>
      </div>
      {resolved && !searching && source === "error" && (
        <p className="demo-notice" role="status">{unavailableMessage}</p>
      )}
      {resolved && !searching && source === "sample" && (
        <p className="demo-notice" role="status">
          <b>Sample roles.</b> Waypoint ships with example listings so you can explore without an
          API key. Live federal search requires your own USAJOBS credentials.
        </p>
      )}
      <div className="search-results">
        {!resolved &&
          [0, 1, 2].map((i) => <div className="result-skeleton" key={i} aria-hidden="true" />)}
        {resolved && results.map((job) => (
          <JobResultCard
            key={`${job.source}:${job.id}`}
            job={job}
            trackingState={jobTrackingState(job)}
            onToggleSave={() => {
              const trackingState = jobTrackingState(job);
              toggleTrackedJob(job);
              note(trackingState === "saved" ? job.title + " removed from Job Tracking" : job.title + " saved to Job Tracking");
            }}
          />
        ))}
      </div>
    </div>
  );
}
