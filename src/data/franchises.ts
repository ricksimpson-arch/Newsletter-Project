import { buildFranchise } from "@/data/franchises/build";
import { BENCHMARK_SEEDS } from "@/data/franchises/benchmarks5";
import { CATALOG_SEEDS } from "@/data/franchises/catalog";
import { TOP10_SEEDS } from "@/data/franchises/top10";
import { franchiseListSchema } from "@/lib/schemas";
import type { Franchise } from "@/lib/types";

/**
 * The full franchise dataset, built deterministically from seed
 * records and validated with Zod at module load. Invalid seed data
 * throws immediately — the app fails loudly rather than rendering
 * unverified numbers.
 */
const ALL_SEEDS = [...TOP10_SEEDS, ...BENCHMARK_SEEDS, ...CATALOG_SEEDS];

const built = ALL_SEEDS.map(buildFranchise).sort((a, b) => a.rank - b.rank);

export const franchises: Franchise[] = franchiseListSchema.parse(built) as Franchise[];

export const franchiseBySlug = new Map(franchises.map((f) => [f.slug, f]));

export const benchmarkFranchises = franchises.filter((f) => f.isBenchmark);

export const sonyLedFranchises = franchises.filter((f) => f.ownershipType !== "non-sony");
