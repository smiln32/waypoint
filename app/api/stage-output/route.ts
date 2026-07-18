import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { OpportunityRecord } from "@/lib/types";
import { APPLICATION_STATUSES, PRE_APPLICATION_STATUSES } from "@/lib/types";
import { isOpportunityRecord } from "@/lib/opportunity-migration";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ written: false });

  let body: { opportunities?: OpportunityRecord[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const opportunities = body.opportunities;
  if (!Array.isArray(opportunities) || !opportunities.every(isOpportunityRecord)) {
    return NextResponse.json({ error: "opportunities must be an array" }, { status: 400 });
  }

  const snapshot = (records: OpportunityRecord[]) => JSON.stringify({ updated_at: new Date().toISOString(), records }, null, 2) + "\n";
  const write = (stage: string, file: string, records: OpportunityRecord[]) => {
    const dir = path.join(process.cwd(), "stages", stage, "output", "runtime");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, file), snapshot(records), "utf8");
  };

  try {
    write(
      "02_job_search",
      "saved-roles.json",
      opportunities.filter((record) => record.source === "job-search" && record.status === "Saved"),
    );
    write(
      "03_job_tracking",
      "tracked-roles.json",
      opportunities.filter((record) => PRE_APPLICATION_STATUSES.includes(record.status)),
    );
    write(
      "05_applications",
      "applications.json",
      opportunities.filter((record) => APPLICATION_STATUSES.includes(record.status)),
    );
    return NextResponse.json({ written: true });
  } catch {
    return NextResponse.json({ written: false });
  }
}
