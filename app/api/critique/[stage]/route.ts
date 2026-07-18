import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { fallbackCritique } from "@/lib/critique/fallback";
import { critiqueSchema } from "@/lib/critique/schema";
import { buildSystemPrompt, writeRunOutput } from "@/lib/icm.server";
import type { CritiqueResponse, CritiqueStage, Finding } from "@/lib/types";

const STAGES: CritiqueStage[] = ["resume", "cover-letter", "interview"];

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

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(fallbackCritique(stage, text));
  }

  try {
    const client = new Anthropic();
    const model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
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
    const parsed = JSON.parse(textBlock.text) as { findings: Finding[]; note: string; scores?: CritiqueResponse["scores"] };
    if (!Array.isArray(parsed.findings) || typeof parsed.note !== "string") {
      return NextResponse.json(fallbackCritique(stage, text));
    }
    const result: CritiqueResponse = { source: "claude", ...parsed };
    writeRunOutput(stage, model, text, result);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(fallbackCritique(stage, text));
  }
}
