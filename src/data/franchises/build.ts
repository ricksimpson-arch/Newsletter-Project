import { buildForecastSeries } from "@/lib/forecast";
import {
  clamp,
  computeConfidenceScore,
  computeRawDemandScore,
  recommendationForScore,
  roundScore,
} from "@/lib/scoring";
import type {
  AudienceType,
  CollectibleSupplier,
  ConfidenceComponents,
  CriterionScores,
  EvidenceMetric,
  ForecastDrivers,
  ForecastRiskFlags,
  Franchise,
  MerchandiseCategoryAssessment,
  MerchandiseStrategy,
  OwnershipType,
  RightsProfile,
} from "@/lib/types";
import { BASE_FORECAST_ASSUMPTIONS } from "@/data/forecastAssumptions";
import { productCategories } from "@/data/productCategories";

/**
 * Compact, analyst-authored seed record. The builder expands it into a
 * full Franchise deterministically — every derived value is a pure
 * function of the seed, so renders are stable and testable.
 */
export interface FranchiseSeed {
  rank: number;
  name: string;
  slug: string;
  ownershipType: OwnershipType;
  audienceType: AudienceType;
  isBenchmark?: boolean;
  benchmarkAssessment?: Franchise["benchmarkAssessment"];
  /** Published seed score (0–100); validated against the weighted formula. */
  seedScore: number;
  criterionScores: CriterionScores;
  criterionProvenance: "research" | "modeled";
  commercialRead: string;
  executiveSummary: string;
  mainOpportunity: string;
  mainRisk: string;
  bestCategories: string[];
  targetDemographics: string[];
  suggestedPriceBands?: Record<string, string>;
  licensingComplexity: number;
  licensingNotes: string[];
  /** Overrides merged over the ownership-based default rights profile. */
  rights?: Partial<RightsProfile>;
  /** Named collectible manufacturers from the 2026-07 supplier scan. */
  collectibleSuppliers?: CollectibleSupplier[];
  requiresLicenseWarning?: boolean;
  competitiveLandscape: string[];
  whitespaceOpportunities: string[];
  visualThemes: string[];
  strategy?: Partial<MerchandiseStrategy>;
  evidence?: EvidenceMetric[];
  /** True when official unit-sales disclosures exist in the evidence. */
  hasPublicSalesData?: boolean;
  confidenceComponents: ConfidenceComponents;
  drivers?: Partial<ForecastDrivers>;
  flags?: Partial<ForecastRiskFlags>;
  extraAssumptions?: Partial<Record<6 | 12 | 24, string[]>>;
  catalystIds?: string[];
  productOverrides?: Record<string, Partial<MerchandiseCategoryAssessment>>;
  sourceIds: string[];
  lastVerifiedAt: string;
}

function defaultDrivers(seed: FranchiseSeed): ForecastDrivers {
  const c = seed.criterionScores;
  const recency = seed.confidenceComponents.sourceRecency;
  const staleness =
    seed.ownershipType === "legacy" ? 1.2 : recency < 50 ? 0.9 : recency < 70 ? 0.5 : 0.25;
  return {
    releaseCatalystAdjustment: 0,
    mediaCatalystAdjustment: 0,
    engagementTrendAdjustment: roundScore(clamp((c.momentum - 5.5) * 0.5, -3, 3)),
    merchWhitespaceAdjustment: roundScore(clamp((c.whitespace - 5) * 0.2, 0, 2)),
    licensingDelayAdjustment: roundScore(clamp((10 - c.licensingFeasibility) * 0.18, 0, 2)),
    saturationAdjustment: roundScore(clamp((10 - c.whitespace) * 0.18, 0, 2.5)),
    stalenessAdjustment: staleness,
  };
}

function defaultFlags(seed: FranchiseSeed, catalystIds: string[]): ForecastRiskFlags {
  return {
    unconfirmedCatalysts: catalystIds.includes("unconfirmed-mainline-release"),
    multiPartyLicensing: seed.licensingComplexity >= 7,
    volatileEngagement: seed.criterionScores.momentum >= 8.7,
    staleDisclosures:
      seed.ownershipType === "legacy" || seed.confidenceComponents.sourceRecency < 45,
  };
}

