import type {
  JobResult,
  NextActionKind,
  OpportunityRecord,
  OpportunityStatus,
  View,
} from "./types";

const SAVED_STATUSES: OpportunityStatus[] = ["Saved", "Researching", "Preparing", "Ready to Apply"];
const APPLIED_STATUSES: OpportunityStatus[] = ["Application Started", "Applied", "Screening"];

export function statusClassFor(status: OpportunityStatus): string {
  if (SAVED_STATUSES.includes(status)) return "saved-stage";
  if (APPLIED_STATUSES.includes(status)) return "applied-stage";
  if (status === "Interview" || status === "Offer") return "interview-stage";
  return "saved-stage";
}

export function formatFriendlyDate(isoDate?: string): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dateOnly(timestamp: string): string {
  return timestamp.slice(0, 10);
}

export function formatOpportunityDetail(record: OpportunityRecord): string {
  const lifecycle = record.status === "Application Started"
    ? "Application started"
    : record.status === "Saved"
      ? record.source === "manual" ? "Added" : "Saved"
      : record.status;
  const date = record.appliedDate
    ?? (record.status === "Saved" ? dateOnly(record.createdAt) : dateOnly(record.statusChangedAt));
  const friendly = formatFriendlyDate(date);
  return `${record.company} · ${lifecycle}${friendly ? ` ${friendly}` : ""}`;
}

export function nextActionViewFor(kind: NextActionKind): View | undefined {
  if (kind === "review-resume") return "resume";
  if (kind === "write-cover-letter") return "coverletter";
  if (kind === "practice-interview") return "interview";
  return undefined;
}

export function jobIdentity(job: JobResult): string {
  return `${job.source}:${job.id}`;
}

export function deterministicIdFromParts(...parts: string[]): string {
  const input = parts.map((part) => part.trim().toLowerCase()).join("|");
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `job-${(hash >>> 0).toString(36)}`;
}
