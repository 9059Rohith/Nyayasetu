import { describe, expect, it, vi } from "vitest";
import { buildStructuredRequest, runStructuredStep } from "@/lib/ai/structured";
import { aiSteps, type AiStep } from "@/lib/ai/schemas";

describe("strict structured output requests", () => {
  it.each(Object.values(aiSteps))("builds $functionName with strict JSON Schema", (step) => {
    const request = buildStructuredRequest(step as AiStep<unknown>, "structured test input");
    expect(request.model).toBe("gpt-4o-mini");
    expect(request.text.format.type).toBe("json_schema");
    expect(request.text.format.strict).toBe(true);
    expect(request.text.format.schema).toMatchObject({ type: "object", additionalProperties: false });
    expect(request.text.format.schema.required).toEqual(expect.arrayContaining(step.requiredFields));
  });

  it("returns parsed provider output and records the exact provider request", async () => {
    const calls: unknown[] = [];
    const provider = {
      responses: {
        parse: vi.fn(async (request: unknown) => {
          calls.push(request);
          return { output_parsed: { subject_category: "other", likely_department_id: "dept_general_records", confidence: "low", needs_clarification: true, clarifying_question: "Which public service or government office is this about?" } };
        }),
      },
    };
    const input = { raw_grievance: "Please help", pin_code: null };
    const response = await runStructuredStep({ step: aiSteps.classify, input, fallback: () => { throw new Error("fallback should not run"); }, provider });
    expect(response.trace.mode).toBe("openai");
    expect(response.trace.input).toEqual(input);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ model: "gpt-4o-mini", text: { format: { strict: true } } });
  });

  it("uses a visibly traceable demo result when no key/provider is available", async () => {
    const response = await runStructuredStep({
      step: aiSteps.screen,
      input: { compliant_request_text: "Provide the order", subject_category: "other" },
      fallback: () => ({ risk_flags: [], overall_risk: "low" as const }),
      provider: null,
    });
    expect(response.trace.mode).toBe("demo");
    expect(response.result).toEqual({ risk_flags: [], overall_risk: "low" });
  });
});
