# LootSignal

**Find the fandoms worth building for.**

LootSignal is an internal decision-intelligence platform that ranks 51 video-game
franchises (Sony/PlayStation IP plus five non-Sony benchmarks) by likely
physical-merchandise profitability for a small-to-midsized ecommerce company.
It is a ranking + evidence + forecast tool — not a gaming news site, storefront,
or fan wiki.

> This repository previously hosted an unrelated static newsletter project; it
> is preserved untouched in [`legacy-newsletter/`](legacy-newsletter/).

## Setup

Requires Node 20+.

```bash
npm install
npm run dev        # development server
npm run build      # production build (statically generates all 60 pages)
npm start          # serve the production build
```

Quality gates:

```bash
npm run lint       # ESLint (zero errors)
npm run typecheck  # tsc --noEmit (strict mode)
npm test           # Vitest — unit + component tests
npm run e2e        # Playwright E2E (see Testing below)
```

## Architecture

- **Next.js (App Router) + TypeScript strict.** Server components by default;
  client components only where interactivity requires (filters, sliders,
  drawers, charts, localStorage).
- **Tailwind CSS v4 + shadcn/ui.** The shadcn registry was unreachable from the
  build environment, so the standard shadcn/ui components are vendored by hand
  in `src/components/ui/` (same code the CLI would generate) with their Radix
  dependencies installed from npm.
- **Recharts** for charts, always dynamically imported on the client
  (`src/components/charts/lazy.tsx`) with skeleton placeholders. Every chart
  ships a one-sentence text summary and a "View as data table" alternative.
- **Zod** validates all seed data at module load (`src/data/franchises.ts`
  calls `franchiseListSchema.parse`); invalid data throws immediately — the
  build fails rather than rendering unverified numbers.
- **Pure calculation functions** live in `src/lib` (`scoring.ts`,
  `forecast.ts`, `scenario.ts`, `rankings.ts`, `compare.ts`, `freshness.ts`,
  `csv.ts`), fully unit-tested and free of UI imports.
- **Persistence:** theme, watchlist, compare selection, and saved forecast
  scenarios live in `localStorage` (via a `useSyncExternalStore`-based hook —
  SSR-safe, no hydration mismatches). Ranking filters serialize to URL query
  params for shareable state.

### Routes

| Route | Purpose |
|---|---|
| `/` | Executive dashboard: KPIs, top-3 podium, top-10 chart, opportunity-vs-friction quadrant, signal cards, category heatmap, first-wave allocation |
| `/rankings` | Filterable/sortable table of all 51 franchises, CSV export, watchlist, compare selection |
| `/franchises/[slug]` | Full dossier: assessment, radar + table, contribution waterfall, evidence cards, merch strategy, product matrix, licensing, competitive landscape, forecast, sources drawer |
| `/compare` | Up to 4 franchises side by side with a deterministic template-generated summary (no AI API) |
| `/forecast` | Forecast Lab: weight sliders, scenario controls, presets, instant re-ranking, JSON export/import |
| `/benchmarks` | Top Sony opportunities vs the 5 non-Sony benchmarks |
| `/methodology` | The full model, written for executives and auditable by analysts |
| `/data-room` | Internal research management: dataset health, stale-data alerts, validation report, exports |

## Data model

Seed data lives in typed files under `src/data/` — never inside page components:

```
src/data/franchises.ts        # assembly + Zod validation of all 51 records
src/data/franchises/top10.ts  # ranks 1–10, analyst-authored detail
src/data/franchises/benchmarks5.ts  # the 5 non-Sony benchmarks
src/data/franchises/catalog.ts      # ranks 11+ (compact seeds, incl. Saros)
src/data/franchises/build.ts        # deterministic seed → Franchise builder
src/data/sources.ts           # research source registry
src/data/productCategories.ts # the 14 merchandise categories
src/data/forecastAssumptions.ts # catalysts, allocation, base assumptions
src/data/methodology.ts       # editorial methodology content + formula text
src/data/insights.ts          # dashboard "Signal detected" cards
```

