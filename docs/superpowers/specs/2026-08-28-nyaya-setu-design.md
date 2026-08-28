# Nyaya-Setu Product and Technical Design

## Product outcome

Nyaya-Setu is a bilingual, mobile-first prototype that turns a citizen's grievance into an editable request for existing government records. It is an independent hackathon demo, never files anything with a government system, and makes every AI transformation inspectable as structured input and output.

## Scope

The build includes all four citizen phases:

1. Grievance entry, English/Hindi switching, optional browser voice input, and mock phone/OTP login.
2. Structured classification/routing, RTI drafting, live risk screening, and synthetic precedent matching.
3. Review, mock fee or mock BPL waiver, submission, local draft recovery, tracking ID/access code, and client-side PDF download.
4. Request tracking with a seeded overdue application and structured first-appeal drafting.

There is no admin surface, real authentication, real payment, real identity verification, government API, portal scraping, or open-ended chatbot.

## Experience architecture

The app uses one stateful, linear citizen journey rendered within a persistent application shell. The shell owns the exact mandatory disclosure, wordmark, progress, language switch, and track-request entry point. The landing page remains visible before login. Draft state is versioned and restored from `localStorage`.

The flow is:

`grievance -> mock login -> classification -> clarification (only when required) -> draft/risk/precedents -> review/fee -> confirmation -> tracking -> first appeal when overdue`

Every transition has a visible pending state, a citizen-readable error with retry, and a back path. AI never silently overwrites citizen edits.

## Visual specification

The accepted concept is `docs/design/nyaya-setu-concept.png` (1536x1024). It establishes:

- True-paper white `#FFFFFF` background, deep ink navy `#082A5B`, saffron `#E87500`, teal `#008F82`, risk red `#B42318`, and cool gray borders.
- Humanist editorial serif display headings paired with a legible sans-serif UI family.
- Open layouts with one purposeful primary frame, 12-16px radii, crisp one-pixel borders, restrained shadows, generous gutters, and thin bridge-like progress lines.
- A quiet header, disclosure band, stepper, and 44px minimum controls.
- A stacked 375px mobile layout and a side-by-side desktop drafting comparison.
- Code-native text and controls; there are no production raster assets beyond the design reference.

The generated board contains minor synthetic placeholder wording and identifiers. Product copy from the user's build specification has precedence, especially the exact disclosure banner.

## Structured AI boundary

The server exposes five POST handlers backed by a shared `runStructuredStep` adapter:

- `/api/classify`
- `/api/translate`
- `/api/screen`
- `/api/precedents`
- `/api/appeal`

Each step defines a strict JSON Schema with `additionalProperties: false` and calls the official OpenAI SDK through the Responses API using `text.format.type = "json_schema"`, `strict: true`, and model `gpt-4o-mini`, as required by the supplied brief. When `OPENAI_API_KEY` is absent or the provider call fails, the adapter returns an explicitly labelled deterministic demo result with the same schema so the reviewer flow never becomes a dead end. The UI and transparency panels expose the execution mode.

The browser console receives the same sanitized structured request and response shown in each transparency panel. No API key or server error detail reaches the client.

## Data and persistence

`data/departments.json` contains at least 12 synthetic departments across all nine categories, including overlapping routing candidates. `data/precedents.json` contains at least 20 synthetic examples.

Applications are persisted in two places:

- Versioned `localStorage` is the durable browser source for draft resume and tracking in the deployed demo.
- The submit route mirrors the required application shape to a JSON file in `/tmp` on serverless deployments or `.data` locally. This server-side mirror is explicitly documented as ephemeral on Vercel.

A seeded overdue local application (`RTI-2026-OVER01`, access code `SETU30`) makes Phase 4 immediately reviewable.

## Error handling and accessibility

Route inputs are validated before provider calls. All route failures use stable status codes and safe messages. The client preserves the current step and offers retry. The high-risk path requires either a revised low-risk draft or explicit acknowledgement.

Every form uses labels and descriptions, validation uses `aria-live`, focus moves to major step headings, accordions expose `aria-expanded`, colors meet WCAG AA, touch targets are at least 44px, motion respects `prefers-reduced-motion`, and all functionality works from a keyboard.

## Testing strategy

- Unit tests cover routing, validation, deterministic fallbacks, ID generation, risk behavior, storage migration, and strict OpenAI request payload construction.
- Component tests cover landing/login, bilingual persistence, editable drafting, risk acknowledgement, disclosure, transparency panels, fee waiver, and confirmation.
- API tests invoke all five handlers and inspect the provider-bound payloads for strict JSON Schema use.
- Playwright covers the full Phase 1-3 journey, restored drafts, Hindi switching, the seeded overdue tracking journey, first appeal, desktop, and 375x667 mobile.
- Completion requires fresh unit/integration tests, lint, typecheck, production build, Playwright, axe accessibility checks, and visual screenshot inspection against the accepted concept.

## Constraints and honesty

This prototype does not file RTI applications, verify BPL documents, take money, validate identities, or guarantee legal outcomes. Department officials, addresses, applications, precedents, and statuses are synthetic. OpenAI-backed output is available only with the one documented server environment variable; deterministic demo mode remains visible and usable without it.
