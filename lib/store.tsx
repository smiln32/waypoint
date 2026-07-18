"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { applicationRows, savedJobSeeds } from "./demo-data";
import type { ApplicationRow, JobResult, SavedJob, SavedJobStatus } from "./types";

interface WaypointStore {
  toast: string;
  note: (message: string) => void;
  savedJobs: SavedJob[];
  isJobSaved: (title: string) => boolean;
  toggleSavedJob: (job: JobResult) => void;
  setSavedJobStatus: (id: string, status: SavedJobStatus) => void;
  applications: ApplicationRow[];
  startApplication: (job: { title: string; company: string }) => void;
}

const WaypointContext = createContext<WaypointStore | null>(null);

export function WaypointProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(savedJobSeeds);
  const [applications, setApplications] = useState<ApplicationRow[]>(applicationRows);

  const note = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  }, []);

  const isJobSaved = useCallback(
    (title: string) => savedJobs.some((job) => job.title === title),
    [savedJobs],
  );

  const toggleSavedJob = useCallback((job: JobResult) => {
    setSavedJobs((jobs) => {
      const existing = jobs.find((saved) => saved.title === job.title);
      if (existing) return jobs.filter((saved) => saved.id !== existing.id);
      return [
        ...jobs,
        {
          id: `search-${job.title}`,
          title: job.title,
          company: job.company,
          place: job.place,
          pay: job.pay,
          fit: job.fit.replace(/%.*$/, ""),
          tags: ["Maintenance leadership", "Safety systems"],
          status: "Saved",
        },
      ];
    });
  }, []);

  const setSavedJobStatus = useCallback((id: string, status: SavedJobStatus) => {
    setSavedJobs((jobs) => jobs.map((job) => (job.id === id ? { ...job, status } : job)));
  }, []);

  const startApplication = useCallback((job: { title: string; company: string }) => {
    setApplications((rows) => {
      if (rows.some((row) => row.role === job.title)) return rows;
      return [
        ...rows,
        {
          role: job.title,
          roleDetail: `${job.company} · Started today`,
          stage: "Preparing",
          stageClass: "saved-stage",
          materials: "Resume gap review",
          materialsDetail: "Cover letter pending",
          contact: "Recruiting team",
          contactDetail: "No direct contact yet",
          nextAction: "Tailor resume to the posting",
          nextActionDetail: "Then draft the cover letter",
          due: "—",
        },
      ];
    });
  }, []);

  return (
    <WaypointContext.Provider
      value={{
        toast,
        note,
        savedJobs,
        isJobSaved,
        toggleSavedJob,
        setSavedJobStatus,
        applications,
        startApplication,
      }}
    >
      {children}
    </WaypointContext.Provider>
  );
}

export function useWaypoint(): WaypointStore {
  const store = useContext(WaypointContext);
  if (!store) throw new Error("useWaypoint must be used inside WaypointProvider");
  return store;
}
