import { z } from "zod";

import { computeOverallScore } from "@/lib/scoring";

const score010 = z.number().min(0).max(10);
const score0100 = z.number().min(0).max(100);
const score15 = z.number().min(1).max(5);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const ownershipTypeSchema = z.enum([
  "sony-owned",
  "playstation-led",
  "sony-partner",
  "non-sony",
  "legacy",
]);

export const recommendationLevelSchema = z.enum([
  "priority",
  "strong-pursuit",
  "selective-pursuit",
  "test-or-monitor",
  "niche-only",
  "deprioritize",
]);

export const sourceTierSchema = z.enum(["tier-1", "tier-2", "tier-3", "modeled"]);

export const audienceTypeSchema = z.enum([
  "broad",
  "family",
  "teen-young-adult",
  "adult",
  "collector-niche",
]);

export const criterionScoresSchema = z.object({
  brandRecognition: score010,
  momentum: score010,
  fandomEngagement: score010,
  visualSuitability: score010,
  licensingFeasibility: score010,
  demographicFit: score010,
  priceElasticity: score010,
  whitespace: score010,
});

export const confidenceComponentsSchema = z.object({
  officialSalesEvidence: score0100,
  sourceRecency: score0100,
  sourceDiversity: score0100,
  engagementEvidence: score0100,
  merchEvidence: score0100,
  licensingEvidence: score0100,
});

export const evidenceMetricSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.union([z.number(), z.string()]).nullable(),
  unit: z.string().optional(),
  asOfDate: isoDate.optional(),
  sourceIds: z.array(z.string()),
  sourceTier: sourceTierSchema,
  confidence: score0100,
  isModeled: z.boolean(),
  note: z.string().optional(),
});

export const merchandiseCategoryAssessmentSchema = z.object({
  categoryId: z.string().min(1),
  opportunity: score15,
  marginPotential: score15,
  productionComplexity: score15,
  moqRisk: score15,
  shippingDifficulty: score15,
  returnRisk: score15,
  competition: score15,
  recommendedTestQuantity: z.string().optional(),
  recommendation: z.string().min(1),
});

export const forecastPointSchema = z.object({
  horizonMonths: z.union([z.literal(0), z.literal(6), z.literal(12), z.literal(24)]),
  projectedScore: score0100,
  lowCase: score0100,
  highCase: score0100,
  assumptions: z.array(z.string()),
  catalystIds: z.array(z.string()),
});

export const catalystSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["release", "media", "seasonal", "live-service", "anniversary"]),
  confirmed: z.boolean(),
  expectedWindow: z.string().optional(),
  note: z.string().min(1),
});

export const forecastDriversSchema = z.object({
  releaseCatalystAdjustment: z.number().min(0).max(10),
  mediaCatalystAdjustment: z.number().min(0).max(10),
  engagementTrendAdjustment: z.number().min(-10).max(10),
  merchWhitespaceAdjustment: z.number().min(0).max(10),
  licensingDelayAdjustment: z.number().min(0).max(10),
  saturationAdjustment: z.number().min(0).max(10),
  stalenessAdjustment: z.number().min(0).max(10),
});

export const forecastRiskFlagsSchema = z.object({
  unconfirmedCatalysts: z.boolean(),
  multiPartyLicensing: z.boolean(),
  volatileEngagement: z.boolean(),
  staleDisclosures: z.boolean(),
});

export const merchandiseStrategySchema = z.object({
  heroProducts: z.array(z.string().min(1)).min(1),
  visualThemes: z.array(z.string().min(1)).min(1),
  categoriesToAvoid: z.array(z.string()),
  launchModel: z.string().min(1),
  bundles: z.array(z.string()),
  seasonalOpportunities: z.array(z.string()),
  premiumVsVolume: z.string().min(1),
});

