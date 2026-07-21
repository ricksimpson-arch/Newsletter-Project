import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TriangleAlertIcon } from "lucide-react";

import { CategoryHeatmap } from "@/components/category-heatmap";
import {
  LazyContributionChart,
  LazyCriteriaRadar,
  LazyForecastChart,
} from "@/components/charts/lazy";
import { FranchiseActions } from "@/components/franchise/franchise-actions";
import { FranchisePlaceholder } from "@/components/franchise/franchise-placeholder";
import { SourcesDrawer } from "@/components/franchise/sources-drawer";
import {
  ConfidenceIndicator,
  DirectionIndicator,
  FreshnessBadge,
  MetricValue,
  ModeledBadge,
  OwnershipBadge,
  RecommendationBadge,
  SourceTierBadge,
} from "@/components/indicators";
import { InfoTip } from "@/components/info-tip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { franchiseBySlug, franchises } from "@/data/franchises";
import { categoryName } from "@/data/productCategories";
import { sourceById } from "@/data/sources";
import { forecastDirection } from "@/lib/forecast";
import { freshnessStatus } from "@/lib/freshness";
import { CRITERION_DESCRIPTIONS, CRITERION_KEYS, CRITERION_LABELS } from "@/lib/scoring";

export function generateStaticParams() {
  return franchises.map((franchise) => ({ slug: franchise.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const franchise = franchiseBySlug.get(slug);
  if (!franchise) return { title: "Franchise not found" };
  return {
    title: `${franchise.name} — #${franchise.rank}`,
    description: franchise.commercialRead,
  };
}

export default async function FranchisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const franchise = franchiseBySlug.get(slug);
  if (!franchise) notFound();

  const connectedSources = franchise.sourceIds
    .map((id) => sourceById.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const direction = forecastDirection(franchise.forecasts);
  const strategy = franchise.merchandiseStrategy;

  return (
    <article className="space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <FranchisePlaceholder franchise={franchise} className="h-36 w-full lg:h-40 lg:w-72 shrink-0" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tnum rounded-md bg-secondary px-2 py-0.5 text-sm font-bold">
                #{franchise.rank}
              </span>
              <OwnershipBadge type={franchise.ownershipType} />
              <RecommendationBadge level={franchise.recommendation} />
              {franchise.isBenchmark && (
                <span className="rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                  Non-Sony benchmark
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{franchise.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="tnum text-2xl font-bold">{franchise.overallScore.toFixed(1)}</span>
              <ConfidenceIndicator score={franchise.confidenceScore} />
              <DirectionIndicator direction={direction} />
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                Last verified {franchise.lastVerifiedAt}
                <FreshnessBadge status={freshnessStatus(franchise.lastVerifiedAt)} />
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FranchiseActions slug={franchise.slug} name={franchise.name} />
              <SourcesDrawer sources={connectedSources} franchiseName={franchise.name} />
            </div>
          </div>
        </div>
        {franchise.requiresLicenseWarning && (
          <p className="flex items-start gap-2 rounded-lg border border-warning-risk/40 bg-warning-risk/10 p-3 text-sm">
            <TriangleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-warning-risk" />
            <span>
              <strong>Do not proceed without a license.</strong> This franchise involves elevated
              rights complexity; any product requires a fully scoped license before design work
              begins. This is commercial analysis, not legal advice.
            </span>
          </p>
        )}
      </header>

      {/* Executive assessment */}
      <section aria-labelledby="assessment">
        <h2 id="assessment" className="text-lg font-semibold">
          Executive commercial assessment
        </h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-3 py-4">
            <CardContent className="space-y-2 text-sm leading-relaxed">
              <p>{franchise.executiveSummary}</p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Why it ranks here:</strong> {franchise.commercialRead}.
              </p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm text-favorable">Main opportunity</CardTitle>
            </CardHeader>
            <CardContent className="px-4 text-sm">{franchise.mainOpportunity}</CardContent>
          </Card>
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm text-warning-risk">Main risk</CardTitle>
            </CardHeader>
            <CardContent className="px-4 text-sm">{franchise.mainRisk}</CardContent>
          </Card>
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Recommended posture</CardTitle>
            </CardHeader>
            <CardContent className="px-4 text-sm">{strategy.premiumVsVolume}</CardContent>
          </Card>
        </div>
      </section>

      {/* Criteria */}
      <section aria-labelledby="criteria" className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 id="criteria" className="text-lg font-semibold">
            Criterion profile
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {franchise.criterionProvenance === "research"
              ? "Analyst-authored scores from the research snapshot."
              : "Internal model estimates calibrated to the published score — treat as modeled."}
          </p>
          <div className="mt-3">
            <LazyCriteriaRadar franchises={[franchise]} />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Score contribution</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Weighted criterion contributions building to {franchise.overallScore.toFixed(1)}.
          </p>
          <div className="mt-3">
            <LazyContributionChart franchise={franchise} />
          </div>
        </div>
      </section>

      {/* Criterion table with tooltips */}
      <section aria-labelledby="criterion-detail">
        <h2 id="criterion-detail" className="sr-only">
          Criterion scores with explanations
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Criterion</TableHead>
                <TableHead className="text-right">Score (0–10)</TableHead>
                <TableHead>Basis</TableHead>
                <TableHead>What it measures</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CRITERION_KEYS.map((key) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1">
                      {CRITERION_LABELS[key]}
                      <InfoTip label={`About ${CRITERION_LABELS[key]}`}>
                        <p className="font-semibold">{CRITERION_LABELS[key]}</p>
                        <p className="mt-1">{CRITERION_DESCRIPTIONS[key]}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {franchise.criterionProvenance === "research" ? "Observed (analyst-authored)" : "Modeled estimate"} ·
                          last verified {franchise.lastVerifiedAt}
                        </p>
                      </InfoTip>
                    </span>
                  </TableCell>
                  <TableCell className="text-right tnum font-medium">
                    {franchise.criterionScores[key].toFixed(1)}
                  </TableCell>
                  <TableCell>
                    <ModeledBadge isModeled={franchise.criterionProvenance === "modeled"} />
                  </TableCell>
                  <TableCell className="max-w-md whitespace-normal text-xs text-muted-foreground">
                    {CRITERION_DESCRIPTIONS[key]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Evidence */}
      <section aria-labelledby="evidence">
        <h2 id="evidence" className="text-lg font-semibold">
          Evidence
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Every metric shows its source tier, as-of date, and whether it is observed or modeled.
          Missing data reads “Not publicly reported” — never zero.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {franchise.evidence.map((metric) => (
            <Card key={metric.id} className="py-4">
              <CardHeader className="px-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-snug">{metric.label}</CardTitle>
                  <SourceTierBadge tier={metric.sourceTier} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-4 text-sm">
                <p className="text-base">
                  <MetricValue value={metric.value} unit={metric.unit} />
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <ModeledBadge isModeled={metric.isModeled} />
                  {metric.asOfDate && <span className="tnum">as of {metric.asOfDate}</span>}
                  <span className="tnum">confidence {Math.round(metric.confidence)}/100</span>
                </div>
                {metric.sourceIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {metric.sourceIds
                      .map((id) => sourceById.get(id)?.publisher ?? id)
                      .join(" · ")}
                  </p>
                )}
                {metric.note && <p className="text-xs text-muted-foreground">{metric.note}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Merchandise strategy */}
      <section aria-labelledby="strategy">
        <h2 id="strategy" className="text-lg font-semibold">
          Merchandise strategy
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StrategyCard title="Best categories">
            <ul className="list-disc space-y-1 pl-4">
              {franchise.bestCategories.map((id) => (
                <li key={id}>{categoryName(id)}</li>
              ))}
            </ul>
          </StrategyCard>
          <StrategyCard title="Hero products">
            <ul className="list-disc space-y-1 pl-4">
              {strategy.heroProducts.map((product) => (
                <li key={product}>{product}</li>
              ))}
            </ul>
          </StrategyCard>
          <StrategyCard title="Suggested price bands">
            {Object.keys(franchise.suggestedPriceBands).length === 0 ? (
              <p className="italic text-muted-foreground">Not modeled for this franchise yet.</p>
            ) : (
              <dl className="space-y-1">
                {Object.entries(franchise.suggestedPriceBands).map(([category, band]) => (
                  <div key={category} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{category}</dt>
                    <dd className="tnum">{band}</dd>
                  </div>
                ))}
              </dl>
            )}
          </StrategyCard>
          <StrategyCard title="Target demographics">
            <ul className="list-disc space-y-1 pl-4">
              {franchise.targetDemographics.map((demo) => (
                <li key={demo}>{demo}</li>
              ))}
            </ul>
          </StrategyCard>
          <StrategyCard title="Visual themes">
            <ul className="list-disc space-y-1 pl-4">
              {strategy.visualThemes.map((theme) => (
                <li key={theme}>{theme}</li>
              ))}
            </ul>
          </StrategyCard>
          <StrategyCard title="Categories to avoid">
            {strategy.categoriesToAvoid.length === 0 ? (
              <p className="italic text-muted-foreground">No exclusions noted.</p>
            ) : (
              <ul className="list-disc space-y-1 pl-4">
                {strategy.categoriesToAvoid.map((category) => (
                  <li key={category}>{category}</li>
                ))}
              </ul>
            )}
          </StrategyCard>
          <StrategyCard title="Launch model" className="md:col-span-2">
            <p>{strategy.launchModel}</p>
            {strategy.bundles.length > 0 && (
              <p className="mt-2 text-muted-foreground">
                <strong className="text-foreground">Bundles:</strong> {strategy.bundles.join(" · ")}
              </p>
            )}
          </StrategyCard>
          <StrategyCard title="Seasonal opportunities">
            {strategy.seasonalOpportunities.length === 0 ? (
              <p className="italic text-muted-foreground">None identified.</p>
            ) : (
              <ul className="list-disc space-y-1 pl-4">
                {strategy.seasonalOpportunities.map((season) => (
                  <li key={season}>{season}</li>
                ))}
              </ul>
            )}
          </StrategyCard>
        </div>
      </section>

      {/* Product opportunity matrix */}
      <section aria-labelledby="product-matrix">
        <h2 id="product-matrix" className="text-lg font-semibold">
          Product opportunity matrix
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          All values 1–5. Derived from the internal category model plus franchise-specific
          research — treat as modeled guidance, not market data.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Demand</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Production</TableHead>
                <TableHead className="text-right">MOQ risk</TableHead>
                <TableHead className="text-right">Shipping</TableHead>
                <TableHead className="text-right">Returns</TableHead>
                <TableHead className="text-right">Competition</TableHead>
                <TableHead>Test quantity</TableHead>
                <TableHead>Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...franchise.productAssessments]
                .sort((a, b) => b.opportunity - a.opportunity)
                .map((assessment) => (
                  <TableRow key={assessment.categoryId}>
                    <TableCell className="font-medium">{categoryName(assessment.categoryId)}</TableCell>
                    <TableCell className="text-right tnum">{assessment.opportunity}</TableCell>
                    <TableCell className="text-right tnum">{assessment.marginPotential}</TableCell>
                    <TableCell className="text-right tnum">{assessment.productionComplexity}</TableCell>
                    <TableCell className="text-right tnum">{assessment.moqRisk}</TableCell>
                    <TableCell className="text-right tnum">{assessment.shippingDifficulty}</TableCell>
                    <TableCell className="text-right tnum">{assessment.returnRisk}</TableCell>
                    <TableCell className="text-right tnum">{assessment.competition}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {assessment.recommendedTestQuantity ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal text-xs">
                      {assessment.recommendation}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Licensing */}
      <section aria-labelledby="licensing" className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 id="licensing" className="text-lg font-semibold">
            Licensing analysis
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Commercial analysis only — not legal advice.
          </p>
          <div className="mt-3 rounded-lg border p-4">
            <p className="text-sm">
              <span className="font-medium">Approval complexity:</span>{" "}
              <span className="tnum font-semibold">{franchise.licensingComplexity}/10</span>
              {franchise.licensingComplexity >= 7
                ? " — hard path; expect multiple stakeholders."
                : franchise.licensingComplexity >= 5
                  ? " — moderate path."
                  : " — comparatively friendly path."}
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-4 text-sm">
              {franchise.licensingNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          <div className="mt-3 rounded-lg border p-4">
            <h3 className="text-sm font-medium">Rights ownership</h3>
            <dl className="mt-2 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rights holder
                </dt>
                <dd className="mt-0.5">
                  {franchise.rightsProfile.rightsHolder}
                  {franchise.rightsProfile.parentCompany && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {franchise.rightsProfile.parentCompany}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  License route
                </dt>
                <dd className="mt-0.5">{franchise.rightsProfile.licensingVia}</dd>
              </div>
              {franchise.rightsProfile.additionalStakeholders.length > 0 && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Additional stakeholders
                  </dt>
                  <dd className="mt-0.5">
                    <ul className="list-disc space-y-1 pl-4">
                      {franchise.rightsProfile.additionalStakeholders.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <div className="mt-3 rounded-lg border border-opportunity/40 bg-opportunity/5 p-4">
            <h3 className="text-sm font-medium">Who you&apos;d bid against for a license</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm">
              {franchise.rightsProfile.competingLicensees.map((licensee) => (
                <li key={licensee}>{licensee}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              IP is licensed, not bought outright — these are the existing licensees and programs
              occupying the merchandise-license space. Entries marked “observed” come from the
              source registry; the rest are research estimates.
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Competitive landscape</h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium">Official presence & saturation</h3>
              <ul className="mt-2 list-disc space-y-2 pl-4 text-sm">
                {franchise.competitiveLandscape.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium">Whitespace & differentiation</h3>
              <ul className="mt-2 list-disc space-y-2 pl-4 text-sm">
                {franchise.whitespaceOpportunities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Category heatmap for this franchise */}
      <section aria-labelledby="category-fit">
        <h2 id="category-fit" className="text-lg font-semibold">
          Category fit
        </h2>
        <div className="mt-3">
          <CategoryHeatmap
            franchises={[franchise]}
            caption={`Category opportunity scores for ${franchise.name}`}
          />
        </div>
      </section>

      {/* Forecast */}
      <section aria-labelledby="forecast">
        <h2 id="forecast" className="text-lg font-semibold">
          Forecast
        </h2>
        <div className="mt-3">
          <LazyForecastChart franchises={[franchise]} />
        </div>
        <div className="mt-4 rounded-lg border p-4">
          <h3 className="text-sm font-medium">Assumptions (12-month base case)</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {(franchise.forecasts.find((p) => p.horizonMonths === 12)?.assumptions ?? []).map(
              (assumption) => (
                <li key={assumption}>{assumption}</li>
              )
            )}
          </ul>
        </div>
      </section>
    </article>
  );
}

function StrategyCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`py-4 ${className ?? ""}`}>
      <CardHeader className="px-4">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 text-sm">{children}</CardContent>
    </Card>
  );
}
