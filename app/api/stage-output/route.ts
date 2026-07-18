import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { ApplicationRow } from "@/lib/types";

/**
 * Materialize the tracker's state as ICM Layer 4 artifacts, so the stage
 * handoffs declared in the CONTEXT contracts exist as diffable files:
 *   02_job_search/output/saved-roles.json     — roles saved from search
 *   03_job_tracking/output/tracked-roles.json — pre-application pipeline
 *   05_applications/output/applications.json  — every tracked record
 * Dev-only and best-effort, like every other output write.
 */

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ written: false });
  }

  let body: { applications?: ApplicationRow[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const applications = body.applications;
  if (!Array.isArray(applications)) {
    return NextResponse.json({ error: "applications must be an array" }, { status: 400 });
  }

  const snapshot = (rows: ApplicationRow[]) => JSON.stringify({ updated_at: new Date().toISOString(), rows }, null, 2) + "\n";
  const write = (stage: string, file: string, rows: ApplicationRow[]) => {
    fs.writeFileSync(path.join(process.cwd(), "stages", stage, "output", file), snapshot(rows), "utf8");
  };

  try {
    write("02_job_search", "saved-roles.json", applications.filter((row) => row.stage === "Saved"));
    write(
      "03_job_tracking",
      "tracked-roles.json",
      applications.filter((row) => row.stage === "Saved" || row.stage === "Preparing"),
    );
    write("05_applications", "applications.json", applications);
    return NextResponse.json({ written: true });
  } catch {
    return NextResponse.json({ written: false });
  }
}
