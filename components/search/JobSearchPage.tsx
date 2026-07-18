"use client";
import { useState } from "react";
import { Heading } from "@/components/ui/Heading";
import { searchResults } from "@/lib/demo-data";
import type { View } from "@/lib/types";
import { JobResultCard } from "./JobResultCard";
import { SearchFilters } from "./SearchFilters";

export function JobSearchPage({ onGo, note }: { onGo: (view: View) => void; note: (message: string) => void }) {
  const [query, setQuery] = useState("technical operations manager");
  const [location, setLocation] = useState("Jacksonville, FL");
  const [saved, setSaved] = useState<string[]>([]);
  const [alert, setAlert] = useState(false);

  const toggle = (title: string) =>
    setSaved(saved.includes(title) ? saved.filter((x) => x !== title) : [...saved, title]);

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
        <button className="primary" onClick={() => note("Search results updated")}>
          Search jobs
        </button>
      </section>
      <SearchFilters />
      <div className="results-heading">
        <div>
          <h2>Recommended results</h2>
          <span>
            18 roles match “{query}” near {location}
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
      <div className="search-results">
        {searchResults.map((job) => (
          <JobResultCard
            key={job.title}
            job={job}
            saved={saved.includes(job.title)}
            onToggleSave={() => toggle(job.title)}
            onSeeEvidence={() => onGo("jobs")}
            onStartApplication={() => {
              note(job.title + " added to applications");
              onGo("applications");
            }}
          />
        ))}
      </div>
    </div>
  );
}