/**
 * Default rights profile for Sony-family IP; non-Sony and partner seeds
 * override the holder (and often the licensee list) per franchise.
 * Competing-licensee entries are research estimates unless a registry
 * source documents the program (e.g. Fangamer collections).
 */
function defaultRightsProfile(seed: FranchiseSeed): RightsProfile {
  const sonyFamily = seed.ownershipType !== "non-sony";
  return {
    rightsHolder: sonyFamily ? "Sony Interactive Entertainment" : "See franchise override",
    parentCompany: sonyFamily ? "Sony Group Corporation" : undefined,
    licensingVia: sonyFamily
      ? "PlayStation official licensing program"
      : "Rights holder's licensing program",
    additionalStakeholders: [],
    competingLicensees: [
      "PlayStation Gear program apparel & accessory licensees",
      "Specialty game-merch retailers (e.g. Fangamer)",
      "Premium collectible manufacturers (statues, figures)",
    ],
  };
}

const RECOMMENDATION_TEXT: Record<number, string> = {
  5: "Lead category — include in the first wave.",
  4: "Strong candidate for early capsules.",
  3: "Test in small runs once lead categories prove out.",
  2: "Monitor; produce only with a proven design angle.",
  1: "Avoid for now — weak fit or unfavorable economics.",
};

function buildProductAssessments(seed: FranchiseSeed): MerchandiseCategoryAssessment[] {
  const c = seed.criterionScores;
  const competition = clamp(Math.round((10 - c.whitespace) / 2), 1, 5);
  return productCategories.map((category) => {
    const bestIndex = seed.bestCategories.indexOf(category.id);
    let opportunity: number;
    if (bestIndex >= 0) {
      opportunity = bestIndex < 3 ? 5 : 4;
    } else if (category.id === "plush" && seed.audienceType !== "family") {
      opportunity = 1;
    } else if (category.id === "youth-products") {
      opportunity = seed.audienceType === "family" || seed.audienceType === "broad" ? 3 : 1;
    } else if (category.id === "premium-collectibles") {
      opportunity = c.priceElasticity >= 8.4 ? 3 : 2;
    } else {
      opportunity = c.visualSuitability >= 8.5 ? 3 : 2;
    }

    let margin = clamp(Math.round(c.priceElasticity / 2), 1, 5);
    if (category.id === "premium-collectibles" || category.id === "plush") {
      margin = clamp(margin - 1, 1, 5); // tooling and factory costs eat margin
    }
    if (category.id === "jewelry" || category.id === "headwear") {
      margin = clamp(margin + 1, 1, 5);
    }

    const assessment: MerchandiseCategoryAssessment = {
      categoryId: category.id,
      opportunity,
      marginPotential: margin,
      productionComplexity: category.baseProductionComplexity,
      moqRisk: category.baseMoqRisk,
      shippingDifficulty: category.baseShippingDifficulty,
      returnRisk: category.baseReturnRisk,
      competition,
      recommendedTestQuantity: opportunity >= 3 ? category.defaultTestQuantity : undefined,
      recommendation: RECOMMENDATION_TEXT[opportunity],
    };
    return { ...assessment, ...seed.productOverrides?.[category.id] };
  });
}

function defaultStrategy(seed: FranchiseSeed): MerchandiseStrategy {
  const categoryNames = seed.bestCategories
    .slice(0, 3)
    .map((id) => productCategories.find((c) => c.id === id)?.name ?? id);
  const premium = seed.criterionScores.priceElasticity >= 8;
  return {
    heroProducts: categoryNames,
    visualThemes: seed.visualThemes,
    categoriesToAvoid:
      seed.audienceType === "family"
        ? ["Jewelry", "Premium collectibles (tooling-heavy)"]
        : ["Youth products (audience mismatch)"],
    launchModel:
      "Small capsule test (3–6 SKUs) via low-MOQ suppliers; scale winners into evergreen range.",
    bundles: ["Apparel + low-ticket accessory bundle to lift AOV"],
    seasonalOpportunities: ["Q4 holiday gifting window"],
    premiumVsVolume: premium
      ? "Premium orientation: fewer SKUs, elevated quality and packaging."
      : "Volume orientation: accessible price points, broader size runs.",
  };
}

