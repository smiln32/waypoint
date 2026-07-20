import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../app/api/jobs/route";
import {
  isOpportunityRecord,
  isPersistedOpportunityState,
  migrateLegacyOpportunities,
  resolveOpportunityState,
} from "../lib/opportunity-migration";
import {
  deterministicIdFromParts,
  jobTrackingButtonFor,
  jobTrackingStateFor,
  opportunityMatchesJob,
  startApplicationRecord,
  toggleTrackedJobRecords,
} from "../lib/opportunities";
import { partitionOpportunityStageOutputs } from "../lib/stage-outputs";
import type { JobResult, OpportunityRecord, OpportunityStatus } from "../lib/types";

const NOW = "2026-07-18T20:00:00.000Z";

function record(overrides: Partial<OpportunityRecord> = {}): OpportunityRecord {
  return {
    id: "opportunity-1",
    company: "AeroNorth Systems",
    role: "Technical Operations Manager",
    location: "Jacksonville, FL · Hybrid",
    source: "job-search",
    sourceId: "sample:posting-1",
    status: "Saved",
    createdAt: NOW,
    statusChangedAt: NOW,
    materials: { resume: "Resume v1", coverLetter: "Not started" },
    nextAction: { kind: "review-resume", label: "Review resume" },
    ...overrides,
  };
}

function job(overrides: Partial<JobResult> = {}): JobResult {
  return {
    id: "posting-1",
    source: "sample",
    title: "Technical Operations Manager",
    company: "AeroNorth Systems",
    place: "Jacksonville, FL · Hybrid",
    pay: "$90,000–$110,000",
    age: "Posted today",
    type: "Full-time",
    apply: "Company site",
    fit: "88% fit",
    ...overrides,
  };
}

describe("opportunity record validation", () => {
  it("accepts canonical records and a valid empty v2 state", () => {
    expect(isOpportunityRecord(record())).toBe(true);
    expect(isPersistedOpportunityState({ version: 2, records: [] })).toBe(true);
    expect(isPersistedOpportunityState({ version: 2, records: [record()] })).toBe(true);
  });

  it.each([
    ["missing source", { source: undefined }],
    ["blank source ID", { sourceId: "" }],
    ["invalid status", { status: "Draft" }],
    ["invalid created timestamp", { createdAt: "2026-07-18" }],
    ["invalid status timestamp", { statusChangedAt: "not-a-date" }],
    ["invalid applied date", { appliedDate: "2026-02-30" }],
    ["malformed materials", { materials: { resume: "Resume v1" } }],
    ["malformed contact", { contact: { name: "" } }],
    ["invalid contact date", { contact: { name: "Alex", lastContactDate: "tomorrow" } }],
    ["invalid action kind", { nextAction: { kind: "email", label: "Email" } }],
    ["blank action label", { nextAction: { kind: "custom", label: " " } }],
    ["invalid action date", { nextAction: { kind: "custom", label: "Call", dueDate: "2026-13-01" } }],
  ])("rejects %s", (_label, overrides) => {
    expect(isOpportunityRecord({ ...record(), ...overrides })).toBe(false);
  });
});

describe("legacy migration", () => {
  const legacy = [{
    id: "legacy-1",
    role: "Technical Operations Manager",
    roleDetail: "AeroNorth Systems · Saved from Job Search · Jul 18",
    stage: "Saved",
    materials: "Resume not tailored yet",
    materialsDetail: "Cover letter not started",
    contact: "No contact",
    contactDetail: "Jacksonville, FL · Hybrid",
    nextAction: "Review resume",
    nextActionDetail: "Saved from Job Search",
    nextActionView: "resume",
  }];

  it("migrates once, identifies Job Search origin, and remains idempotent", () => {
    const now = new Date(NOW);
    const first = resolveOpportunityState(undefined, legacy, [], now);
    expect(first.source).toBe("legacy");
    expect(first.shouldPersist).toBe(true);
    expect(first.state.records).toHaveLength(1);
    expect(first.state.records[0]).toMatchObject({ id: "legacy-1", source: "job-search" });
    expect(first.state.records[0].sourceId).toBeUndefined();

    const second = resolveOpportunityState(first.state, legacy, [], now);
    expect(second).toEqual({ state: first.state, shouldPersist: false, source: "current" });
    expect(migrateLegacyOpportunities([...legacy, ...legacy], now)).toHaveLength(1);
  });

  it("preserves a valid explicit empty state instead of restoring demos", () => {
    const empty = { version: 2 as const, records: [] };
    expect(resolveOpportunityState(empty, legacy, [record()], new Date(NOW))).toEqual({
      state: empty,
      shouldPersist: false,
      source: "current",
    });
  });
});

