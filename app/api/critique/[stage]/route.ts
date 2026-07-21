import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { fallbackCritique } from "@/lib/critique/fallback";
import { critiqueSchema, validateCritiqueResult } from "@/lib/critique/schema";
import { buildSystemPrompt, writeRunOutput } from "@/lib/icm.server";
import { liveAiEnabled } from "@/lib/live-config";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import type { CritiqueResponse, CritiqueStage, Finding } from "@/lib/types";

const STAGES: CritiqueStage[] = ["resume", "cover-letter", "interview"];

// Server-side input caps: bound token cost/latency and blunt abuse of the live
// AI path. A résumé/letter/response is small; these limits are generous.
const MAX_TEXT_CHARS = 50_000;
const MAX_CONTEXT_CHARS = 2_000;

// Per-IP cap on the cost-incurring live path (best-effort; see lib/rate-limit).
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

interface CritiqueRequestBody {
  text?: string;
  context?: { role?: string; company?: string; question?: string };
}

function buildUserMessage(stage: CritiqueStage, text: string, context: CritiqueRequestBody["context"]): string {
  const parts: string[] = [];
  if (stage === "cover-letter") {
    if (context?.role) parts.push(`Target role: ${context.role}`);
    if (context?.company) parts.push(`Company: ${context.company}`);
    parts.push("Cover letter draft:\n\n" + text);
  } else if (stage === "interview") {
    if (context?.question) parts.push(`Interview question: ${context.question}`);
    if (context?.role) parts.push(`Target role: ${context.role}`);
    parts.push("Practice response:\n\n" + text);
  } else {
    parts.push("Resume draft:\n\n" + text);
  }
  return parts.join("\n");
}

export async function POST(request: Request, { params }: { params: Promise<{ stage: string }> }) {
  const { stage: rawStage } = await params;
  if (!STAGES.includes(rawStage as CritiqueStage)) {
    return NextResponse.json({ error: "Unknown critique stage" }, { status: 404 });
  }
  const stage = rawStage as CritiqueStage;

  let body: CritiqueRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Missing text to evaluate" }, { status: 400 });
  }
  if (text.length > MAX_TEXT_CHARS) {
    return NextResponse.json({ error: "Submitted text is too long." }, { status: 413 });
  }
  if (
    [body.context?.role, body.context?.company, body.context?.question].some(
      (value) => typeof value === "string" && value.length > MAX_CONTEXT_CHARS,
    )
  ) {
    return NextResponse.json({ error: "Context field is too long." }, { status: 413 });
  }

  // Sample-only by default: no external Anthropic request unless the operator
  // has explicitly enabled live AI AND supplied a key. A key alone is never
  // enough, so a public fork that inherits a key still sends nothing outward.
  if (!liveAiEnabled() || !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(fallbackCritique(stage, text));
  }

  // Only the live path spends money, so throttle here — demo users are never
  // limited, and legitimate live use stays well under the cap.
  const limit = rateLimit(`critique:${clientKey(request)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const client = new Anthropic();
    const model = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
    const response = await client.messages.create({
      model,
      max_tokens: 8192,
      thinking: { type: "adaptive" },
      system: buildSystemPrompt(stage),
      output_config: { format: { type: "json_schema", schema: critiqueSchema(stage) } },
      messages: [{ role: "user", content: buildUserMessage(stage, text, body.context) }],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json(fallbackCritique(stage, text));
    }
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(fallbackCritique(stage, text));
    }
    const parsed = JSON.parse(textBlock.text) as { findings: Finding[]; note: string; scores?: CritiqueResponse["scores"]; decisions?: string[] };
    if (!validateCritiqueResult(stage, text, parsed)) {
      return NextResponse.json(fallbackCritique(stage, text));
    }
    const result: CritiqueResponse = { source: "claude", ...parsed };
    writeRunOutput(stage, model, text, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[critique] falling back to demo:", error);
    return NextResponse.json(fallbackCritique(stage, text));
  }
}