Types are in `src/lib/types.ts`, and the matching Zod schemas in
`src/lib/schemas.ts`. The schema extends the brief's interfaces with:
`audienceType`, `isBenchmark`, `benchmarkAssessment`, `confidenceComponents`,
`criterionProvenance`, `forecastDrivers`, `forecastRiskFlags`,
`merchandiseStrategy`, `moqRisk` per category assessment, and a nullable
`value` on evidence metrics (null renders as “Not publicly reported”, never 0).

## Scoring, confidence, and forecast methodology

Full prose lives at `/methodology`; the executable versions are in `src/lib`.

- **Overall score** = weighted 8-criterion sum × 10 (weights: brand 22%,
  momentum 18%, fandom 15%, visual 15%, licensing 12%, demographic 8%,
  pricing 5%, whitespace 5%). Unit tests reproduce all top-10 seed scores
  within ±0.1, and a Zod refinement enforces it for all 51 records.
- **Two outputs:** the **Raw Demand Score** excludes licensing feasibility and
  whitespace and reweights the rest (modeled view); the **Actionability
  Score** is the full weighted model and is the primary ranking axis — which
  is why Marvel's Spider-Man tops raw demand but ranks #7.
- **Confidence** = six evidence components weighted 25/20/15/15/15/10, banded
  High ≥80 / Medium ≥60 / Low <60, always displayed as text + icon + number.
- **Forecast:** `projected = current + release + media + engagement +
  whitespace − licensingDelay − saturation − staleness`, calibrated at the
  12-month horizon (month 6 realizes 55%, month 24 decays gains to 85% while
  drags compound ×1.35). Bands widen for low confidence, unconfirmed
  catalysts, multi-party licensing, volatile live-service engagement, and
  stale disclosures. Every forecast carries the mandatory disclaimer.
- **Source tiers:** Tier 1 official/publisher · Tier 2 industry analytics ·
  Tier 3 community/retail proxies · Modeled internal calculation — visually
  distinguished everywhere via the tier badges.
- **Freshness:** Current (≤180 days) · Review soon (≤365) · Stale (>365) ·
  Unknown, measured against the research as-of date (2026-07-16), not the
  wall clock, so rendering stays deterministic.

### July 2026 research update

A web-research pass on 2026-07-16 incorporated releases since the original
snapshot: **Ghost of Yōtei** (Oct 2025; 3.3M+ first-month units per Sony's
FY25 Q2 earnings, plus the Legends co-op mode) now backs Ghost of Tsushima's
momentum as observed evidence; **Death Stranding 2: On the Beach** (June 2025,
PC planned 2026) replaced Death Stranding's unconfirmed catalyst; **Helldivers
2** gained its Xbox launch (Aug 2025) and the reported ~20M-copies milestone
(tier-2, flagged as reported); and **Saros** (Housemarque's new Sony IP,
released April 30, 2026) was added as franchise #51 at rank 30 with modeled
criterion scores and Medium confidence. The original seed top-50's relative
order is preserved exactly; unit tests enforce it. **Marvel's Wolverine**
(confirmed for Sept 15, 2026) is deliberately excluded until release — as
Marvel IP it would inherit Spider-Man's licensing profile.

## Documented assumptions

The brief supplied exact criterion scores only for ranks 1–10. For ranks
11–50 the criterion vectors are **internal model estimates** calibrated so the
weighted formula reproduces the published seed score exactly; they are marked
`criterionProvenance: "modeled"` and every UI surface labels them as modeled.
Other assumptions:

- `actionabilityScore` equals the overall weighted score (the weights already
  price in licensing and whitespace); `rawDemandScore` is the modeled
  friction-free view. Both are documented in `/methodology`.
- Confidence components, forecast drivers, product-category assessments, and
  price bands outside the research snapshot are deterministic derivations in
  `src/data/franchises/build.ts`, flagged as modeled.
- Catalysts are deliberately generic (`unconfirmed-mainline-release`,
  `q4-gifting`, …). Unconfirmed entries are labeled scenario assumptions and
  widen forecast bands; no rumored release is presented as announced.
