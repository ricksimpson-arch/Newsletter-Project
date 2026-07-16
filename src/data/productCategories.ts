import { z } from "zod";

import { productCategorySchema } from "@/lib/schemas";
import type { ProductCategory } from "@/lib/types";

/**
 * The 14 merchandise categories LootSignal evaluates. Baseline operational
 * profiles (1–5) reflect the category, before franchise-specific factors.
 */
const RAW_CATEGORIES: ProductCategory[] = [
  {
    id: "tshirts",
    name: "T-shirts",
    baseProductionComplexity: 1,
    baseMoqRisk: 1,
    baseShippingDifficulty: 1,
    baseReturnRisk: 2,
    defaultTestQuantity: "50–150 units across 2 designs",
    notes: "Lowest-risk entry category; print-on-demand viable for tests.",
  },
  {
    id: "hoodies",
    name: "Hoodies",
    baseProductionComplexity: 2,
    baseMoqRisk: 2,
    baseShippingDifficulty: 2,
    baseReturnRisk: 3,
    defaultTestQuantity: "30–80 units, size-curve weighted",
    notes: "Higher AOV than tees; size curves increase inventory exposure.",
  },
  {
    id: "headwear",
    name: "Headwear",
    baseProductionComplexity: 2,
    baseMoqRisk: 2,
    baseShippingDifficulty: 1,
    baseReturnRisk: 1,
    defaultTestQuantity: "50–100 units, 1–2 styles",
    notes: "Embroidery suits subtle marks; one-size reduces return risk.",
  },
  {
    id: "pins-patches",
    name: "Pins & patches",
    baseProductionComplexity: 2,
    baseMoqRisk: 3,
    baseShippingDifficulty: 1,
    baseReturnRisk: 1,
    defaultTestQuantity: "100–300 units per design",
    notes: "Strong collector behavior; tooling MOQs apply per design.",
  },
  {
    id: "posters-prints",
    name: "Posters & prints",
    baseProductionComplexity: 1,
    baseMoqRisk: 1,
    baseShippingDifficulty: 3,
    baseReturnRisk: 2,
    defaultTestQuantity: "25–100 prints, small run",
    notes: "Art-led; tube shipping adds cost but print runs are flexible.",
  },
  {
    id: "plush",
    name: "Plush",
    baseProductionComplexity: 4,
    baseMoqRisk: 4,
    baseShippingDifficulty: 2,
    baseReturnRisk: 2,
    defaultTestQuantity: "300–500 units (typical factory MOQ)",
    notes: "Toyetic IP only; factory MOQs and safety testing raise the bar.",
  },
  {
    id: "drinkware",
    name: "Drinkware",
    baseProductionComplexity: 2,
    baseMoqRisk: 2,
    baseShippingDifficulty: 4,
    baseReturnRisk: 3,
    defaultTestQuantity: "72–144 units",
    notes: "Giftable staple; breakage and weight complicate shipping.",
  },
  {
    id: "desk-accessories",
    name: "Desk accessories",
    baseProductionComplexity: 2,
    baseMoqRisk: 2,
    baseShippingDifficulty: 2,
    baseReturnRisk: 1,
    defaultTestQuantity: "100–200 units (mats), 50–100 (objects)",
    notes: "Desk mats, stands, organizers; strong fit for PC-adjacent fandoms.",
  },
  {
    id: "jewelry",
    name: "Jewelry",
    baseProductionComplexity: 4,
    baseMoqRisk: 3,
    baseShippingDifficulty: 1,
    baseReturnRisk: 3,
    defaultTestQuantity: "50–100 pieces",
    notes: "High AOV for symbol-rich IP; quality expectations are premium.",
  },
  {
    id: "bags",
    name: "Bags",
    baseProductionComplexity: 3,
    baseMoqRisk: 3,
    baseShippingDifficulty: 2,
    baseReturnRisk: 2,
    defaultTestQuantity: "50–150 units",
    notes: "Totes to technical bags; complexity scales with construction.",
  },
  {
    id: "journals-stationery",
    name: "Journals & stationery",
    baseProductionComplexity: 2,
    baseMoqRisk: 2,
    baseShippingDifficulty: 1,
    baseReturnRisk: 1,
    defaultTestQuantity: "100–250 units",
    notes: "Low return risk; pairs well with lore-rich and stylish IP.",
  },
  {
    id: "premium-collectibles",
    name: "Premium collectibles",
    baseProductionComplexity: 5,
    baseMoqRisk: 5,
    baseShippingDifficulty: 4,
    baseReturnRisk: 4,
    defaultTestQuantity: "Pre-order gated; avoid inventory risk",
    notes: "Statues and high-end replicas; tooling costs demand pre-orders.",
  },
  {
    id: "home-goods",
    name: "Home goods",
    baseProductionComplexity: 3,
    baseMoqRisk: 3,
    baseShippingDifficulty: 3,
    baseReturnRisk: 2,
    defaultTestQuantity: "50–150 units",
    notes: "Candles, blankets, décor; giftable and seasonal-friendly.",
  },
  {
    id: "youth-products",
    name: "Youth products",
    baseProductionComplexity: 3,
    baseMoqRisk: 3,
    baseShippingDifficulty: 1,
    baseReturnRisk: 2,
    defaultTestQuantity: "100–200 units",
    notes: "Kids' apparel and accessories; safety compliance required.",
  },
];

export const productCategories: ProductCategory[] = z
  .array(productCategorySchema)
  .length(14)
  .parse(RAW_CATEGORIES);

export const productCategoryById = new Map(productCategories.map((c) => [c.id, c]));

export function categoryName(id: string): string {
  return productCategoryById.get(id)?.name ?? id;
}
