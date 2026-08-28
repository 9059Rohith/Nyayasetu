import { afterEach, describe, expect, it } from "vitest";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { POST } from "@/app/api/applications/route";
import { seedOverdueApplication } from "@/lib/applications";

const testDir = path.join(process.cwd(), ".test-data");

afterEach(() => {
  if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  delete process.env.NYAYA_SETU_DATA_DIR;
});

describe("application persistence mirror", () => {
  it("rejects incomplete records", async () => {
    const response = await POST(new Request("http://localhost/api/applications", { method: "POST", body: JSON.stringify({ tracking_id: "bad" }) }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "The prepared application is incomplete. Nothing was stored." });
  });

  it("writes a complete synthetic application to the configured JSON mirror", async () => {
    process.env.NYAYA_SETU_DATA_DIR = testDir;
    const response = await POST(new Request("http://localhost/api/applications", { method: "POST", body: JSON.stringify(seedOverdueApplication()) }));
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ stored: true, persistence: "ephemeral-json-mirror" });
    expect(existsSync(path.join(testDir, "applications.json"))).toBe(true);
  });
});
