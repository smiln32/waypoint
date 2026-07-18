export type View =
  | "dashboard"
  | "resume"
  | "coverletter"
  | "search"
  | "jobs"
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

export type SavedJobStatus = "Saved" | "Researching" | "Ready to apply";

export interface SavedJob {
  id: string;
  title: string;
  company: string;
  place: string;
  pay?: string;
  /** Fit score as a bare number string, e.g. "88". */
  fit: string;
  tags: string[];
  /** Qualification to address before applying, when known. */
  gap?: string;
  status: SavedJobStatus;
}

export interface ApplicationRow {
  role: string;
  roleDetail: string;
  stage: string;
  stageClass: string;
  materials: string;
  materialsDetail: string;
  contact: string;
  contactDetail: string;
  nextAction: string;
  nextActionDetail: string;
  due: string;
}
