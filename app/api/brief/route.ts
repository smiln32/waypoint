import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { briefSlug, type BriefSections, type CompanyBrief } from "@/lib/briefs";
import { liveAiEnabled } from "@/lib/live-config";

/**
 * Generate a pre-interview company brief. The brief writer's rules are ICM
 * stage markdown (stages/03_job_tracking/references/brief-guide.md); runs are
 * written to the stage's output/. Requires the AI editor — briefs are never
 * fabricated from a demo fallback.
 */

const SECTION_SCHEMA = {
  type: "object",
  properties: {
    whoTheyAre: { type: "string" },
    whatTheRoleOwns: { type: "string" },
    whyYourRecordFits: { type: "string" },
    likelyQuestions: { type: "string" },
    honestGap: { type: "string" },
  },
  required: ["whoTheyAre", "whatTheRoleOwns", "whyYourRecordFits", "likelyQuestions", "honestGap"],
  additionalProperties: false,
} as const;

function buildSystemPrompt(): string {
  const read = (...segments: string[]) => fs.readFileSync(path.join(process.cwd(), ...segments), "utf8");
  return [
    read("stages", "03_job_tracking", "CONTEXT.md"),
    read("stages", "03_job_tracking", "references", "brief-guide.md"),
    read("_config", "shared", "product-voice.md"),
    read("stages", "03_job_tracking", "references", "brief-format.md"),
  ].join("\n\n---\n\n");
}

export async function POST(request: Request) {
  // Sample-only by default: no external Anthropic request unless live AI is
  // explicitly enabled AND a key is present. A key alone never activates it.
  if (!liveAiEnabled() || !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Live company briefs are turned off in this demonstration deployment." },
      { status: 503 },
    );
  }

  let body: { company?: string; role?: string; detail?: string; resumeText?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const company = body.company?.trim();
  const role = body.role?.trim();
  if (!company || !role) {
    return NextResponse.json({ error: "company and role are required" }, { status: 400 });
  }
  // Bound token cost/latency and blunt abuse of the live AI path.
  if (
    company.length > 300 ||
    role.length > 300 ||
    (body.detail?.length ?? 0) > 20_000 ||
    (body.resumeText?.length ?? 0) > 50_000
  ) {
    return NextResponse.json({ error: "A request field is too long." }, { status: 413 });
  }

  const userMessage = [
    `Organization: ${company}`,
    `Role: ${role}`,
    body.detail ? `Listing details: ${body.detail}` : "",
    body.resumeText ? `Candidate's current resume:\n\n${body.resumeText}` : "No resume on file — keep the fit section brief and general.",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const client = new Anthropic();
    const model = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: buildSystemPrompt(),
      output_config: { format: { type: "json_schema", schema: SECTION_SCHEMA } },
      messages: [{ role: "user", content: userMessage }],
    });
    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "The brief writer declined this request." }, { status: 502 });
    }
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("no text block");
    const sections = JSON.parse(textBlock.text) as BriefSections;

    const brief: CompanyBrief = {
      slug: briefSlug(company, role),
      company,
      role,
      generatedAt: new Date().toISOString(),
      source: "claude",
      sections,
    };

    // ICM Layer 4: persist the run as a human-editable artifact (dev, best-effort).
    if (process.env.NODE_ENV !== "production") {
      try {
        const file = path.join(process.cwd(), "stages", "03_job_tracking", "output", "runtime", `${brief.slug}-brief.json`);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(brief, null, 2) + "\n", "utf8");
      } catch {
        // Never fail the response over the write.
      }
    }

    return NextResponse.json(brief);
  } catch (error) {
    console.error("[brief] generation failed:", error);
    return NextResponse.json({ error: "Brief generation failed — try again." }, { status: 502 });
  }
}
