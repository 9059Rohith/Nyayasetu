import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tracker } from "@/components/tracking/Tracker";

describe("status tracking and First Appeal", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({
      result: { appeal_letter_text: "To the reviewing authority\n\nFirst Appeal under Section 19(1)\n\nPlease direct a response.", citizen_explanation: "The reply window has passed, so this asks a senior officer to review the delay." },
      trace: { step: "E", functionName: "draft_first_appeal", mode: "demo", input: { days_elapsed: 38 }, output: { appeal_letter_text: "To the reviewing authority", citizen_explanation: "The reply window has passed." } },
    })));
  });

  it("finds the seeded overdue request without waiting 30 days", async () => {
    const user = userEvent.setup();
    render(<Tracker language="en" onBack={vi.fn()} />);
    expect(screen.getByText("Demo overdue request: RTI-2026-OVER01 / SETU30")).toBeVisible();
    await user.type(screen.getByLabelText("Tracking ID"), "RTI-2026-OVER01");
    await user.type(screen.getByLabelText("Access code"), "SETU30");
    await user.click(screen.getByRole("button", { name: "Show status" }));
    expect(screen.getAllByText("Reply overdue")[0]).toBeVisible();
    expect(screen.getByText("Transferred to the correct records office")).toBeVisible();
    expect(screen.getByRole("button", { name: "Draft First Appeal" })).toBeVisible();
  });

  it("renders the Step E appeal and its inspectable trace", async () => {
    const user = userEvent.setup();
    render(<Tracker language="en" onBack={vi.fn()} />);
    await user.type(screen.getByLabelText("Tracking ID"), "RTI-2026-OVER01");
    await user.type(screen.getByLabelText("Access code"), "SETU30");
    await user.click(screen.getByRole("button", { name: "Show status" }));
    await user.click(screen.getByRole("button", { name: "Draft First Appeal" }));
    expect(await screen.findByRole("heading", { name: "Your First Appeal draft" })).toBeVisible();
    expect(screen.getByText(/First Appeal under Section 19\(1\)/)).toBeVisible();
    expect(screen.getByText("How this was generated")).toBeVisible();
    expect(fetch).toHaveBeenCalledWith("/api/appeal", expect.objectContaining({ method: "POST" }));
  });

  it("does not reveal an application with the wrong access code", async () => {
    const user = userEvent.setup();
    render(<Tracker language="en" onBack={vi.fn()} />);
    await user.type(screen.getByLabelText("Tracking ID"), "RTI-2026-OVER01");
    await user.type(screen.getByLabelText("Access code"), "WRONG1");
    await user.click(screen.getByRole("button", { name: "Show status" }));
    expect(screen.getByRole("alert")).toHaveTextContent("We could not find a matching demo request.");
  });
});
