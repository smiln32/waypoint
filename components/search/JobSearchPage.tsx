"use client";
import { useState } from "react";
import { Heading } from "@/components/ui/Heading";
import { searchResults } from "@/lib/demo-data";
import { useWaypoint } from "@/lib/store";
import { useGo } from "@/lib/use-go";
import { JobResultCard } from "./JobResultCard";
import { SearchFilters } from "./SearchFilters";

export function JobSearchPage() {
  const onGo = useGo();
  const { note, isJobSaved, toggleSavedJob, startApplication } = useWaypoint();
  const [query, setQuery] = useState("technical operations manager");
  const [location, setLocation] = useState("Jacksonville, FL");
  const [alert, setAlert] = useState(false);

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
            saved={isJobSaved(job.title)}
            onToggleSave={() => {
              const wasSaved = isJobSaved(job.title);
              toggleSavedJob(job);
              note(wasSaved ? job.title + " removed from Job Tracking" : job.title + " saved to Job Tracking");
            }}
            onSeeEvidence={() => onGo("jobs")}
            onStartApplication={() => {
              startApplication(job);
              note(job.title + " added to applications");
              onGo("applications");
            }}
          />
        ))}
      </div>
    </div>
  );
}
