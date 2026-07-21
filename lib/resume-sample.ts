/**
 * Versioned contract for the seeded résumé sample. Bump the id whenever the
 * seeded James Carter résumé (or its findings/decisions) changes, so browsers
 * holding an older saved sample fall back to the current one instead of
 * restoring stale content over it.
 */
export const RESUME_SAMPLE_ID = "james-carter-maintenance-v2";

export type ResumeOrigin = "sample" | "user";

interface SavedResumeIdentity {
  origin?: ResumeOrigin;
  sampleId?: string;
}

/**
 * Resolve older saved values that predate the explicit origin field.
 *
 * - A saved value with a sample id is a seeded sample.
 * - A legacy value without either field is treated as a user document only in
 *   live-AI mode, preserving the previous live-mode restore behavior.
 * - In sample mode, an untagged legacy value is treated as stale sample state
 *   and is replaced by the current seeded résumé.
 */
export function savedResumeOrigin(
  saved: SavedResumeIdentity,
  liveAiEnabled: boolean,
): ResumeOrigin {
  if (saved.origin === "sample" || saved.origin === "user") return saved.origin;
  if (saved.sampleId) return "sample";
  return liveAiEnabled ? "user" : "sample";
}

/**
 * Whether a persisted résumé should be restored on load.
 *
 * - User-imported documents restore in both sample and live-AI modes.
 * - Seeded samples restore only when their sample id matches the current seed.
 * - Legacy live-AI values retain the old behavior and restore even without an
 *   origin field, because they may be user uploads created before origin was
 *   recorded.
 */
export function shouldRestoreResume(
  saved: SavedResumeIdentity | null | undefined,
  liveAiEnabled: boolean,
): boolean {
  if (!saved) return false;
  if (saved.origin === "user") return true;
  if (saved.origin === "sample") return saved.sampleId === RESUME_SAMPLE_ID;
  if (liveAiEnabled) return true;
  return saved.sampleId === RESUME_SAMPLE_ID;
}
