import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReviewStep } from "@/components/flow/ReviewStep";
import { ConfirmationStep } from "@/components/flow/ConfirmationStep";
import { buildPdfLines } from "@/lib/pdf";
import { seedOverdueApplication } from "@/lib/applications";

const reviewProps = {
  language: "en" as const,
  departmentId: "dept_municipal_roads",
  compliantRequest: "Please provide the sanctioned work order.",
  requestedRecords: ["sanctioned work order"],
  pinCode: "500032",
  isBpl: false,
  bplFileName: "",
  paid: false,
  onBplChange: vi.fn(),
  onBplFile: vi.fn(),
  onPaid: vi.fn(),
  onBack: vi.fn(),
  onSubmit: vi.fn(),
};

afterEach(() => vi.useRealTimers());

describe("review and mock fee", () => {
  it("shows the complete review and labels every simulated dependency", () => {
    render(<ReviewStep {...reviewProps} />);
    expect(screen.getByText("₹10")).toBeVisible();
    expect(screen.getByText(/Public Information Officer — MOCK/)).toBeVisible();
    expect(screen.getByText("Demo payment only. No money will be taken.")).toBeVisible();
    expect(screen.getByText(/PIN 500032 was used only to suggest/)).toBeVisible();
  });

  it("reveals the mock BPL upload and reports the selected image", async () => {
    const user = userEvent.setup();
    const onBplChange = vi.fn();
    const onBplFile = vi.fn();
    const { rerender } = render(<ReviewStep {...reviewProps} onBplChange={onBplChange} onBplFile={onBplFile} />);
    await user.click(screen.getByLabelText("I am Below Poverty Line (BPL) — waive the fee"));
    expect(onBplChange).toHaveBeenCalledWith(true);
    rerender(<ReviewStep {...reviewProps} isBpl onBplChange={onBplChange} onBplFile={onBplFile} />);
    const file = new File(["demo"], "certificate.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Upload BPL certificate (MOCK — not verified)"), file);
    expect(onBplFile).toHaveBeenCalledWith("certificate.png");
  });

  it("keeps the mock payment visibly busy for 1.5 seconds", async () => {
    vi.useFakeTimers();
    const onPaid = vi.fn();
    render(<ReviewStep {...reviewProps} onPaid={onPaid} />);
    await act(async () => screen.getByRole("button", { name: "Pay ₹10 (Demo)" }).click());
    expect(screen.getByText("Simulating payment…")).toBeVisible();
    await act(async () => vi.advanceTimersByTime(1500));
    expect(onPaid).toHaveBeenCalledOnce();
  });
});

describe("confirmation artifact", () => {
  it("shows tracking, access, reply window and a PDF action", async () => {
    const user = userEvent.setup();
    const application = { ...seedOverdueApplication(), tracking_id: "RTI-2026-123456", access_code: "ABC234", status: "submitted" as const, days_elapsed_mock: 0 };
    const onDownload = vi.fn();
    render(<ConfirmationStep language="en" application={application} onDownload={onDownload} onTrack={vi.fn()} onStartOver={vi.fn()} />);
    expect(screen.getByText("RTI-2026-123456")).toBeVisible();
    expect(screen.getByText("ABC234")).toBeVisible();
    expect(screen.getByText("30 days from the submission date")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Download application PDF" }));
    expect(onDownload).toHaveBeenCalledOnce();
  });

  it("builds printable lines from the final citizen-controlled text", () => {
    const lines = buildPdfLines(seedOverdueApplication(), "Municipal Roads & Infrastructure Department");
    expect(lines.join("\n")).toContain("RTI-2026-OVER01");
    expect(lines.join("\n")).toContain("Please provide the sanctioned work order");
    expect(lines.join("\n")).toContain("Independent developer prototype");
  });
});
