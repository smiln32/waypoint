import type { CritiqueResponse, CritiqueStage } from "@/lib/types";
import { fallbackCritique } from "./fallback";

/**
 * Ask the editor for a critique. Falls back to the local demo evaluators if
 * the request itself fails, so the editors always resolve.
 */
export async function requestCritique(
  stage: CritiqueStage,
  text: string,
  context?: { role?: string; company?: string; question?: string },
): Promise<CritiqueResponse> {
  try {
    const res = await fetch(`/api/critique/${stage}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, context }),
    });
    if (!res.ok) throw new Error(`Critique request failed: ${res.status}`);
    return (await res.json()) as CritiqueResponse;
  } catch {
    return fallbackCritique(stage, text);
  }
}
