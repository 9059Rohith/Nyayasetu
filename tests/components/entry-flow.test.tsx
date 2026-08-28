import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/shell/AppShell";
import { LandingStep } from "@/components/flow/LandingStep";
import { LoginStep } from "@/components/flow/LoginStep";

describe("persistent application shell", () => {
  it("shows the exact disclosure and switches all shell copy to Hindi", async () => {
    const user = userEvent.setup();
    const changeLanguage = vi.fn();
    const { rerender } = render(<AppShell language="en" onLanguageChange={changeLanguage} step="landing"><p>Child</p></AppShell>);
    expect(screen.getByText("DEVELOPER PROTOTYPE — Built for a hackathon. Uses synthetic department data and a mock payment flow. Not affiliated with the Government of India or rtionline.gov.in.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "हिन्दी" }));
    expect(changeLanguage).toHaveBeenCalledWith("hi");
    rerender(<AppShell language="hi" onLanguageChange={changeLanguage} step="landing"><p>Child</p></AppShell>);
    expect(screen.getByText(/डेवलपर प्रोटोटाइप/)).toBeVisible();
  });
});

describe("landing step", () => {
  it("validates grievance and PIN before opening login", async () => {
    const user = userEvent.setup();
    const proceed = vi.fn();
    render(<LandingStep language="en" rawGrievance="" pinCode="" onChange={vi.fn()} onProceed={proceed} onTrack={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Turn this into an RTI request" }));
    expect(screen.getByText("Tell us at least a few details so we can prepare a useful request.")).toBeVisible();
    expect(proceed).not.toHaveBeenCalled();
  });

  it("passes a detailed grievance and optional six-digit PIN", async () => {
    const user = userEvent.setup();
    const proceed = vi.fn();
    const onChange = vi.fn();
    const { rerender } = render(<LandingStep language="en" rawGrievance="" pinCode="" onChange={onChange} onProceed={proceed} onTrack={vi.fn()} />);
    await user.type(screen.getByLabelText("Describe the issue"), "The streetlight outside my home has been broken for three months.");
    expect(onChange).toHaveBeenCalled();
    rerender(<LandingStep language="en" rawGrievance="The streetlight outside my home has been broken for three months." pinCode="500032" onChange={onChange} onProceed={proceed} onTrack={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Turn this into an RTI request" }));
    expect(proceed).toHaveBeenCalledOnce();
  });
});

describe("mock login", () => {
  it("prints credentials and accepts any six-digit code", async () => {
    const user = userEvent.setup();
    const authenticated = vi.fn();
    render(<LoginStep language="en" phone="9876543210" otp="" onChange={vi.fn()} onBack={vi.fn()} onAuthenticated={authenticated} />);
    expect(screen.getByText("Demo phone: 9876543210")).toBeVisible();
    expect(screen.getByText("Demo OTP: 123456 (any 6 digits work)")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Continue to demo code" }));
    await user.type(screen.getByLabelText("6-digit demo code"), "654321");
    await user.click(screen.getByRole("button", { name: "Verify and prepare draft" }));
    expect(authenticated).toHaveBeenCalledWith("9876543210", "654321");
  });
});
