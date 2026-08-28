# Nyaya-Setu visual fidelity ledger

Production implementation compared against `nyaya-setu-concept.png` at 1536×1024 desktop and 375×667 mobile.

| Area | Production decision | Verification |
| --- | --- | --- |
| Information hierarchy | Retained the compact brand header, numbered journey, full-width disclosure, editorial headline, bordered work surface, and right-aligned primary action. | Production screenshots at desktop and mobile. |
| Required copy | The brief's exact developer-prototype disclosure and task copy take precedence over the concept board's shorter illustrative text. | Exact disclosure is visible on every workflow screen. |
| Typography | Georgia supplies the civic/editorial display voice; a system sans stack keeps form controls and dense guidance highly legible. | Visual inspection at both target widths. |
| Colour | White, deep navy, saffron, and teal match the concept. Saffron was darkened to `#b34f00` so white button text reaches a 5.20:1 contrast ratio. | Automated axe scan reports no serious or critical violations. |
| Draft comparison | Preserved the concept's side-by-side “What you said” / “What we’re submitting” desktop layout, with a natural single-column mobile collapse. | Desktop drafting screenshot and responsive E2E test. |
| Trust signals | AI provenance drawers, deterministic-output labels, synthetic precedent labels, rejection-risk state, and mock-department labels are deliberately explicit. | Workflow and component tests assert the disclosures. |
| Mobile behaviour | All primary controls are at least 44px high; the 375px layout has no horizontal overflow. The mandated disclosure wraps vertically rather than shrinking. | Playwright at 375×667. |
| Motion | Motion is limited to purposeful loading/payment feedback and is removed when reduced motion is requested. | CSS inspection and automated workflow tests. |
| Assets | No decorative stock imagery was needed; the product is intentionally interface-led. The generated concept remains design documentation, not runtime content. | Runtime asset inspection. |
| Release cleanliness | Visual QA was repeated against `next start`, eliminating the development-only framework badge seen during the first local capture. | Production-mode desktop and mobile screenshots. |
