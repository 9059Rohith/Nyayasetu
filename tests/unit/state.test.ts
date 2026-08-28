import { beforeEach, describe, expect, it } from "vitest";
import { copy, t } from "@/lib/i18n";
import { clearDraft, loadDraft, saveDraft, STORAGE_KEY } from "@/lib/storage";
import { createInitialDraft } from "@/lib/workflow";
import { createApplication, seedOverdueApplication } from "@/lib/applications";

describe("bilingual copy", () => {
  it("returns complete English and Hindi primary actions", () => {
    expect(t("en", "primaryCta")).toBe("Turn this into an RTI request");
    expect(t("hi", "primaryCta")).toBe("इसे RTI अनुरोध में बदलें");
    expect(Object.keys(copy.en)).toEqual(Object.keys(copy.hi));
  });
});

describe("versioned draft storage", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a draft and ignores malformed or stale values", () => {
    const draft = { ...createInitialDraft(), step: "login" as const, rawGrievance: "The streetlight is broken outside my home." };
    saveDraft(draft);
    expect(loadDraft()).toMatchObject(draft);

    localStorage.setItem(STORAGE_KEY, "not-json");
    expect(loadDraft()).toBeNull();

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 0, draft }));
    expect(loadDraft()).toBeNull();
  });

  it("clears only the Nyaya-Setu draft", () => {
    localStorage.setItem("unrelated", "keep");
    saveDraft(createInitialDraft());
    clearDraft();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe("keep");
  });
});

describe("application records", () => {
  it("creates the complete required storage shape", () => {
    const draft = {
      ...createInitialDraft(),
      phone: "9876543210",
      rawGrievance: "The streetlight is broken outside my home.",
      compliantRequest: "Please provide the streetlight fault register entry.",
      departmentId: "dept_electricity_hyderabad",
      requestedRecords: ["streetlight fault register"],
    };
    const app = createApplication(draft, () => 0.123456, new Date("2026-08-28T12:00:00.000Z"));
    expect(app).toMatchObject({
      tracking_id: "RTI-2026-123456",
      citizen_phone: "9876543210",
      department_id: "dept_electricity_hyderabad",
      status: "submitted",
      created_at: "2026-08-28T12:00:00.000Z",
      days_elapsed_mock: 0,
    });
    expect(app.access_code).toMatch(/^[A-Z2-9]{6}$/);
  });

  it("ships an immediately testable overdue application", () => {
    expect(seedOverdueApplication()).toMatchObject({ tracking_id: "RTI-2026-OVER01", access_code: "SETU30", status: "overdue", days_elapsed_mock: 38 });
  });
});
