import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DraftingStep } from "@/components/flow/DraftingStep";
import type { StepTrace } from "@/types/domain";

const traces: Array<StepTrace<unknown, unknown>> = [
  { step: "A", functionName: "classify_and_route", mode: "demo", input: { raw_grievance: "Broken road" }, output: { subject_category: "roads_infrastructure" } },
  { step: "B", functionName: "translate_to_compliant_request", mode: "demo", input: { raw_grievance: "Broken road" }, output: { compliant_request_text: "Provide the work order" } },
  { step: "C", functionName: "screen_exemption_risk", mode: "demo", input: { compliant_request_text: "Provide private records" }, output: { overall_risk: "high" } },
  { step: "D", functionName: "find_similar_precedents", mode: "demo", input: { subject_category: "roads_infrastructure" }, output: { precedents: [] } },
];

const baseProps = {
  language: "en" as const,
  rawGrievance: "Why is the road still broken?",
  category: "roads_infrastructure" as const,
  departmentId: "dept_municipal_roads",
  compliantRequest: "Please provide the certified work order.",
  explanation: "We changed a why-question into a request for records.",
  risk: { overall_risk: "low" as const, risk_flags: [] },
  precedents: [
    { precedent_id: "prec_0001", similarity_reason: "Both ask for a work order.", outcome: "answered_in_full" as const, outcome_note: "Specific records supported a response." },
  ],
  traces,
  loading: false,
  screening: false,
  error: "",
  highRiskAccepted: false,
  onDepartmentChange: vi.fn(),
  onDraftChange: vi.fn(),
  onRiskAcceptedChange: vi.fn(),
  onRetry: vi.fn(),
  onBack: vi.fn(),
  onContinue: vi.fn(),
};

describe("drafting experience", () => {
  it("shows the flagship side-by-side comparison, editable routing, precedents and all structured traces", async () => {
    const user = userEvent.setup();
    const onDraftChange = vi.fn();
    const onDepartmentChange = vi.fn();
    render(<DraftingStep {...baseProps} onDraftChange={onDraftChange} onDepartmentChange={onDepartmentChange} />);
    expect(screen.getByRole("heading", { name: "What you said" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "What we’re submitting" })).toBeVisible();
    expect(screen.getByText("SYNTHETIC EXAMPLE — not a real case record")).toBeVisible();
    expect(screen.getAllByText("How this was generated")).toHaveLength(4);
    await user.selectOptions(screen.getByLabelText("Suggested office (MOCK)"), "dept_public_works");
    expect(onDepartmentChange).toHaveBeenCalledWith("dept_public_works");
    await user.type(screen.getByLabelText("What we’re submitting"), " More detail");
    expect(onDraftChange).toHaveBeenCalled();
  });

  it("blocks a high-risk draft until the citizen explicitly acknowledges it", async () => {
    const user = userEvent.setup();
    const onRiskAcceptedChange = vi.fn();
    const onContinue = vi.fn();
    render(<DraftingStep {...baseProps} risk={{ overall_risk: "high", risk_flags: [{ clause: "8(1)(j)", explanation: "This asks for another person's private information.", suggestion: "Ask only for your own record." }] }} onRiskAcceptedChange={onRiskAcceptedChange} onContinue={onContinue} />);
    expect(screen.getByText("A few things could delay or block this request")).toBeVisible();
    expect(screen.getByRole("button", { name: "Review and choose fee" })).toBeDisabled();
    await user.click(screen.getByLabelText("I understand this risk and want to continue"));
    expect(onRiskAcceptedChange).toHaveBeenCalledWith(true);
  });

  it("shows a retry action for a failed pipeline call", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<DraftingStep {...baseProps} error="We could not prepare the draft." onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
