import { NextResponse } from "next/server";
import { searchResults } from "@/lib/demo-data";
import type { JobResult } from "@/lib/types";

/**
 * Job search backed by the USAJOBS API (free key: developer.usajobs.gov).
 * Federal hiring carries veterans' preference, making it the natural first
 * live board for Waypoint. Without credentials (or on any failure) the
 * route returns the labeled sample set — resilience, not a mode.
 */

interface UsaJobsRemuneration {
  MinimumRange?: string;
  MaximumRange?: string;
  RateIntervalCode?: string;
}

interface UsaJobsDescriptor {
  PositionTitle?: string;
  OrganizationName?: string;
  PositionLocationDisplay?: string;
  PublicationStartDate?: string;
  PositionRemuneration?: UsaJobsRemuneration[];
  PositionSchedule?: { Name?: string }[];
}

interface UsaJobsPayload {
  SearchResult?: { SearchResultItems?: { MatchedObjectDescriptor?: UsaJobsDescriptor }[] };
}

function formatPay(pay?: UsaJobsRemuneration): string {
  if (!pay?.MinimumRange || !pay?.MaximumRange) return "";
  const min = Math.round(Number(pay.MinimumRange)).toLocaleString("en-US");
  const max = Math.round(Number(pay.MaximumRange)).toLocaleString("en-US");
  const perHour = pay.RateIntervalCode === "PH" ? "/hr" : "";
  return `$${min}–$${max}${perHour}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("q")?.trim() ?? "";
  const location = searchParams.get("loc")?.trim() ?? "";
  const key = process.env.USAJOBS_API_KEY;
  const email = process.env.USAJOBS_EMAIL;

  if (!key || !email) {
    return NextResponse.json({ source: "sample", results: searchResults });
  }

  try {
    const url = new URL("https://data.usajobs.gov/api/search");
    if (keyword) url.searchParams.set("Keyword", keyword);
    if (location) url.searchParams.set("LocationName", location);
    url.searchParams.set("ResultsPerPage", "10");
    const response = await fetch(url, {
      headers: { "Authorization-Key": key, "User-Agent": email },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`USAJOBS ${response.status}`);
    const payload = (await response.json()) as UsaJobsPayload;
    const items = payload.SearchResult?.SearchResultItems ?? [];
    const results: JobResult[] = items
      .map((item) => item.MatchedObjectDescriptor)
      .filter((descriptor): descriptor is UsaJobsDescriptor => Boolean(descriptor?.PositionTitle))
      .map((descriptor) => ({
        title: descriptor.PositionTitle ?? "",
        company: descriptor.OrganizationName ?? "U.S. Federal Government",
        place: descriptor.PositionLocationDisplay ?? "",
        pay: formatPay(descriptor.PositionRemuneration?.[0]),
        age: descriptor.PublicationStartDate
          ? "Posted " +
            new Date(descriptor.PublicationStartDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "",
        type: descriptor.PositionSchedule?.[0]?.Name ?? "Full-time",
        apply: "USAJOBS.gov",
        fit: "",
      }));
    if (!results.length) return NextResponse.json({ source: "usajobs", results: [] });
    return NextResponse.json({ source: "usajobs", results });
  } catch {
    return NextResponse.json({ source: "sample", results: searchResults });
  }
}