describe("Job Search identity and tracking", () => {
  it.each([
    ["not-tracked", "Save", false],
    ["saved", "Saved", false],
    ["tracked", "Tracked", true],
  ] as const)("maps %s to the expected button state", (state, label, disabled) => {
    expect(jobTrackingButtonFor(state)).toMatchObject({ label, disabled });
  });

  it("saves and unsaves only an exactly Saved posting", () => {
    const saved = toggleTrackedJobRecords([], job(), NOW, "new-id");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ id: "new-id", sourceId: "sample:posting-1", status: "Saved" });
    expect(jobTrackingStateFor(saved, job())).toBe("saved");
    expect(toggleTrackedJobRecords(saved, job(), NOW, "unused")).toEqual([]);
  });

  const progressed: OpportunityStatus[] = [
    "Researching", "Preparing", "Ready to Apply", "Application Started", "Applied",
    "Screening", "Interview", "Offer", "Closed",
  ];
  it.each(progressed)("does not delete a %s opportunity", (status) => {
    const records = [record({ status })];
    expect(jobTrackingStateFor(records, job())).toBe("tracked");
    expect(toggleTrackedJobRecords(records, job(), NOW, "unused")).toBe(records);
  });

  it("keeps same-title postings with different source IDs independent", () => {
    const first = record({ sourceId: "sample:posting-1" });
    const secondJob = job({ id: "posting-2" });
    expect(opportunityMatchesJob(first, secondJob)).toBe(false);
    expect(jobTrackingStateFor([first], secondJob)).toBe("not-tracked");
  });

  it("uses normalized field fallback only for legacy Job Search records without sourceId", () => {
    const legacy = record({ source: "job-search", sourceId: undefined });
    expect(opportunityMatchesJob(legacy, job({ company: " aeronorth systems ", title: "TECHNICAL OPERATIONS MANAGER" }))).toBe(true);
    expect(opportunityMatchesJob({ ...legacy, source: "manual" }, job())).toBe(false);
    expect(opportunityMatchesJob({ ...legacy, sourceId: "sample:different" }, job())).toBe(false);
  });
});

describe("stage ownership and application transitions", () => {
  it("keeps Stage 03 and Stage 05 mutually exclusive for every status", () => {
    const statuses: OpportunityStatus[] = [
      "Saved", "Researching", "Preparing", "Ready to Apply", "Application Started",
      "Applied", "Screening", "Interview", "Offer", "Closed",
    ];
    const outputs = partitionOpportunityStageOutputs(
      statuses.map((status, index) => record({ id: `record-${index}`, status })),
    );
    const trackedIds = new Set(outputs.trackedRoles.map(({ id }) => id));
    expect(outputs.applications.every(({ id }) => !trackedIds.has(id))).toBe(true);
    expect(outputs.trackedRoles).toHaveLength(4);
    expect(outputs.applications).toHaveLength(6);
  });

  it("starts an application without changing record identity", () => {
    const original = record({ status: "Ready to Apply" });
    const [updated] = startApplicationRecord([original], original.id, "2026-07-19T00:00:00.000Z");
    expect(updated.id).toBe(original.id);
    expect(updated.status).toBe("Application Started");
    expect(updated.statusChangedAt).toBe("2026-07-19T00:00:00.000Z");
  });
});