- Some sources intentionally lack `publishedAt` (the pages are undated); the
  Data Room surfaces them and freshness falls back to the access date.

## Adding or updating a franchise

1. Add/edit a seed record in `src/data/franchises/top10.ts`,
   `benchmarks5.ts`, or `catalog.ts` (compact seeds use the `compact()`
   helper). Ranks must stay contiguous from 1 and ordered by
   `actionabilityScore` — Zod enforces both.
2. Make the criterion scores reproduce `seedScore` under the weights
   (±0.1) — `npm test` tells you the exact computed value if they don't.
3. Register any new sources in `src/data/sources.ts` and reference them via
   `sourceIds` (tests reject unknown IDs).
4. Run `npm test` — the dataset is re-validated end to end.

To update a source, edit `src/data/sources.ts` (set `publishedAt` when known,
bump `accessedAt`). Advance `RESEARCH_AS_OF` in `src/lib/freshness.ts` when a
research pass completes.

## Inserting licensed images

See [`public/franchise-assets/README.md`](public/franchise-assets/README.md).
Short version: drop `<slug>-hero.webp` / `<slug>-logo.svg` /
`<slug>-thumb.webp` into `public/franchise-assets/` and set the corresponding
field on the franchise seed. Until then every franchise renders an original
abstract placeholder — no copyrighted artwork ships with the app.

## Testing

- **Unit + component (Vitest, jsdom):** weighted-score reproduction of all
  seed scores, label thresholds, weight normalization, confidence math,
  forecast bands and widening rules, ranking sort/filter, CSV escaping,
  missing-data handling, scenario engine (research model reproduces the
  default ranking exactly; Family-gifting preset raises Astro Bot), plus
  component tests for the confidence indicator, source badge, metric value,
  and Forecast Lab weight sliders. Run: `npm test`.
- **E2E (Playwright, Chromium):** `npm run build` first, then `npm run e2e`.
  1. `/rankings` → filter to Sony/PlayStation-led → select Helldivers 2 and
     Astro Bot → open `/compare` → both appear.
  2. `/forecast` → apply Family gifting preset → Astro Bot rises vs default →
     export the scenario JSON.
  The config points at the environment's pre-installed Chromium
  (`/opt/pw-browsers/chromium`); override with `PLAYWRIGHT_CHROMIUM_PATH` or
  remove `executablePath` after `npx playwright install chromium`.

## Exports

- **Rankings CSV** — current filtered rows, from `/rankings`.
- **Scenario JSON** — export/import in the Forecast Lab (imports are
  Zod-validated; invalid files are rejected without changing state).
- **Data Room** — full dataset JSON, franchises CSV, and a source-audit CSV.
  The Data Room JSON "import" is validation-only: it reports schema results
  and never silently overwrites verified seed data.

## Limitations

- The dataset is a static research snapshot (as of 2026-07-10). Nothing is
  fetched at render time; there is no live data, scraping, or ingestion. If an
  ingestion utility is ever added it must respect site terms, rate-limit,
  cache, mark imports unverified until approved, and never silently overwrite
  verified data.
- Criterion detail beyond the top 10, product assessments, price bands outside
  the research snapshot, and all forecasts are model outputs, not market data.
- Forecast scores are directional scenarios based on available market
  indicators, model weights, catalyst assumptions, licensing friction, and
  merchandise-market evidence. **They are not predictions of actual sales or
  profit.**
- Licensing analysis is commercial analysis, not legal advice.
- **No authentication (by design).** The tool targets an internal network. If
  it ever needs auth, the clean seam is Next.js middleware (`middleware.ts`)
  in front of all routes — e.g. an OIDC/SSO check via Auth.js — plus moving
  the Data Room exports behind route handlers so access can be logged.
  No fake login screen is shipped.

## Trademark disclaimer

Franchise names and trademarks belong to their respective owners and are
referenced for identification only. LootSignal's rankings and forecasts are
internal commercial analysis and imply no endorsement, affiliation, or
sponsorship by any rights holder. No copyrighted game artwork, logos, or
screenshots are bundled with this application.
