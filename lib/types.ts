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
  /** Where clicking the next action takes the user. */
  nextActionView?: View;
  /** Optional document the detail line links to (opens in a new tab). */
  nextActionDetailHref?: string;
  due: string;
}