describe("USAJOBS fallback identity", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function upstreamUrl(query = "") {
    vi.stubEnv("USAJOBS_API_KEY", "test-key");
    vi.stubEnv("USAJOBS_EMAIL", "test@example.com");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      SearchResult: { SearchResultItems: [] },
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await GET(new Request(`http://localhost/api/jobs${query}`));
    return new URL(String(fetchMock.mock.calls[0][0]));
  }

  it("omits all optional filters by default", async () => {
    const url = await upstreamUrl("?q=operations&loc=Norfolk%2C%20VA");
    expect(url.searchParams.get("Keyword")).toBe("operations");
    expect(url.searchParams.get("LocationName")).toBe("Norfolk, VA");
    expect(url.searchParams.get("ResultsPerPage")).toBe("10");
    expect(url.searchParams.has("DatePosted")).toBe(false);
    expect(url.searchParams.has("PositionScheduleTypeCode")).toBe(false);
    expect(url.searchParams.has("RemunerationMinimumAmount")).toBe(false);
    expect(url.searchParams.has("Radius")).toBe(false);
  });

  it.each([
    ["datePosted=7", "DatePosted", "7"],
    ["schedule=1", "PositionScheduleTypeCode", "1"],
    ["schedule=2", "PositionScheduleTypeCode", "2"],
    ["minimumSalary=75000", "RemunerationMinimumAmount", "75000"],
    ["radius=50", "Radius", "50"],
  ])("maps %s to %s=%s", async (filter, parameter, expected) => {
    const url = await upstreamUrl(`?loc=Norfolk%2C%20VA&${filter}`);
    expect(url.searchParams.get(parameter)).toBe(expected);
  });

  it("omits Radius without a location", async () => {
    const url = await upstreamUrl("?radius=50");
    expect(url.searchParams.has("Radius")).toBe(false);
  });

  it("does not forward unsupported filter values", async () => {
    const url = await upstreamUrl(
      "?loc=Norfolk&datePosted=2&schedule=9&minimumSalary=99999&radius=500",
    );
    expect(url.searchParams.has("DatePosted")).toBe(false);
    expect(url.searchParams.has("PositionScheduleTypeCode")).toBe(false);
    expect(url.searchParams.has("RemunerationMinimumAmount")).toBe(false);
    expect(url.searchParams.has("Radius")).toBe(false);
  });
  it("returns the same deterministic ID when USAJOBS omits posting IDs", async () => {
    vi.stubEnv("USAJOBS_API_KEY", "test-key");
    vi.stubEnv("USAJOBS_EMAIL", "test@example.com");
    const payload = {
      SearchResult: { SearchResultItems: [{ MatchedObjectDescriptor: {
        PositionTitle: "Operations Manager",
        OrganizationName: "Department of Testing",
        PositionLocationDisplay: "Norfolk, VA",
        PublicationStartDate: "2026-07-18T00:00:00Z",
      } }] },
    };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));

    const first = await (await GET(new Request("http://localhost/api/jobs?q=operations"))).json();
    const second = await (await GET(new Request("http://localhost/api/jobs?q=operations"))).json();
    const expected = deterministicIdFromParts(
      "Operations Manager", "Department of Testing", "Norfolk, VA", "2026-07-18T00:00:00Z",
    );
    expect(first.results[0].id).toBe(expected);
    expect(second.results[0].id).toBe(expected);
  });

  it("maps only an official USAJOBS posting URL", async () => {
    vi.stubEnv("USAJOBS_API_KEY", "test-key");
    vi.stubEnv("USAJOBS_EMAIL", "test@example.com");
    const payload = {
      SearchResult: { SearchResultItems: [{ MatchedObjectDescriptor: {
        PositionID: "posting-1",
        PositionTitle: "Operations Manager",
        PositionURI: "https://www.usajobs.gov/job/123456789",
      } }] },
    };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));

    const response = await (await GET(new Request("http://localhost/api/jobs?q=operations"))).json();
    expect(response.results[0].url).toBe("https://www.usajobs.gov/job/123456789");
  });

  it("omits a posting URL when USAJOBS does not return one", async () => {
    vi.stubEnv("USAJOBS_API_KEY", "test-key");
    vi.stubEnv("USAJOBS_EMAIL", "test@example.com");
    const payload = {
      SearchResult: { SearchResultItems: [{ MatchedObjectDescriptor: {
        PositionID: "posting-1",
        PositionTitle: "Operations Manager",
      } }] },
    };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));

    const response = await (await GET(new Request("http://localhost/api/jobs?q=operations"))).json();
    expect(response.results[0]).not.toHaveProperty("url");
  });

  it("returns an explicit error instead of samples when credentials are missing", async () => {
    vi.stubEnv("USAJOBS_API_KEY", "");
    vi.stubEnv("USAJOBS_EMAIL", "");
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await GET(new Request("http://localhost/api/jobs?q=operations"));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ source: "error", message: "Live USAJOBS search is not configured." });
    expect(body).not.toHaveProperty("results");
    expect(log).toHaveBeenCalledWith("[USAJOBS] Live search is not configured.");
  });

  it.each([401, 403, 500])("returns a sanitized error instead of samples for USAJOBS %s", async (status) => {
    const key = "secret-api-key";
    const email = "private@example.com";
    vi.stubEnv("USAJOBS_API_KEY", key);
    vi.stubEnv("USAJOBS_EMAIL", email);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      `Rejected ${key} for ${email}`,
      { status },
    )));
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await GET(new Request("http://localhost/api/jobs?q=operations"));
    const body = await response.json();
    const logged = log.mock.calls.flat().join(" ");
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(502);
    expect(body).toEqual({ source: "error", message: "Live USAJOBS search is temporarily unavailable." });
    expect(body).not.toHaveProperty("results");
    expect(logged).toContain(`status=${status}`);
    expect(logged).toContain("Rejected [redacted] for [redacted]");
    expect(logged).not.toContain(key);
    expect(logged).not.toContain(email);
    expect(serialized).not.toContain(key);
    expect(serialized).not.toContain(email);
  });

  it("returns a sanitized error instead of samples for network failures", async () => {
    const key = "secret-api-key";
    const email = "private@example.com";
    vi.stubEnv("USAJOBS_API_KEY", key);
    vi.stubEnv("USAJOBS_EMAIL", email);
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error(`Connection failed for ${key} and ${email}`);
    }));
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await GET(new Request("http://localhost/api/jobs?q=operations"));
    const body = await response.json();
    const logged = log.mock.calls.flat().join(" ");
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(502);
    expect(body.source).toBe("error");
    expect(body).not.toHaveProperty("results");
    expect(logged).toContain("Request failed: Connection failed for [redacted] and [redacted]");
    expect(logged).not.toContain(key);
    expect(logged).not.toContain(email);
    expect(serialized).not.toContain(key);
    expect(serialized).not.toContain(email);
  });

  it("keeps successful USAJOBS responses live and unsampled", async () => {
    vi.stubEnv("USAJOBS_API_KEY", "test-key");
    vi.stubEnv("USAJOBS_EMAIL", "test@example.com");
    const payload = {
      SearchResult: { SearchResultItems: [{ MatchedObjectId: "live-1", MatchedObjectDescriptor: {
        PositionTitle: "Logistics Management Specialist",
        OrganizationName: "Department of Testing",
        PositionLocationDisplay: "Norfolk, VA",
        PositionURI: "https://www.usajobs.gov/job/987654321",
      } }] },
    };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));

    const response = await GET(new Request("http://localhost/api/jobs?q=logistics"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("usajobs");
    expect(body.results).toHaveLength(1);
    expect(body.results[0]).toMatchObject({
      id: "live-1",
      source: "usajobs",
      title: "Logistics Management Specialist",
      fit: "",
      url: "https://www.usajobs.gov/job/987654321",
    });
  });
});
