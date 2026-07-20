/**
 * Versioned contract for the seeded résumé sample. Bump the id whenever the
 * seeded James Carter résumé (or its findings/decisions) changes, so browsers
 * holding an older saved sample fall back to the current one instead of
 * restoring stale content over it.
 */
export const RESUME_SAMPLE_ID = "james-carter-maintenance-v2";

/**
 * Whether a persisted résumé should be restored on load.
 *
 * - Live-AI mode: the saved résumé is the user's own upload — always restore it,
 *   never discard it over a sample-version mismatch.
 * - Sample mode: only restore state that belongs to the current seeded sample.
 *   A missing or older `sampleId` means the saved value predates this sample and
 *   must be discarded so the current James Carter résumé is shown instead.
 */
export function shouldRestoreResume(
  saved: { sampleId?: string } | null | undefined,
  liveAiEnabled: boolean,
): boolean {
  if (!saved) return false;
  if (liveAiEnabled) return true;
  return saved.sampleId === RESUME_SAMPLE_ID;
}
