"use client";
import { useCallback, useEffect, useState } from "react";
import { Heading } from "@/components/ui/Heading";
import { searchResults } from "@/lib/demo-data";
import { useWaypoint } from "@/lib/store";
import type { JobResult } from "@/lib/types";
import { JobResultCard } from "./JobResultCard";
import { SearchFilters } from "./SearchFilters";

export function JobSearchPage() {
  const { note, isJobTracked, toggleTrackedJob } = useWaypoint();
  const [query, setQuery] = useState("operations");
  const [location, setLocation] = useState("Jacksonville, NC");
  const [alert, setAlert] = useState(false);
  const [results, setResults] = useState<JobResult[]>([]);
  const [source, setSource] = useState<"usajobs" | "sample">("sample");
  const [searching, setSearching] = useState(false);
  const [resolved, setResolved] = useState(false);

  const runSearch = useCallback(async (q: string, loc: string) => {
    setSearching(true);
    try {
      const res = await fetch(`/api/jobs?q=${encodeURIComponent(q)}&loc=${encodeURIComponent(loc)}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { source: "usajobs" | "sample"; results: JobResult[] };
      setResults(data.results);
      setSource(data.source);
    } catch {
      setResults(searchResults);
      setSource("sample");
    }
    setSearching(false);
    setResolved(true);
  }, []);

  // Load live results on arrival when the API is configured.
  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch("operations", "Jacksonville, NC");
    }, 0);
    return () => clearTimeout(timer);
  }, [runSearch]);

  return (
    <div className="page job-search-page">
      <Heading
        kicker="JOB SEARCH"
        title="Find work worth pursuing."
        text="Search broadly, then use your verified evidence to decide where to invest your time."
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
            await runSearch(query, location);
            note("Search results updated");
          }}
        >
          {searching ? "Searching…" : "Search jobs"}
        </button>
      </section>
      <SearchFilters />
      <div className="results-heading">
        <div>
          <h2>{!resolved ? "Finding roles" : source === "usajobs" ? "USAJOBS results" : "Recommended results"}</h2>
          <span>
            {!resolved
              ? `Searching near ${location}…`
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
      {resolved && !searching && source === "sample" && (
        <p className="demo-notice" role="status">
          <b>Sample roles.</b> Live federal listings need a free USAJOBS key — set{" "}
          <code>USAJOBS_API_KEY</code> and <code>USAJOBS_EMAIL</code> in <code>.env.local</code>.
        </p>
      )}
      <div className="search-results">
        {!resolved &&
          [0, 1, 2].map((i) => <div className="result-skeleton" key={i} aria-hidden="true" />)}
        {resolved && results.map((job, i) => (
          <JobResultCard
            key={`${job.title}|${job.place}|${i}`}
            job={job}
            saved={isJobTracked(job.title)}
            onToggleSave={() => {
              const wasSaved = isJobTracked(job.title);
              toggleTrackedJob(job);
              note(wasSaved ? job.title + " removed from Job Tracking" : job.title + " saved to Job Tracking");
            }}
          />
        ))}
      </div>
    </div>
  );
}
