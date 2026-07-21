import { describe, expect, it } from "vitest";
import { resumeFallback } from "../lib/critique/fallback";
import {
  RESUME_SAMPLE_ID,
  savedResumeOrigin,
  shouldRestoreResume,
} from "../lib/resume-sample";

describe("demo résumé persistence origin", () => {
  it("restores an explicitly user-imported résumé in demo mode", () => {
    expect(shouldRestoreResume({ origin: "user" }, false)).toBe(true);
    expect(savedResumeOrigin({ origin: "user" }, false)).toBe("user");
  });

  it("restores only the current seeded sample in demo mode", () => {
    expect(
      shouldRestoreResume(
        { origin: "sample", sampleId: RESUME_SAMPLE_ID },
        false,
      ),
    ).toBe(true);
    expect(
      shouldRestoreResume(
        { origin: "sample", sampleId: "james-carter-maintenance-v1" },
        false,
      ),
    ).toBe(false);
  });

  it("keeps legacy live-mode user documents restorable", () => {
    expect(shouldRestoreResume({}, true)).toBe(true);
    expect(savedResumeOrigin({}, true)).toBe("user");
  });

  it("treats an untagged legacy demo value as stale sample state", () => {
    expect(shouldRestoreResume({}, false)).toBe(false);
    expect(savedResumeOrigin({}, false)).toBe("sample");
  });
});

describe("limited demo résumé review language", () => {
  it("does not claim a clean résumé when no deterministic pattern matches", () => {
    const result = resumeFallback(
      "Experienced maintenance professional seeking a civilian operations role.",
    );

    expect(result.source).toBe("demo");
    expect(result.findings).toEqual([]);
    expect(result.note).toBe(
      "Limited sample review complete: no findings from this limited review set.",
    );
  });

  it("labels matched deterministic findings as a limited sample review", () => {
    const result = resumeFallback(
      "Known for reliability, discipline, and strong leadership.",
    );

    expect(result.findings).toHaveLength(1);
    expect(result.note).toContain("Limited sample review complete");
  });
});
