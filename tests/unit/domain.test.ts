import { describe, expect, it } from "vitest";
import {
  classifyDemo,
  draftAppealDemo,
  findPrecedentsDemo,
  screenDemo,
  translateDemo,
} from "@/lib/demo-ai";
import { createAccessCode, createTrackingId } from "@/lib/id";
import { validateOtp, validatePhone } from "@/lib/validation";

describe("login validation", () => {
  it("rejects phone numbers that are not exactly ten digits", () => {
    expect(validatePhone("98765")).toEqual({ ok: false, message: "Enter a 10-digit mobile number." });
    expect(validatePhone("9876543210")).toEqual({ ok: true, value: "9876543210" });
  });

  it("accepts any six-digit mock OTP and rejects other values", () => {
    expect(validateOtp("654321")).toEqual({ ok: true, value: "654321" });
    expect(validateOtp("12345")).toEqual({ ok: false, message: "Enter any 6-digit demo code." });
  });
});

describe("deterministic AI demo pipeline", () => {
  it("routes a streetlight complaint to an electricity department", () => {
    const result = classifyDemo("The streetlight outside my home has been broken for three months", "500032");
    expect(result.subject_category).toBe("electricity_utility");
    expect(result.likely_department_id).toBe("dept_electricity_hyderabad");
    expect(result.confidence).toBe("high");
  });

  it("asks one clarification for a grievance with no recognizable subject", () => {
    const result = classifyDemo("Please help me with this issue", null);
    expect(result.needs_clarification).toBe(true);
    expect(result.clarifying_question).toBe("Which public service or government office is this about?");
  });

  it("turns a road complaint into existing-record requests under 3000 characters", () => {
    const result = translateDemo("Why has the road outside my house not been repaired?", "roads_infrastructure", "Municipal Roads & Infrastructure Department");
    expect(result.compliant_request_text).toContain("certified copy of the sanctioned work order");
    expect(result.compliant_request_text).not.toContain("Why has");
    expect(result.requested_records).toHaveLength(3);
    expect(result.compliant_request_text.length).toBeLessThanOrEqual(3000);
  });

  it("flags a request for another person's private medical records", () => {
    const result = screenDemo("Provide the private medical records and home address of another person", "healthcare_scheme");
    expect(result.overall_risk).toBe("high");
    expect(result.risk_flags[0]?.clause).toBe("8(1)(j)");
  });

  it("returns only matching synthetic precedents", () => {
    const result = findPrecedentsDemo("roads_infrastructure", "Provide the road work order and inspection report");
    expect(result.precedents).toHaveLength(3);
    expect(result.precedents.every((item) => item.precedent_id.startsWith("prec_"))).toBe(true);
  });

  it("drafts a first appeal with the original request and elapsed days", () => {
    const result = draftAppealDemo("Provide the work order.", "Municipal Roads Department", 38);
    expect(result.appeal_letter_text).toContain("Section 19(1)");
    expect(result.appeal_letter_text).toContain("38 days");
    expect(result.appeal_letter_text).toContain("Provide the work order.");
  });
});

describe("synthetic credentials", () => {
  it("creates identifiers with the documented shapes", () => {
    expect(createTrackingId(() => 0.123456)).toBe("RTI-2026-123456");
    expect(createAccessCode(() => 0.1)).toMatch(/^[A-Z2-9]{6}$/);
  });
});