export const franchiseSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    ownershipType: ownershipTypeSchema,
    audienceType: audienceTypeSchema,
    isBenchmark: z.boolean(),
    benchmarkAssessment: z
      .object({
        audienceScale: z.string().min(1),
        collectorBehavior: z.string().min(1),
        productBreadth: z.string().min(1),
        bestFormats: z.string().min(1),
        smallCompanyPracticality: z.string().min(1),
      })
      .optional(),
    rank: z.number().int().min(1),
    overallScore: score0100,
    rawDemandScore: score0100,
    actionabilityScore: score0100,
    confidenceScore: score0100,
    confidenceComponents: confidenceComponentsSchema,
    recommendation: recommendationLevelSchema,
    commercialRead: z.string().min(1),
    executiveSummary: z.string().min(1),
    mainOpportunity: z.string().min(1),
    mainRisk: z.string().min(1),
    criterionScores: criterionScoresSchema,
    criterionProvenance: z.enum(["research", "modeled"]),
    evidence: z.array(evidenceMetricSchema),
    bestCategories: z.array(z.string().min(1)).min(1),
    targetDemographics: z.array(z.string().min(1)).min(1),
    suggestedPriceBands: z.record(z.string(), z.string()),
    licensingComplexity: z.number().min(1).max(10),
    licensingNotes: z.array(z.string().min(1)).min(1),
    rightsProfile: z.object({
      rightsHolder: z.string().min(1),
      parentCompany: z.string().optional(),
      licensingVia: z.string().min(1),
      additionalStakeholders: z.array(z.string().min(1)),
      competingLicensees: z.array(z.string().min(1)).min(1),
    }),
    collectibleSuppliers: z.array(
      z.object({
        name: z.string().min(1),
        products: z.string().min(1),
        status: z.enum(["observed", "reported"]),
      })
    ),
    requiresLicenseWarning: z.boolean(),
    competitiveLandscape: z.array(z.string().min(1)).min(1),
    whitespaceOpportunities: z.array(z.string().min(1)).min(1),
    merchandiseStrategy: merchandiseStrategySchema,
    productAssessments: z.array(merchandiseCategoryAssessmentSchema).min(1),
    forecastDrivers: forecastDriversSchema,
    forecastRiskFlags: forecastRiskFlagsSchema,
    forecasts: z.array(forecastPointSchema).length(4),
    catalystIds: z.array(z.string()),
    sourceIds: z.array(z.string()).min(1),
    lastVerifiedAt: isoDate,
    heroImage: z.string().nullable().optional(),
    logoImage: z.string().nullable().optional(),
    thumbnailImage: z.string().nullable().optional(),
  })
  .superRefine((franchise, ctx) => {
    // The published overall score must be reproducible from the criterion
    // scores under the research-model weights (±0.1 rounding tolerance).
    const computed = computeOverallScore(franchise.criterionScores);
    if (Math.abs(computed - franchise.overallScore) > 0.1) {
      ctx.addIssue({
        code: "custom",
        message: `overallScore ${franchise.overallScore} does not match weighted formula result ${computed.toFixed(2)} for ${franchise.slug}`,
        path: ["overallScore"],
      });
    }
    for (const point of franchise.forecasts) {
      if (point.lowCase > point.projectedScore || point.highCase < point.projectedScore) {
        ctx.addIssue({
          code: "custom",
          message: `forecast band does not contain projected score at horizon ${point.horizonMonths} for ${franchise.slug}`,
          path: ["forecasts"],
        });
      }
    }
  });

export const researchSourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().url(),
  publishedAt: isoDate.optional(),
  accessedAt: isoDate,
  tier: sourceTierSchema,
  notes: z.string().optional(),
});

export const productCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  baseProductionComplexity: score15,
  baseMoqRisk: score15,
  baseShippingDifficulty: score15,
  baseReturnRisk: score15,
  defaultTestQuantity: z.string().min(1),
  notes: z.string().min(1),
});

export const franchiseListSchema = z
  .array(franchiseSchema)
  .superRefine((franchises, ctx) => {
    const bySlug = new Set<string>();
    for (const franchise of franchises) {
      if (bySlug.has(franchise.slug)) {
        ctx.addIssue({ code: "custom", message: `duplicate slug ${franchise.slug}` });
      }
      bySlug.add(franchise.slug);
    }
    const sorted = [...franchises].sort((a, b) => a.rank - b.rank);
    sorted.forEach((franchise, index) => {
      if (franchise.rank !== index + 1) {
        ctx.addIssue({
          code: "custom",
          message: `ranks must be contiguous starting at 1; found ${franchise.rank} at position ${index + 1}`,
        });
      }
    });
    // Ranking must be consistent with the primary axis (actionability).
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].actionabilityScore > sorted[i - 1].actionabilityScore + 1e-9) {
        ctx.addIssue({
          code: "custom",
          message: `rank order violates actionability ordering between ${sorted[i - 1].slug} and ${sorted[i].slug}`,
        });
      }
    }
  });
