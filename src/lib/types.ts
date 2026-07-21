/**
 * Core domain types for LootSignal.
 * Seed data lives in /src/data and is validated with Zod at module load
 * (see src/lib/schemas.ts). Keep these in sync with the schemas.
 */

export type OwnershipType =
  | "sony-owned"
  | "playstation-led"
  | "sony-partner"
  | "non-sony"
  | "legacy";

export type RecommendationLevel =
  | "priority"
  | "strong-pursuit"
  | "selective-pursuit"
  | "test-or-monitor"
  | "niche-only"
  | "deprioritize";

export type SourceTier = "tier-1" | "tier-2" | "tier-3" | "modeled";

export type AudienceType =
  | "broad"
  | "family"
  | "teen-young-adult"
  | "adult"
  | "collector-niche";

export type FreshnessStatus = "current" | "review-soon" | "stale" | "unknown";

export type CriterionKey =
  | "brandRecognition"
  | "momentum"
  | "fandomEngagement"
  | "visualSuitability"
  | "licensingFeasibility"
  | "demographicFit"
  | "priceElasticity"
  | "whitespace";

export type CriterionScores = Record<CriterionKey, number>;

/** 0–100 inputs to the confidence model, weighted per methodology. */
export interface ConfidenceComponents {
  officialSalesEvidence: number;
  sourceRecency: number;
  sourceDiversity: number;
  engagementEvidence: number;
  merchEvidence: number;
  licensingEvidence: number;
}

export interface EvidenceMetric {
  id: string;
  label: string;
  /** null = not publicly reported; never store 0 for missing data. */
  value: number | string | null;
  unit?: string;
  asOfDate?: string;
  sourceIds: string[];
  sourceTier: SourceTier;
  /** 0–100 confidence in this specific metric. */
  confidence: number;
  isModeled: boolean;
  note?: string;
}

export interface MerchandiseCategoryAssessment {
  categoryId: string;
  /** 1–5 scales throughout. */
  opportunity: number;
  marginPotential: number;
  productionComplexity: number;
  moqRisk: number;
  shippingDifficulty: number;
  returnRisk: number;
  competition: number;
  recommendedTestQuantity?: string;
  recommendation: string;
}

export type ForecastHorizon = 0 | 6 | 12 | 24;

export interface ForecastPoint {
  horizonMonths: ForecastHorizon;
  projectedScore: number;
  lowCase: number;
  highCase: number;
  assumptions: string[];
  catalystIds: string[];
}

export interface Catalyst {
  id: string;
  label: string;
  type: "release" | "media" | "seasonal" | "live-service" | "anniversary";
  confirmed: boolean;
  expectedWindow?: string;
  note: string;
}

/** Inputs to the franchise forecast, all in overall-score points. */
export interface ForecastDrivers {
  releaseCatalystAdjustment: number;
  mediaCatalystAdjustment: number;
  engagementTrendAdjustment: number;
  merchWhitespaceAdjustment: number;
  licensingDelayAdjustment: number;
  saturationAdjustment: number;
  stalenessAdjustment: number;
}

/** Flags that widen the forecast confidence band. */
export interface ForecastRiskFlags {
  unconfirmedCatalysts: boolean;
  multiPartyLicensing: boolean;
  volatileEngagement: boolean;
  staleDisclosures: boolean;
}

export interface MerchandiseStrategy {
  heroProducts: string[];
  visualThemes: string[];
  categoriesToAvoid: string[];
  launchModel: string;
  bundles: string[];
  seasonalOpportunities: string[];
  premiumVsVolume: string;
}

/**
 * Who owns the IP and who an ecommerce team would bid against for a
 * merchandise license. Ownership is public record; competing-licensee
 * lists are observed where sourced and research estimates otherwise.
 */
export interface RightsProfile {
  /** Legal owner of the franchise IP. */
  rightsHolder: string;
  parentCompany?: string;
  /** The practical route to a merchandise license. */
  licensingVia: string;
  /** Extra parties whose approval a license would also need. */
  additionalStakeholders: string[];
  /** Existing licensees / programs competing for the same license space. */
  competingLicensees: string[];
}

/** A named manufacturer holding (or having held) a collectible line. */
export interface CollectibleSupplier {
  name: string;
  /** What they make for this franchise. */
  products: string;
  /** observed = product line verified in the 2026-07 supplier scan; reported = widely documented but not re-verified. */
  status: "observed" | "reported";
}

export interface BenchmarkAssessment {
  audienceScale: string;
  collectorBehavior: string;
  productBreadth: string;
  bestFormats: string;
  smallCompanyPracticality: string;
}

export interface Franchise {
  id: string;
  slug: string;
  name: string;
  ownershipType: OwnershipType;
  audienceType: AudienceType;
  /** True for the five designated non-Sony benchmark franchises. */
  isBenchmark: boolean;
  benchmarkAssessment?: BenchmarkAssessment;
  rank: number;
  /** Weighted 8-criterion score (0–100). This IS the actionability view. */
  overallScore: number;
  /** Consumer/fandom potential largely ignoring rights friction (0–100). */
  rawDemandScore: number;
  /** Primary ranking axis; equals overallScore under the research model. */
  actionabilityScore: number;
  confidenceScore: number;
  confidenceComponents: ConfidenceComponents;
  recommendation: RecommendationLevel;
  commercialRead: string;
  executiveSummary: string;
  mainOpportunity: string;
  mainRisk: string;
  criterionScores: CriterionScores;
  /** "research" = analyst-authored; "modeled" = internal estimate. */
  criterionProvenance: "research" | "modeled";
  evidence: EvidenceMetric[];
  bestCategories: string[];
  targetDemographics: string[];
  suggestedPriceBands: Record<string, string>;
  /** 1–10; 10 = hardest licensing path. */
  licensingComplexity: number;
  licensingNotes: string[];
  rightsProfile: RightsProfile;
  collectibleSuppliers: CollectibleSupplier[];
  requiresLicenseWarning: boolean;
  competitiveLandscape: string[];
  whitespaceOpportunities: string[];
  merchandiseStrategy: MerchandiseStrategy;
  productAssessments: MerchandiseCategoryAssessment[];
  forecastDrivers: ForecastDrivers;
  forecastRiskFlags: ForecastRiskFlags;
  forecasts: ForecastPoint[];
  catalystIds: string[];
  sourceIds: string[];
  lastVerifiedAt: string;
  heroImage?: string | null;
  logoImage?: string | null;
  thumbnailImage?: string | null;
}

export interface ResearchSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  accessedAt: string;
  tier: SourceTier;
  notes?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  /** Baseline operational profile, 1–5 scales. */
  baseProductionComplexity: number;
  baseMoqRisk: number;
  baseShippingDifficulty: number;
  baseReturnRisk: number;
  defaultTestQuantity: string;
  notes: string;
}
