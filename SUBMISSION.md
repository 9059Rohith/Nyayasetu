# Nyaya-Setu — Build What Moves India

**Live production demo:** https://p-001-flax.vercel.app

## Problem

RTI applications are frequently rejected or returned not because the underlying grievance is illegitimate, but because citizens phrase requests as "why" questions, which Section 2(f) of the RTI Act does not obligate authorities to answer. Backlogs compound the problem: as of mid-2025, the CIC and 28 State Information Commissions together had 4.13 lakh appeals and complaints pending nationally.

## Solution

Nyaya-Setu is a structured AI pipeline between a citizen's raw grievance and a legally compliant RTI application. It classifies and routes the request to a synthetic department, rewrites vague complaints into specific record requests, screens the citizen-controlled draft against common reasons records may be withheld, and surfaces synthetic precedent examples so the citizen has calibrated expectations. It also prepares the mock fee flow, a printable draft, status tracking, and a First Appeal when the seeded reply window is overdue.

## How AI is used

The system is not a chatbot. It runs five bounded function contracts—`classify_and_route`, `translate_to_compliant_request`, `screen_exemption_risk`, `find_similar_precedents`, and `draft_first_appeal`. Each OpenAI Responses API request uses a strict JSON Schema generated from Zod, `additionalProperties: false`, and deterministic application consumption. Every structured input and output is visible under the corresponding result and is logged to the browser console.

When `OPENAI_API_KEY` is absent or a provider call fails, the same contracts return deterministic, visibly labelled demo output. This keeps the judging journey functional without pretending a model call occurred.

## Why it is better

Nyaya-Setu shifts the burden of understanding a technical legal framework from the citizen to an inspectable system while keeping the citizen in control of every word before submission. Nothing is auto-filed or silently rewritten. The flagship side-by-side view makes the transformation legible in one glance, and live screening catches risky edits before they cost another cycle.

## What works today, what's still mocked

### Working

- Complete bilingual grievance, mock login, draft, screening, precedent, review, fee, confirmation, PDF, status, and First Appeal journey.
- Draft recovery and synthetic application tracking in browser storage.
- Five strict structured-output routes with deterministic fallback and visible trace panels.
- 12+ synthetic departments and 20+ synthetic precedents.
- Seeded overdue reviewer credentials: `RTI-2026-OVER01` / `SETU30`.

### Mocked and disclosed

- No live government endpoint is accessed; no request or appeal is actually filed.
- All department, official, precedent, outcome, application, and status data is synthetic.
- OTP, BPL certificate upload, payment, transfer, and countdown are simulations.
- The Vercel JSON mirror is ephemeral (`/tmp`); browser storage drives resume and tracking for this prototype.
- Deterministic demo AI output is used when the optional server key is unavailable and is labelled in the interface.

Nyaya-Setu is an independent developer prototype. It is not affiliated with or endorsed by the Government of India or rtionline.gov.in, does not provide legal advice, and does not promise that an authority will disclose a record.
