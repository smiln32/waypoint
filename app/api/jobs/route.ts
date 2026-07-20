import { NextResponse } from "next/server";
import { searchResults } from "@/lib/demo-data";
import { deterministicIdFromParts } from "@/lib/opportunities";
import type { JobResult } from "@/lib/types";

/**
 * Job search backed by the USAJOBS API (free key: developer.usajobs.gov).
 * Federal hiring carries veterans' preference, making it the natural first
 * live board for Waypoint. Deployed environments expose upstream failures;
 * labeled samples require an explicit local-development switch.
 */
interface UsaJobsRemuneration {
  MinimumRange?: string;
  MaximumRange?: string;
  RateIntervalCode?: string;
}

interface UsaJobsDescriptor {
  PositionID?: string;
  PositionURI?: string;
  PositionTitle?: string;
  OrganizationName?: string;
  PositionLocationDisplay?: string;
  PublicationStartDate?: string;
  PositionRemuneration?: UsaJobsRemuneration[];
  PositionSchedule?: { Name?: string }[];
}

interface UsaJobsItem {
  MatchedObjectId?: string;
  MatchedObjectDescriptor?: UsaJobsDescriptor;
}

interface UsaJobsPayload {
  SearchResult?: { SearchResultItems?: UsaJobsItem[] };
}

const allowedFilters = {
  datePosted: new Set(["", "1", "7", "30"]),
  schedule: new Set(["", "1", "2"]),
  minimumSalary: new Set(["", "50000", "75000", "100000", "125000"]),
  radius: new Set(["", "25", "50", "75", "100"]),
} as const;

function allowedValue(searchParams: URLSearchParams, name: keyof typeof allowedFilters): string {
  const value = searchParams.get(name)?.trim() ?? "";
  return allowedFilters[name].has(value) ? value : "";
}
function formatPay(pay?: UsaJobsRemuneration): string {
  if (!pay?.MinimumRange || !pay?.MaximumRange) return "";
  const min = Math.round(Number(pay.MinimumRange)).toLocaleString("en-US");
  const max = Math.round(Number(pay.MaximumRange)).toLocaleString("en-US");
  const perHour = pay.RateIntervalCode === "PH" ? "/hr" : "";
  return `$${min}–$${max}${perHour}`;
}

function officialPostingUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:" && (hostname === "usajobs.gov" || hostname.endsWith(".usajobs.gov"))
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

const unavailableMessage = "Live USAJOBS search is temporarily unavailable.";

function sanitize(value: string, secrets: Array<string | undefined>): string {
  const redacted = secrets.reduce<string>(
    (message, secret) => secret ? message.replaceAll(secret, "[redacted]") : message,
    value,
  );
  return redacted.replace(/\s+/g, " ").trim().slice(0, 300);
}

function logUsaJobsError(message: string, key?: string, email?: string) {
  console.error(`[USAJOBS] ${sanitize(message, [key, email])}`);
}

function configurationError() {
  return NextResponse.json(
    { source: "error", message: "Live USAJOBS search is not configured." },
    { status: 503 },
  );
}

function isValidHeaderValue(headerName: string, value: string): boolean {
  // Validate against the same Headers implementation the runtime's fetch uses,
  // so any value fetch would reject is caught here instead of throwing mid-request.
  // A hand-written control-character regex misses whole classes of contamination
  // undici rejects: code points outside the Latin-1 header range (BOM,
  // zero-width space, smart quotes, en/em dashes) copied into a credential.
  try {
    new Headers({ [headerName]: value });
    return true;
  } catch {
    return false;
  }
}

function rejectInvalidHeader(
  name: "USAJOBS_API_KEY" | "USAJOBS_EMAIL",
  headerName: string,
  value: string,
): boolean {
  if (isValidHeaderValue(headerName, value)) return false;
  console.error(`[USAJOBS] Invalid configured header value: ${name} is not a valid HTTP header value.`);
  return true;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("q")?.trim() ?? "";
  const location = searchParams.get("loc")?.trim() ?? "";
  const datePosted = allowedValue(searchParams, "datePosted");
  const schedule = allowedValue(searchParams, "schedule");
  const minimumSalary = allowedValue(searchParams, "minimumSalary");
  const radius = allowedValue(searchParams, "radius");
  const rawKey = process.env.USAJOBS_API_KEY;
  const rawEmail = process.env.USAJOBS_EMAIL;
  const key = rawKey?.trim();
  const email = rawEmail?.trim();
  const useLocalSamples = process.env.NODE_ENV === "development"
    && process.env.WAYPOINT_USE_SAMPLE_JOBS === "true";

  if (useLocalSamples) return NextResponse.json({ source: "sample", results: searchResults });
  if (!key || !email) {
    logUsaJobsError("Live search is not configured.");
    return configurationError();
  }
  if (rejectInvalidHeader("USAJOBS_API_KEY", "Authorization-Key", key)) return configurationError();
  if (rejectInvalidHeader("USAJOBS_EMAIL", "User-Agent", email)) return configurationError();

  try {
    const url = new URL("https://data.usajobs.gov/api/search");
    if (keyword) url.searchParams.set("Keyword", keyword);
    if (location) url.searchParams.set("LocationName", location);
    if (datePosted) url.searchParams.set("DatePosted", datePosted);
    if (schedule) url.searchParams.set("PositionScheduleTypeCode", schedule);
    if (minimumSalary) url.searchParams.set("RemunerationMinimumAmount", minimumSalary);
    if (location && radius) url.searchParams.set("Radius", radius);
    url.searchParams.set("ResultsPerPage", "10");
    const response = await fetch(url, {
      headers: { "Authorization-Key": key, "User-Agent": email },
      cache: "no-store",
    });
    if (!response.ok) {
      const excerpt = sanitize(await response.text(), [key, email]);
      logUsaJobsError(
        `Upstream response status=${response.status} body=${excerpt || "[empty]"}`,
        key,
        email,
      );
      return NextResponse.json(
        { source: "error", message: unavailableMessage },
        { status: 502 },
      );
    }
    const payload = (await response.json()) as UsaJobsPayload;
    const items = payload.SearchResult?.SearchResultItems ?? [];
    const results: JobResult[] = items
      .filter((item) => Boolean(item.MatchedObjectDescriptor?.PositionTitle))
      .map((item) => {
        const descriptor = item.MatchedObjectDescriptor as UsaJobsDescriptor;
        return {
          id: item.MatchedObjectId ?? descriptor.PositionID ?? deterministicIdFromParts(
            descriptor.PositionTitle ?? "",
            descriptor.OrganizationName ?? "",
            descriptor.PositionLocationDisplay ?? "",
            descriptor.PublicationStartDate ?? "",
          ),
          source: "usajobs" as const,
          title: descriptor.PositionTitle ?? "",
          company: descriptor.OrganizationName ?? "U.S. Federal Government",
          place: descriptor.PositionLocationDisplay ?? "",
          pay: formatPay(descriptor.PositionRemuneration?.[0]),
          age: descriptor.PublicationStartDate
            ? "Posted " + new Date(descriptor.PublicationStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "",
          type: descriptor.PositionSchedule?.[0]?.Name ?? "Full-time",
          apply: "USAJOBS.gov",
          fit: "",
          url: officialPostingUrl(descriptor.PositionURI),
        };
      });
    if (!results.length) return NextResponse.json({ source: "usajobs", results: [] });
    return NextResponse.json({ source: "usajobs", results });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    logUsaJobsError(`Request failed: ${detail}`, key, email);
    return NextResponse.json(
      { source: "error", message: unavailableMessage },
      { status: 502 },
    );
  }
}
