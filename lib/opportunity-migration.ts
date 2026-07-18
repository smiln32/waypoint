import { deterministicIdFromParts } from "./opportunities";
import type {
  NextActionKind,
  OpportunityContact,
  OpportunityRecord,
  OpportunityStatus,
  PersistedOpportunityState,
  View,
} from "./types";

export const OPPORTUNITY_STORAGE_KEY = "waypoint.opportunities.v2";
export const LEGACY_APPLICATION_STORAGE_KEY = "waypoint.applications";
export const OPPORTUNITY_SCHEMA_VERSION = 2 as const;

interface LegacyApplicationRow {
  id?: unknown;
  role?: unknown;
  roleDetail?: unknown;
  stage?: unknown;
  stageClass?: unknown;
  materials?: unknown;
  materialsDetail?: unknown;
  contact?: unknown;
  contactDetail?: unknown;
  nextAction?: unknown;
  nextActionDetail?: unknown;
  nextActionView?: unknown;
  nextActionDetailHref?: unknown;
  due?: unknown;
}

const STATUSES: OpportunityStatus[] = [
  "Saved", "Researching", "Preparing", "Ready to Apply", "Application Started",
  "Applied", "Screening", "Interview", "Offer", "Closed",
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";
const optionalText = (value: unknown): string | undefined => text(value) || undefined;

export function parseLegacyDate(value: unknown, now = new Date()): string | undefined {
  const raw = text(value);
  if (!raw || raw === "—" || raw === "-") return undefined;
  const iso = raw.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  const match = raw.match(/\b([A-Z][a-z]{2})\s+(\d{1,2})\b/);
  if (!match) return undefined;
  const month = MONTHS.indexOf(match[1]);
  const day = Number(match[2]);
  if (month < 0 || day < 1 || day > 31) return undefined;

  // Choose the closest valid occurrence within one year of migration time.
  const candidates = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]
    .map((year) => new Date(year, month, day))
    .filter((date) => date.getMonth() === month && date.getDate() === day);
  const closest = candidates.sort((a, b) => Math.abs(a.getTime() - now.getTime()) - Math.abs(b.getTime() - now.getTime()))[0];
  if (!closest) return undefined;
  const year = closest.getFullYear();
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isStatus(value: unknown): value is OpportunityStatus {
  return typeof value === "string" && STATUSES.includes(value as OpportunityStatus);
}

function actionKindFromLegacy(view: unknown, label: string): NextActionKind {
  const target = text(view) as View;
  if (target === "resume") return "review-resume";
  if (target === "coverletter") return "write-cover-letter";
  if (target === "interview") return "practice-interview";
  if (/follow.?up/i.test(label)) return "follow-up";
  if (/research/i.test(label)) return "research";
  return "custom";
}

function looksLikeLocation(value: string): boolean {
  return /\b(remote|hybrid|on-site)\b/i.test(value) || /,\s*[A-Z]{2}\b/.test(value);
}

function legacyCompany(roleDetail: string): string {
  return roleDetail.split(/\s+[·|]\s+/)[0]?.trim() || "Unknown company";
}

function legacyContact(nameValue: unknown, detailValue: unknown): { contact?: OpportunityContact; location?: string } {
  const name = text(nameValue);
  const detail = text(detailValue);
  const placeholder = !name || /^(no contact|none|n\/a)/i.test(name);
  if (looksLikeLocation(detail)) {
    return { location: detail, contact: placeholder ? undefined : { name } };
  }
  if (placeholder && !detail) return {};
  if (placeholder && /^(no direct contact|none|n\/a)/i.test(detail)) return {};
  return {
    contact: {
      name: placeholder ? "Recruiting team" : name,
      ...(detail ? { relationship: detail } : {}),
    },
  };
}

export function isOpportunityRecord(value: unknown): value is OpportunityRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<OpportunityRecord>;
  return Boolean(
    text(record.id) && text(record.company) && text(record.role) && isStatus(record.status)
    && /T/.test(text(record.createdAt)) && /T/.test(text(record.statusChangedAt))
    && record.materials && typeof record.materials.resume === "string" && typeof record.materials.coverLetter === "string"
    && record.nextAction && typeof record.nextAction.label === "string" && typeof record.nextAction.kind === "string",
  );
}

export function isPersistedOpportunityState(value: unknown): value is PersistedOpportunityState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<PersistedOpportunityState>;
  return state.version === OPPORTUNITY_SCHEMA_VERSION
    && Array.isArray(state.records)
    && state.records.every(isOpportunityRecord);
}

export function migrateLegacyOpportunity(value: unknown, now = new Date()): OpportunityRecord | null {
  if (isOpportunityRecord(value)) return value;
  if (!value || typeof value !== "object") return null;
  const legacy = value as LegacyApplicationRow;
  const role = text(legacy.role);
  if (!role) return null;
  const roleDetail = text(legacy.roleDetail);
  const company = legacyCompany(roleDetail);
  const status = isStatus(legacy.stage) ? legacy.stage : "Saved";
  const detailDate = parseLegacyDate(roleDetail, now);
  const timestamp = detailDate ? `${detailDate}T12:00:00.000Z` : now.toISOString();
  const { contact, location } = legacyContact(legacy.contact, legacy.contactDetail);
  const label = text(legacy.nextAction) || "Research the role and company";
  const dueDate = parseLegacyDate(legacy.due, now);
  const appliedDate = ["Application Started", "Applied", "Screening", "Interview", "Offer", "Closed"].includes(status)
    ? detailDate
    : undefined;
  const id = text(legacy.id) || deterministicIdFromParts(company, role, timestamp);

  return {
    id,
    company,
    role,
    ...(location ? { location } : {}),
    source: id.startsWith("demo-") ? "demo" : "manual",
    status,
    createdAt: timestamp,
    statusChangedAt: timestamp,
    ...(appliedDate ? { appliedDate } : {}),
    materials: {
      resume: text(legacy.materials) || "Resume not tailored yet",
      coverLetter: text(legacy.materialsDetail) || "Cover letter not started",
    },
    ...(contact ? { contact } : {}),
    nextAction: {
      kind: actionKindFromLegacy(legacy.nextActionView, label),
      label,
      ...(optionalText(legacy.nextActionDetail) ? { detail: optionalText(legacy.nextActionDetail) } : {}),
      ...(dueDate ? { dueDate } : {}),
    },
  };
}

export function migrateLegacyOpportunities(value: unknown, now = new Date()): OpportunityRecord[] {
  if (!Array.isArray(value)) return [];
  const records = value.map((row) => migrateLegacyOpportunity(row, now)).filter((row): row is OpportunityRecord => Boolean(row));
  return [...new Map(records.map((record) => [record.id, record])).values()];
}

export function resolveOpportunityState(
  currentValue: unknown,
  legacyValue: unknown,
  demoRecords: OpportunityRecord[],
  now = new Date(),
): { state: PersistedOpportunityState; shouldPersist: boolean; source: "current" | "legacy" | "demo" } {
  if (isPersistedOpportunityState(currentValue)) {
    return { state: currentValue, shouldPersist: false, source: "current" };
  }
  if (Array.isArray(legacyValue)) {
    return {
      state: { version: OPPORTUNITY_SCHEMA_VERSION, records: migrateLegacyOpportunities(legacyValue, now) },
      shouldPersist: true,
      source: "legacy",
    };
  }
  return {
    state: { version: OPPORTUNITY_SCHEMA_VERSION, records: demoRecords },
    shouldPersist: true,
    source: "demo",
  };
}
