import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import type { StoredApplication } from "@/types/domain";

export const runtime = "nodejs";

const applicationSchema = z.object({
  id: z.string().min(1),
  tracking_id: z.string().regex(/^RTI-2026-[A-Z0-9]{6}$/),
  access_code: z.string().min(6).max(8),
  citizen_phone: z.string().regex(/^\d{10}$/),
  raw_grievance: z.string().min(10),
  compliant_request_text: z.string().min(10).max(3000),
  department_id: z.string().min(1),
  risk_flags: z.array(z.object({ clause: z.string(), explanation: z.string(), suggestion: z.string() }).strict()),
  precedents_shown: z.array(z.object({ precedent_id: z.string(), similarity_reason: z.string(), outcome: z.enum(["answered_in_full", "answered_partially", "rejected_with_reason", "transferred"]), outcome_note: z.string() }).strict()),
  requested_records: z.array(z.string()),
  status: z.enum(["submitted", "transferred", "awaiting_reply", "overdue"]),
  created_at: z.string().datetime(),
  days_elapsed_mock: z.number().int().min(0),
  transferred: z.boolean(),
}).strict();

function dataDirectory() {
  if (process.env.NYAYA_SETU_DATA_DIR) return process.env.NYAYA_SETU_DATA_DIR;
  return process.env.VERCEL ? path.join(os.tmpdir(), "nyaya-setu") : path.join(process.cwd(), ".data");
}

export async function POST(request: Request) {
  try {
    const parsed = applicationSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "The prepared application is incomplete. Nothing was stored." }, { status: 400 });
    const directory = dataDirectory();
    const file = path.join(directory, "applications.json");
    await mkdir(directory, { recursive: true });
    let current: StoredApplication[] = [];
    try { current = JSON.parse(await readFile(file, "utf8")) as StoredApplication[]; } catch { current = []; }
    const applications = [parsed.data, ...current.filter((item) => item.tracking_id !== parsed.data.tracking_id)];
    await writeFile(file, JSON.stringify(applications, null, 2), "utf8");
    return Response.json({ stored: true, persistence: "ephemeral-json-mirror" }, { status: 201 });
  } catch {
    return Response.json({ error: "The application was prepared in your browser, but the optional server mirror could not be written." }, { status: 503 });
  }
}
