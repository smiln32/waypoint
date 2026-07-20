/**
 * Opt-in switches for the two features that would otherwise reach an external
 * service. Waypoint ships public (open repo, competition/demo deployments) with
 * both OFF, so the default build performs no live job search and sends no
 * document to an AI provider. Each requires an explicit env flag AND, for the
 * feature to actually run, the operator's own credentials — a key alone is never
 * enough to activate live behavior.
 *
 * Server-only: these read process.env and must not be imported into client
 * components. The value is passed down to client components as a prop.
 */
export function liveAiEnabled(): boolean {
  return process.env.WAYPOINT_ENABLE_LIVE_AI === "true";
}

export function liveJobsEnabled(): boolean {
  return process.env.WAYPOINT_ENABLE_LIVE_JOBS === "true";
}
