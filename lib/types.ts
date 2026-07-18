export type View =
  | "start"
  | "dashboard"
  | "resume"
  | "coverletter"
  | "search"
  | "applications"
  | "interview";

export type ImpactLevel = "High" | "Medium" | "Low";

export interface Finding {
  level: ImpactLevel;
  title: string;
  quote: string;
  why: string;
  task: string;
}

/** [fit score, role title, company, location, qualification to address] */
export type JobMatch = [string, string, string, string, string];

export interface JobResult {
  /** Stable identity from the source system; never the result-list index. */
  id: string;
  source: "usajobs" | "sample";
  title: string;
  company: string;
  place: string;
  pay: string;
  age: string;
  type: string;
  apply: string;
  fit: string;
}

export type CritiqueStage = "resume" | "cover-letter" | "interview";

export interface InterviewScores {
  relevance: number;
  ownership: number;
  evidence: number;
  translation: number;
}

export interface CritiqueResponse {
  source: "claude" | "demo";
  findings: Finding[];
  /** Interview stage only: 0–4 per dimension. */
  scores?: InterviewScores;
  note: string;
}

export type OpportunityStatus =
  | "Saved"
  | "Researching"
  | "Preparing"
  | "Ready to Apply"
  | "Application Started"
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Closed";

export const PRE_APPLICATION_STATUSES: OpportunityStatus[] = ["Saved", "Researching", "Preparing", "Ready to Apply"];
export const APPLICATION_STATUSES: OpportunityStatus[] = ["Application Started", "Applied", "Screening", "Interview", "Offer", "Closed"];

export type OpportunitySource = "job-search" | "manual" | "demo";

export type NextActionKind =
  | "review-resume"
  | "write-cover-letter"
  | "practice-interview"
  | "follow-up"
  | "research"
  | "custom";

export interface OpportunityMaterials {
  resume: string;
  coverLetter: string;
}

export interface OpportunityContact {
  name: string;
  relationship?: string;
  email?: string;
  phone?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
}

export interface OpportunityNextAction {
  kind: NextActionKind;
  label: string;
  detail?: string;
  dueDate?: string;
}

export interface OpportunityRecord {
  /** Permanent Waypoint ID, preserved across stage ownership changes. */
  id: string;
  company: string;
  role: string;
  location?: string;
  source: OpportunitySource;
  sourceId?: string;
  status: OpportunityStatus;
  createdAt: string;
  statusChangedAt: string;
  appliedDate?: string;
  materials: OpportunityMaterials;
  contact?: OpportunityContact;
  nextAction: OpportunityNextAction;
}

/** Legacy persisted shape; only migration code should consume this after conversion. */
export interface ApplicationRow {
  /** Stable across the Stage 03 -> Stage 05 ownership transfer. */
  id: string;
  role: string;
  roleDetail: string;
  stage: OpportunityStatus;
  stageClass: string;
  materials: string;
  materialsDetail: string;
  contact: string;
  contactDetail: string;
  nextAction: string;
  nextActionDetail: string;
  /** Where clicking the next action takes the user. */
  nextActionView?: View;
  /** Optional document the detail line links to (opens in a new tab). */
  nextActionDetailHref?: string;
  due: string;
}
