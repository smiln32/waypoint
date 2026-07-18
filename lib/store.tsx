"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { applicationRows } from "./demo-data";
import { loadPersisted, persist } from "./persist";
import type { ApplicationRow, JobResult } from "./types";

interface WaypointStore {
  toast: string;
  note: (message: string) => void;
  applications: ApplicationRow[];
  isJobTracked: (title: string) => boolean;
  toggleTrackedJob: (job: JobResult) => void;
  addPosition: (row: ApplicationRow) => void;
}

const WaypointContext = createContext<WaypointStore | null>(null);

export function WaypointProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>(applicationRows);
  const hydratedRef = useRef(false);

  // Restore persisted tracker state (deferred a tick so hydration matches SSR).
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = loadPersisted<ApplicationRow[]>("waypoint.applications");
      if (saved && Array.isArray(saved)) setApplications(saved);
      hydratedRef.current = true;
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydratedRef.current) persist("waypoint.applications", applications);
  }, [applications]);

  const note = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  }, []);

  const isJobTracked = useCallback(
    (title: string) => applications.some((row) => row.role === title),
    [applications],
  );

  const toggleTrackedJob = useCallback((job: JobResult) => {
    setApplications((rows) => {
      const existing = rows.find((row) => row.role === job.title);
      if (existing) return rows.filter((row) => row !== existing);
      return [
        ...rows,
        {
          role: job.title,
          roleDetail: `${job.company} · Saved from Job Search`,
          stage: "Saved",
          stageClass: "saved-stage",
          materials: "Resume not tailored yet",
          materialsDetail: "Cover letter not started",
          contact: "No contact yet",
          contactDetail: job.place,
          nextAction: "Review resume",
          nextActionDetail: `Fit: ${job.fit}`,
          nextActionView: "resume" as const,
          due: "—",
        },
      ];
    });
  }, []);

  const addPosition = useCallback((row: ApplicationRow) => {
    setApplications((rows) => [...rows, row]);
  }, []);

  return (
    <WaypointContext.Provider value={{ toast, note, applications, isJobTracked, toggleTrackedJob, addPosition }}>
      {children}
    </WaypointContext.Provider>
  );
}

export function useWaypoint(): WaypointStore {
  const store = useContext(WaypointContext);
  if (!store) throw new Error("useWaypoint must be used inside WaypointProvider");
  return store;
}
