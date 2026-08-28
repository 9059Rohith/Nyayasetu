import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const disclosure = "DEVELOPER PROTOTYPE — Built for a hackathon. Uses synthetic department data and a mock payment flow. Not affiliated with the Government of India or rtionline.gov.in.";
const browserErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

test("loads the intended application shell without an error overlay", async ({ page }) => {
  await expect(page).toHaveTitle("Nyaya-Setu — RTI request drafting demo");
  await expect(page.getByRole("heading", { name: "Tell us what happened" })).toBeVisible();
  await expect(page.locator("[data-nextjs-dialog-overlay]")).toHaveCount(0);
  await expect(page.locator("body")).not.toBeEmpty();
});

test("completes the full drafting, payment, submission, and status journey", async ({ page }) => {
  await expect(page.getByText(disclosure)).toBeVisible();
  await page.getByLabel("Describe the issue").fill("The streetlight outside my home has been broken for three months and nobody has repaired it.");
  await page.getByLabel("PIN code (optional)").fill("500032");
  await page.getByRole("button", { name: "Turn this into an RTI request" }).click();
  await expect(page.getByText("Demo OTP: 123456 (any 6 digits work)")).toBeVisible();
  await page.getByRole("button", { name: "Continue to demo code" }).click();
  await page.getByLabel("6-digit demo code").fill("123456");
  await page.getByRole("button", { name: "Verify and prepare draft" }).click();
  await expect(page.getByRole("heading", { name: "What we’re submitting" })).toBeVisible();
  await expect(page.getByText("How this was generated")).toHaveCount(4);
  await expect(page.getByText("SYNTHETIC EXAMPLE — not a real case record").first()).toBeVisible();
  const editor = page.getByLabel("What we’re submitting");
  await editor.fill(`${await editor.inputValue()}\n4. Please provide the latest recorded maintenance status.`);
  await expect(page.getByText("Checking edit")).toBeVisible();
  await expect(page.getByText("Checking edit")).toBeHidden({ timeout: 8_000 });
  await page.getByRole("button", { name: "Review and choose fee" }).click();
  await expect(page.getByText("Demo payment only. No money will be taken.")).toBeVisible();
  await page.getByRole("button", { name: "Pay ₹10 (Demo)" }).click();
  await expect(page.getByText("Simulating payment…")).toBeVisible();
  await expect(page.getByText("Demo payment complete")).toBeVisible({ timeout: 4_000 });
  await page.getByRole("button", { name: "Prepare application" }).click();
  await expect(page.getByRole("heading", { name: "Application prepared" })).toBeVisible();
  const trackingId = (await page.locator("text=/RTI-2026-[0-9]{6}/").first().textContent())!;
  const accessCode = (await page.locator("p.tracking-\\[\\.2em\\]").textContent())!;
  await page.getByRole("button", { name: "Track a demo request" }).click();
  await page.getByLabel("Tracking ID").fill(trackingId);
  await page.getByLabel("Access code").fill(accessCode);
  await page.getByRole("button", { name: "Show status" }).click();
  await expect(page.getByText("Awaiting reply").first()).toBeVisible();
});

test("restores a draft at the saved login step after reload", async ({ page }) => {
  await page.getByLabel("Describe the issue").fill("The road outside my home has several dangerous potholes and needs records checked.");
  await page.getByRole("button", { name: "Turn this into an RTI request" }).click();
  await expect(page.getByRole("heading", { name: "Quick demo login" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Quick demo login" })).toBeVisible();
  await expect(page.getByLabel("Mobile number")).toHaveValue("9876543210");
});

test("opens the seeded overdue status and drafts a structured First Appeal", async ({ page }) => {
  await page.getByRole("button", { name: "Track a demo request" }).click();
  await page.getByLabel("Tracking ID").fill("RTI-2026-OVER01");
  await page.getByLabel("Access code").fill("SETU30");
  await page.getByRole("button", { name: "Show status" }).click();
  await expect(page.getByText("Reply overdue").first()).toBeVisible();
  await expect(page.getByText("Transferred to the correct records office")).toBeVisible();
  await page.getByRole("button", { name: "Draft First Appeal" }).click();
  await expect(page.getByRole("heading", { name: "Your First Appeal draft" })).toBeVisible();
  await expect(page.getByText("How this was generated")).toBeVisible();
});

test("is bilingual, mobile-safe, and free of serious automated accessibility violations", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.getByRole("button", { name: "हिन्दी" }).click();
  await expect(page.getByRole("heading", { name: "बताइए क्या हुआ" })).toBeVisible();
  await expect(page.getByRole("button", { name: "इसे RTI अनुरोध में बदलें" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""))).toEqual([]);
});
