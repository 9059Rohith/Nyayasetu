# Nyaya-Setu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the complete bilingual Nyaya-Setu RTI drafting, submission, tracking, and first-appeal prototype.

**Architecture:** A Next.js App Router application renders a versioned client-side workflow and calls five small route handlers through a strict structured-output adapter. Synthetic datasets and deterministic fallbacks make every screen reviewer-testable, while optional OpenAI calls use server-only credentials and identical schemas.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, official OpenAI SDK, Zod, Vitest, Testing Library, Playwright, axe-core, and jsPDF.

**Spec:** `docs/superpowers/specs/2026-08-28-nyaya-setu-design.md`

## Global Constraints

- Next.js App Router and TypeScript throughout; mobile-first from 375x667.
- Exactly one optional provider environment variable: `OPENAI_API_KEY`; no secret reaches client code.
- Every AI step uses strict JSON Schema structured output and has an inspectable deterministic demo fallback.
- Preserve the exact mandatory disclosure on every screen.
- No real government, identity, payment, analytics, or scraping integration.
- All mock and synthetic data is labelled visibly.
- Citizen edits remain the source of truth and draft state survives reloads.

---

### Task 1: Tooling, contracts, and core domain behavior

**Files:** Create `package.json`, framework configuration, `types/domain.ts`, `lib/validation.ts`, `lib/id.ts`, `lib/routing.ts`, `lib/demo-ai.ts`, and unit tests under `tests/unit/`.

**Interfaces:** Produces `classifyDemo`, `translateDemo`, `screenDemo`, `findPrecedentsDemo`, `draftAppealDemo`, `validatePhone`, `validateOtp`, `createTrackingId`, and the shared domain types.

- [ ] Write tests with literal expectations for category routing, valid/invalid login data, compliant record requests, risky privacy text, 3,000-character enforcement, and ID formats.
- [ ] Run the unit tests and confirm failure because the modules do not exist.
- [ ] Implement the minimum typed domain functions and synthetic data needed to satisfy them.
- [ ] Run the tests, refactor shared category/department lookup, and keep the suite green.

### Task 2: Strict OpenAI adapter and API routes

**Files:** Create `lib/ai/schemas.ts`, `lib/ai/prompts.ts`, `lib/ai/structured.ts`, `lib/api.ts`, and route handlers beneath `app/api/`.

**Interfaces:** Consumes the domain fallback functions. Produces `runStructuredStep`, five POST endpoints, sanitized `StepTrace<T>`, and a `mode: "openai" | "demo"` marker.

- [ ] Write adapter and handler tests that inject a recording provider and assert the exact model, `json_schema` format, `strict: true`, required fields, `additionalProperties: false`, and safe fallback/error responses.
- [ ] Run those tests and confirm the missing adapter/routes fail.
- [ ] Implement one shared adapter plus five thin validated handlers; parallelize independent precedent and risk work at the client call site.
- [ ] Run all API tests and unit tests; inspect the recorded request payloads.

### Task 3: Versioned workflow state, i18n, and application persistence

**Files:** Create `lib/i18n.ts`, `lib/storage.ts`, `lib/workflow.ts`, `lib/applications.ts`, `app/api/applications/route.ts`, and storage tests.

**Interfaces:** Produces a versioned `DraftState`, migration-safe read/write helpers, bilingual `t()` lookup, application submit/read helpers, seeded overdue application, and generated access code.

- [ ] Write failing tests for English/Hindi lookup, versioned restore, corrupt-storage recovery, application shape, and seeded overdue credentials.
- [ ] Verify the failures, then implement the minimum helpers and server `/tmp` mirror.
- [ ] Re-run tests and mutation-check wrong versions, empty values, and malformed JSON.

### Task 4: Accessible shell, landing, and mock login

**Files:** Create `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `components/shell/*`, `components/flow/LandingStep.tsx`, `components/flow/LoginStep.tsx`, and component tests.

**Interfaces:** Consumes workflow/i18n helpers and produces the persistent disclosure, language control, stepper, grievance input, voice enhancement, and any-six-digit mock OTP flow.

- [ ] Write failing component tests for exact disclosure copy, grievance validation, visible demo credentials, six-digit OTP acceptance, language changes, and 44px controls.
- [ ] Run them to observe missing components.
- [ ] Implement the shell and first two steps to match the accepted visual tokens.
- [ ] Re-run tests and verify keyboard labels and mobile layout rules.

### Task 5: Drafting, live risk checks, and precedents

**Files:** Create `components/flow/DraftingStep.tsx`, `components/TransparencyPanel.tsx`, `components/RiskPanel.tsx`, `components/PrecedentStrip.tsx`, and focused component tests.

**Interfaces:** Calls Steps A-D, preserves edited request text, debounces screening by 800ms, exposes department override/clarification, and logs/render traces.

- [ ] Write failing tests for loading/error/retry, classification override, clarification, side-by-side text, edit preservation, debounced screening, high-risk acknowledgement, synthetic labels, and transparency accordions.
- [ ] Run the failures, implement the minimum state machine and focused components, then run the tests.
- [ ] Refactor repeated async state into a typed hook and re-run the complete suite.

### Task 6: Review, mock fee, confirmation, and PDF

**Files:** Create `components/flow/ReviewStep.tsx`, `components/flow/ConfirmationStep.tsx`, `lib/pdf.ts`, submission tests, and finish the workflow composition in `app/page.tsx`.

**Interfaces:** Consumes the current draft and creates/persists a full application, fake 1.5s payment state, BPL mock upload path, tracking/access credentials, and client PDF export.

- [ ] Write failing tests for the exact fee, BPL toggle/upload label, payment transition, full application shape, confirmation data, and PDF content.
- [ ] Verify failure, implement the screens and submit behavior, then run all tests.

### Task 7: Tracking and structured first appeal

**Files:** Create `components/tracking/Tracker.tsx`, `components/tracking/StatusTimeline.tsx`, `components/tracking/AppealDraft.tsx`, and tracking tests.

**Interfaces:** Looks up local applications by tracking ID/access code, renders conditional transfer/overdue states, and calls Step E only for overdue applications.

- [ ] Write failing tests using `RTI-2026-OVER01` / `SETU30` for authentication, timeline, overdue action, appeal content, and transparency trace.
- [ ] Run failures, implement tracking end to end, and re-run the full suite.

### Task 8: Documentation and complete verification

**Files:** Create `README.md`, `SUBMISSION.md`, `.env.example`, `playwright.config.ts`, and E2E/accessibility specs.

**Interfaces:** Produces a copy-pasteable 90-second demo, accurate mock-vs-real disclosure, architecture diagram, and repeatable CI-quality commands.

- [ ] Write Playwright journeys for Phase 1-3, reload restore, Hindi, mobile 375x667, and seeded first appeal; run them against the app and fix failures.
- [ ] Run unit/component/API tests, lint, typecheck, production build, Playwright, and axe checks with fresh output.
- [ ] Capture desktop and 375x667 screenshots, inspect them with `view_image` beside `docs/design/nyaya-setu-concept.png`, record at least five fidelity comparisons, and fix drift.
- [ ] Walk every original deliverable requirement, document only genuine remaining mocks, and remove temporary QA artifacts.
