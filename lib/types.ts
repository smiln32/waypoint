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
