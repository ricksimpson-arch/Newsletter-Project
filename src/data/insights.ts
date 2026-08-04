/**
 * Editorial "Signal detected" cards for the executive dashboard.
 * Each references a franchise in the dataset by slug.
 */
export interface SignalInsight {
  slug: string;
  headline: string;
  body: string;
  /** Semantic tone drives the accent treatment, never color alone. */
  tone: "opportunity" | "favorable" | "caution";
}

export const signalInsights: SignalInsight[] = [
  {
    slug: "helldivers-2",
    headline: "Wearable faction culture",
    body: "Helldivers 2 fans treat faction slogans and propaganda as identity. Wearables that read like in-universe recruitment material convert community identity into apparel.",
    tone: "opportunity",
  },
  {
    slug: "astro-bot",
    headline: "The gifting machine",
    body: "Astro Bot is toyetic, family-safe, and giftable — plush and pins with gift-ready packaging can own the PlayStation-household holiday niche.",
    tone: "favorable",
  },
  {
    slug: "ghost-of-tsushima",
    headline: "Premium through restraint",
    body: "Ghost of Tsushima rewards subtlety: clan symbols, brushwork, and autumn palettes support premium minimalist product no other franchise on the board can match.",
    tone: "favorable",
  },
  {
    slug: "marvels-spider-man",
    headline: "Huge demand, harder rights",
    body: "Marvel's Spider-Man posts the highest raw demand in the dataset — and a rights stack (Sony + Insomniac + Marvel + likenesses) that makes it strategic pursuit only.",
    tone: "caution",
  },
  {
    slug: "bloodborne",
    headline: "Cult IP, premium drops",
    body: "A decade on, Bloodborne merchandise still sells. Limited artist-led capsules fit the fandom's collector behavior and premium taste.",
    tone: "opportunity",
  },
  {
    slug: "gran-turismo",
    headline: "Automotive lifestyle, not gaming apparel",
    body: "Gran Turismo behaves like a car-culture brand: caps, jackets, and garage goods at higher AOV — positioned beside motorsport merch, not game tees.",
    tone: "favorable",
  },
  {
    slug: "high-on-life",
    headline: "Characters that are already products",
    body: "Squanch Games' talking guns and alien cast are inherently toyetic, High on Life 2 (Feb 2026) has the franchise at peak activity, and the indie rights holder has no broad licensing program — an approachable door into 7.5M+ players' wallets.",
    tone: "opportunity",
  },
];
