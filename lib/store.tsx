"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { CompanyBrief } from "./briefs";
import { opportunityRecords } from "./demo-data";
import {
  LEGACY_APPLICATION_STORAGE_KEY,
  OPPORTUNITY_SCHEMA_VERSION,
  OPPORTUNITY_STORAGE_KEY,
  resolveOpportunityState,
} from "./opportunity-migration";
import { jobIdentity, jobTrackingStateFor, opportunityMatchesJob } from "./opportunities";
import { loadPersisted, persist } from "./persist";
import type { JobResult, JobTrackingState, OpportunityRecord } from "./types";

interface WaypointStore {
  toast: string;
  note: (message: string) => void;
  opportunities: OpportunityRecord[];
  jobTrackingState: (job: JobResult) => JobTrackingState;
  toggleTrackedJob: (job: JobResult) => void;
  addOpportunity: (record: OpportunityRecord) => void;
  startApplication: (id: string) => void;
  briefs: Record<string, CompanyBrief>;
  saveBrief: (brief: CompanyBrief) => void;
}

const WaypointContext = createContext<WaypointStore | null>(null);

export function WaypointProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>(opportunityRecords);
  const hydratedRef = useRef(false);
  const [briefs, setBriefs] = useState<Record<string, CompanyBrief>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = loadPersisted<unknown>(OPPORTUNITY_STORAGE_KEY);
      const legacy = loadPersisted<unknown>(LEGACY_APPLICATION_STORAGE_KEY);
      const resolved = resolveOpportunityState(current, legacy, opportunityRecords);
      setOpportunities(resolved.state.records);
      if (resolved.shouldPersist) persist(OPPORTUNITY_STORAGE_KEY, resolved.state);
      const savedBriefs = loadPersisted<Record<string, CompanyBrief>>("waypoint.briefs");
      if (savedBriefs) setBriefs(savedBriefs);
      hydratedRef.current = true;
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydratedRef.current) {
      persist(OPPORTUNITY_STORAGE_KEY, { version: OPPORTUNITY_SCHEMA_VERSION, records: opportunities });
    }
  }, [opportunities]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      fetch("/api/stage-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunities }),
      }).catch(() => {
        // Best-effort: the app never depends on the write.
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [opportunities, hydrated]);

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

  const jobTrackingState = useCallback(
    (job: JobResult) => jobTrackingStateFor(opportunities, job),
    [opportunities],
  );

  const toggleTrackedJob = useCallback((job: JobResult) => {
    setOpportunities((records) => {
      const sourceId = jobIdentity(job);
      const existing = records.find((record) => opportunityMatchesJob(record, job));
      if (existing) {
        if (existing.status !== "Saved") return records;
        return records.filter((record) => record.id !== existing.id);
      }
      const now = new Date().toISOString();
      return [
        ...records,
        {
          id: crypto.randomUUID(),
          company: job.company,
          role: job.title,
          ...(job.place ? { location: job.place } : {}),
          source: "job-search",
          sourceId,
          status: "Saved",
          createdAt: now,
          statusChangedAt: now,
          materials: { resume: "Resume not tailored yet", coverLetter: "Cover letter not started" },
          nextAction: {
            kind: "review-resume",
            label: "Review resume",
            ...(job.fit ? { detail: `Fit: ${job.fit}` } : { detail: "Saved from Job Search" }),
          },
        },
      ];
    });
  }, []);

  const addOpportunity = useCallback((record: OpportunityRecord) => {
    setOpportunities((records) => [...records, record]);
  }, []);

  const startApplication = useCallback((id: string) => {
    setOpportunities((records) => records.map((record) => record.id === id ? {
      ...record,
      status: "Application Started",
      statusChangedAt: new Date().toISOString(),
    } : record));
  }, []);

  return (
    <WaypointContext.Provider
      value={{ toast, note, opportunities, jobTrackingState, toggleTrackedJob, addOpportunity, startApplication, briefs, saveBrief }}
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
