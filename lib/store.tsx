"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { CompanyBrief } from "./briefs";
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
  startApplication: (id: string) => void;
  briefs: Record<string, CompanyBrief>;
  saveBrief: (brief: CompanyBrief) => void;
}

const WaypointContext = createContext<WaypointStore | null>(null);

export function WaypointProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>(applicationRows);
  const hydratedRef = useRef(false);

  const [briefs, setBriefs] = useState<Record<string, CompanyBrief>>({});
  const [hydrated, setHydrated] = useState(false);

  // Restore persisted tracker state (deferred a tick so hydration matches SSR).
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = loadPersisted<ApplicationRow[]>("waypoint.applications");
      if (saved && Array.isArray(saved)) {
        // Merge in demo rows added after this session was first persisted.
        const normalized = saved.map((row) => ({ ...row, id: row.id || crypto.randomUUID() }));
        const merged = [...normalized, ...applicationRows.filter((demo) => !normalized.some((row) => row.id === demo.id))];
        setApplications(merged);
      }
      const savedBriefs = loadPersisted<Record<string, CompanyBrief>>("waypoint.briefs");
      if (savedBriefs) setBriefs(savedBriefs);
      hydratedRef.current = true;
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydratedRef.current) persist("waypoint.applications", applications);
  }, [applications]);

  // Materialize stage output files (ICM Layer 4) whenever tracker state changes.
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      fetch("/api/stage-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applications }),
      }).catch(() => {
        // Best-effort: the app never depends on the write.
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [applications, hydrated]);

  useEffect(() => {
    if (hydratedRef.current) persist("waypoint.briefs", briefs);
  }, [briefs]);

  const saveBrief = useCallback((brief: CompanyBrief) => {
    setBriefs((current) => ({ ...current, [brief.slug]: brief }));
  }, []);

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
          id: crypto.randomUUID(),
          role: job.title,
          roleDetail: `${job.company} · Saved from Job Search`,
          stage: "Saved",
          stageClass: "saved-stage",
          materials: "Resume not tailored yet",
          materialsDetail: "Cover letter not started",
          contact: "No contact yet",
          contactDetail: job.place,
          nextAction: "Review resume",
          nextActionDetail: job.fit ? `Fit: ${job.fit}` : "Saved from Job Search",
          nextActionView: "resume" as const,
          due: "—",
        },
      ];
    });
  }, []);

  const addPosition = useCallback((row: ApplicationRow) => {
    setApplications((rows) => [...rows, row]);
  }, []);

  const startApplication = useCallback((id: string) => {
    setApplications((rows) => rows.map((row) => row.id === id ? {
      ...row,
      stage: "Application Started",
      stageClass: "applied-stage",
      roleDetail: row.roleDetail.replace(/ ? (Saved|Added).*$/, " ? Application started"),
    } : row));
  }, []);

  return (
    <WaypointContext.Provider
      value={{ toast, note, applications, isJobTracked, toggleTrackedJob, addPosition, startApplication, briefs, saveBrief }}
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
