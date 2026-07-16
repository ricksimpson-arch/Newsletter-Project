/**
 * Editorial content for the /methodology page and read-only formula
 * display in the Data Room. Formulas are shown as text; the executable
 * versions live in src/lib and are unit-tested against seed data.
 */

export const FORMULA_TEXT = {
  overallScore: `overallScore = (
  brandRecognition * 0.22 + momentum * 0.18 + fandomEngagement * 0.15 +
  visualSuitability * 0.15 + licensingFeasibility * 0.12 +
  demographicFit * 0.08 + priceElasticity * 0.05 + whitespace * 0.05
) * 10`,
  rawDemand: `rawDemandScore = (
  brandRecognition * 0.28 + momentum * 0.22 + fandomEngagement * 0.20 +
  visualSuitability * 0.15 + demographicFit * 0.10 + priceElasticity * 0.05
) * 10   // licensing feasibility and whitespace excluded (modeled view)`,
  confidence: `confidenceScore = officialSalesEvidence*0.25 + sourceRecency*0.20 +
  sourceDiversity*0.15 + engagementEvidence*0.15 +
  merchEvidence*0.15 + licensingEvidence*0.10`,
  forecast: `projectedOpportunity = currentOpportunity
  + releaseCatalystAdjustment + mediaCatalystAdjustment
  + engagementTrendAdjustment + merchWhitespaceAdjustment
  - licensingDelayAdjustment - saturationAdjustment - stalenessAdjustment`,
} as const;

export interface MethodologySection {
  id: string;
  title: string;
  paragraphs: string[];
}

export const methodologySections: MethodologySection[] = [
  {
    id: "ip-level",
    title: "Why we evaluate at the IP level",
    paragraphs: [
      "Merchandise is built around persistent brands, characters, and symbols — not individual releases. A hoodie sells because of what God of War means to its owner, not because of a specific title's launch week. LootSignal therefore scores franchises at the IP level.",
      "Individual titles still matter: they act as momentum catalysts. A new mainline release, remake, or adaptation temporarily lifts awareness and purchase intent, which the forecast model captures as catalyst adjustments rather than as changes to the franchise's underlying identity.",
    ],
  },
  {
    id: "weighted-model",
    title: "The weighted model",
    paragraphs: [
      "Each franchise is scored 0–10 on eight criteria by the research team: brand recognition (22%), momentum (18%), fandom engagement (15%), visual suitability (15%), licensing feasibility (12%), demographic fit (8%), pricing power (5%), and competition/whitespace (5%). The weighted sum, multiplied by 10, is the 0–100 overall score.",
      "Weights encode a small-company thesis: awareness and heat drive discovery (40% combined), product-translatable visuals and engaged fandoms drive conversion (30%), and licensing feasibility is weighted enough (12%) to keep unactionable giants from topping the board.",
      "Criterion-level scores for the top 10 are analyst-authored from the research snapshot. For ranks 11–50 the breakdowns are internal model estimates calibrated to the published seed scores, and every surface that shows them says so.",
    ],
  },
  {
    id: "two-outputs",
    title: "Raw demand vs. actionability",
    paragraphs: [
      "The model produces two views. The Raw Demand Score measures consumer and fandom potential while largely ignoring rights friction — it excludes licensing feasibility and whitespace and reweights the remaining criteria. The Small-Company Actionability Score is the full weighted model, which prices in licensing complexity, market saturation, and operational exposure.",
      "The primary ranking uses actionability. This is why Marvel's Spider-Man — the highest raw-demand franchise in the dataset — ranks seventh: a rights stack spanning Sony Interactive, Insomniac, and Marvel plus a saturated market makes it close to unactionable for a small licensee.",
    ],
  },
  {
    id: "score-labels",
    title: "Score labels",
    paragraphs: [
      "Scores map to recommendation bands: 85–100 Priority, 80–84.9 Strong Pursuit, 75–79.9 Selective Pursuit, 68–74.9 Test or Monitor, 60–67.9 Niche Only, and below 60 Deprioritize. The interface keeps the bands visually distinct — not every good score is green — so the board reads as a portfolio, not a leaderboard.",
    ],
  },
  {
    id: "confidence-model",
    title: "The confidence model",
    paragraphs: [
      "Every franchise carries a 0–100 confidence score built from six evidence components: official sales evidence (25%), source recency (20%), source diversity (15%), engagement evidence (15%), merchandise-market evidence (15%), and licensing evidence (10%).",
      "Bands are High (80–100), Medium (60–79), and Low (below 60). Confidence is always displayed as text plus an icon and number — never color alone — and low-confidence franchises widen their forecast intervals automatically.",
    ],
  },
  {
    id: "forecast-model",
    title: "The forecast model",
    paragraphs: [
      "Forecasts project the opportunity score at 6, 12, and 24 months. Starting from the current score, the model adds release-catalyst, media-catalyst, engagement-trend, and merch-whitespace adjustments, then subtracts licensing-delay, saturation, and staleness drags. Adjustments are calibrated at the 12-month horizon; month 6 realizes about half of them, and by month 24 trend-led gains partially decay while structural drags compound.",
      "Every forecast carries low and high cases. Intervals widen for low-confidence franchises, unconfirmed releases, multi-party licensing, volatile live-service engagement, and older franchises without recent disclosures. Unconfirmed catalysts are scenario assumptions — the model never treats a rumor as an announcement.",
      "Forecast scores are directional scenarios based on available market indicators, model weights, catalyst assumptions, licensing friction, and merchandise-market evidence. They are not predictions of actual sales or profit.",
    ],
  },
  {
    id: "source-tiers",
    title: "Source-tier hierarchy",
    paragraphs: [
      "Tier 1 — publisher, developer, investor-relations, or official platform data. Tier 2 — established industry databases and analytics services. Tier 3 — community, streaming, retail, and search proxies. Modeled — internal calculation with no external source.",
      "Every displayed metric can show its source, tier, as-of date, and whether it is observed or modeled. Missing data is shown as “Not publicly reported” — never as zero — and modeled values are never presented as reported facts.",
    ],
  },
  {
    id: "freshness",
    title: "Freshness statuses",
    paragraphs: [
      "Dated records are tracked against the research as-of date with four statuses: Current (within 6 months), Review soon (6–12 months), Stale (older than 12 months), and Unknown (no date on record). The Data Room surfaces everything approaching or past its review threshold.",
    ],
  },
];
