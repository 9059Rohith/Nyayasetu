import { describe, expect, it } from "vitest";
import { POST as classify } from "@/app/api/classify/route";
import { POST as translate } from "@/app/api/translate/route";
import { POST as screen } from "@/app/api/screen/route";
import { POST as precedents } from "@/app/api/precedents/route";
import { POST as appeal } from "@/app/api/appeal/route";

function post(body: unknown) {
  return new Request("http://localhost/api/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

describe("AI route handlers", () => {
  it("rejects an empty classification request with a safe message", async () => {
    const response = await classify(post({ raw_grievance: "", pin_code: null }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Tell us what happened before continuing." });
  });

  it("returns Step A in deterministic demo mode without an API key", async () => {
    const response = await classify(post({ raw_grievance: "The streetlight is broken", pin_code: "500032" }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.trace).toMatchObject({ step: "A", functionName: "classify_and_route", mode: "demo" });
    expect(body.result.subject_category).toBe("electricity_utility");
  });

  it.each([
    [translate, { raw_grievance: "Broken road", subject_category: "roads_infrastructure", department_name: "Municipal Roads" }, "B"],
    [screen, { compliant_request_text: "Provide the work order", subject_category: "roads_infrastructure" }, "C"],
    [precedents, { compliant_request_text: "Provide the work order", subject_category: "roads_infrastructure" }, "D"],
    [appeal, { original_request_text: "Provide the work order", department_name: "Municipal Roads", days_elapsed: 38 }, "E"],
  ] as const)("returns a valid deterministic response for each remaining route", async (handler, payload, step) => {
    const response = await handler(post(payload));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.trace.step).toBe(step);
    expect(body.trace.mode).toBe("demo");
  });
});
