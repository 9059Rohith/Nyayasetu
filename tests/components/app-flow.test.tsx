import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NyayaSetuApp } from "@/components/NyayaSetuApp";
import { POST as classify } from "@/app/api/classify/route";
import { POST as translate } from "@/app/api/translate/route";
import { POST as screenRisk } from "@/app/api/screen/route";
import { POST as precedents } from "@/app/api/precedents/route";
import { createInitialDraft } from "@/lib/workflow";
import { saveDraft } from "@/lib/storage";

const handlers: Record<string, (request: Request) => Promise<Response>> = {
  "/api/classify": classify,
  "/api/translate": translate,
  "/api/screen": screenRisk,
  "/api/precedents": precedents,
};

describe("complete citizen workflow", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : new URL(input.url).pathname;
      const path = url.startsWith("http") ? new URL(url).pathname : url;
      if (path === "/api/applications") return Response.json({ stored: true, persistence: "ephemeral-mirror" }, { status: 201 });
      const handler = handlers[path];
      if (!handler) return Response.json({ error: "missing test handler" }, { status: 404 });
      return handler(new Request(`http://localhost${path}`, init));
    }));
  });

  it("completes Phase 1 through confirmation with no dead end", async () => {
    const user = userEvent.setup();
    render(<NyayaSetuApp />);
    await user.type(screen.getByLabelText("Describe the issue"), "The streetlight outside my home has been broken for three months and nobody repaired it.");
    await user.type(screen.getByLabelText("PIN code (optional)"), "500032");
    await user.click(screen.getByRole("button", { name: "Turn this into an RTI request" }));
    expect(screen.getByText("Demo OTP: 123456 (any 6 digits work)")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Continue to demo code" }));
    await user.type(screen.getByLabelText("6-digit demo code"), "123456");
    await user.click(screen.getByRole("button", { name: "Verify and prepare draft" }));
    expect(await screen.findByRole("heading", { name: "What we’re submitting" }, { timeout: 5000 })).toBeVisible();
    expect(screen.getAllByText("How this was generated")).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "Review and choose fee" }));
    await user.click(screen.getByLabelText("I am Below Poverty Line (BPL) — waive the fee"));
    await user.upload(screen.getByLabelText("Upload BPL certificate (MOCK — not verified)"), new File(["demo"], "bpl.png", { type: "image/png" }));
    await user.click(screen.getByRole("button", { name: "Prepare application" }));
    expect(await screen.findByRole("heading", { name: "Application prepared" })).toBeVisible();
    expect(screen.getByText(/^RTI-2026-\d{6}$/)).toBeVisible();
  });

  it("restores an abandoned draft at its saved step", () => {
    saveDraft({ ...createInitialDraft(), step: "login", rawGrievance: "The road outside my home has dangerous potholes.", pinCode: "500032", phone: "9876543210" });
    render(<NyayaSetuApp />);
    expect(screen.getByRole("heading", { name: "Quick demo login" })).toBeVisible();
    expect(screen.getByDisplayValue("9876543210")).toBeVisible();
  });
});