function buildEvidence(seed: FranchiseSeed): EvidenceMetric[] {
  const evidence = [...(seed.evidence ?? [])];
  if (!seed.hasPublicSalesData) {
    evidence.push({
      id: `${seed.slug}-lifetime-units`,
      label: "Lifetime units sold",
      value: null,
      sourceIds: [],
      sourceTier: "modeled",
      confidence: 20,
      isModeled: true,
      note: "No official unit disclosure located during the research window.",
    });
  }
  if (seed.criterionProvenance === "modeled") {
    evidence.push({
      id: `${seed.slug}-criterion-basis`,
      label: "Criterion score basis",
      value: "Internal model estimate",
      sourceIds: ["lootsignal-internal-model"],
      sourceTier: "modeled",
      confidence: seed.confidenceComponents.engagementEvidence,
      isModeled: true,
      note: "Criterion-level breakdown outside the top 10 is an internal research estimate, not a published figure.",
    });
  }
  return evidence;
}

export function buildFranchise(seed: FranchiseSeed): Franchise {
  const catalystIds = seed.catalystIds ?? [];
  const drivers: ForecastDrivers = { ...defaultDrivers(seed), ...seed.drivers };
  const flags: ForecastRiskFlags = { ...defaultFlags(seed, catalystIds), ...seed.flags };
  const confidenceScore = roundScore(computeConfidenceScore(seed.confidenceComponents));

  const assumptions: Partial<Record<0 | 6 | 12 | 24, string[]>> = {};
  for (const horizon of [6, 12, 24] as const) {
    assumptions[horizon] = [
      ...BASE_FORECAST_ASSUMPTIONS[horizon],
      ...(seed.extraAssumptions?.[horizon] ?? []),
    ];
  }

  const forecasts = buildForecastSeries({
    currentOpportunity: seed.seedScore,
    drivers,
    flags,
    confidenceScore,
    assumptions,
    catalystIds,
  });

  return {
    id: seed.slug,
    slug: seed.slug,
    name: seed.name,
    ownershipType: seed.ownershipType,
    audienceType: seed.audienceType,
    isBenchmark: seed.isBenchmark ?? false,
    benchmarkAssessment: seed.benchmarkAssessment,
    rank: seed.rank,
    overallScore: seed.seedScore,
    rawDemandScore: roundScore(computeRawDemandScore(seed.criterionScores)),
    actionabilityScore: seed.seedScore,
    confidenceScore,
    confidenceComponents: seed.confidenceComponents,
    recommendation: recommendationForScore(seed.seedScore),
    commercialRead: seed.commercialRead,
    executiveSummary: seed.executiveSummary,
    mainOpportunity: seed.mainOpportunity,
    mainRisk: seed.mainRisk,
    criterionScores: seed.criterionScores,
    criterionProvenance: seed.criterionProvenance,
    evidence: buildEvidence(seed),
    bestCategories: seed.bestCategories,
    targetDemographics: seed.targetDemographics,
    suggestedPriceBands: seed.suggestedPriceBands ?? {},
    licensingComplexity: seed.licensingComplexity,
    licensingNotes: seed.licensingNotes,
    rightsProfile: { ...defaultRightsProfile(seed), ...seed.rights },
    collectibleSuppliers: seed.collectibleSuppliers ?? [],
    requiresLicenseWarning: seed.requiresLicenseWarning ?? seed.licensingComplexity >= 7,
    competitiveLandscape: seed.competitiveLandscape,
    whitespaceOpportunities: seed.whitespaceOpportunities,
    merchandiseStrategy: { ...defaultStrategy(seed), ...seed.strategy },
    productAssessments: buildProductAssessments(seed),
    forecastDrivers: drivers,
    forecastRiskFlags: flags,
    forecasts,
    catalystIds,
    sourceIds: seed.sourceIds,
    lastVerifiedAt: seed.lastVerifiedAt,
    heroImage: null,
    logoImage: null,
    thumbnailImage: null,
  };
}
