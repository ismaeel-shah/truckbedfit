// Article types and how category pages group them. Shared by the dashboard and the site.

export const ARTICLE_TYPES = [
  "pillar",
  "category-hub",
  "best-list-vehicle",
  "best-list-type",
  "review",
  "brand",
  "comparison",
  "guide",
  "parts",
] as const;

export type ArticleType = (typeof ARTICLE_TYPES)[number];

/** Labels shown in the dashboard's "Type" dropdown. */
export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  pillar: "Pillar — Tonneau Covers main page",
  "category-hub": "Category hub — a category's main page",
  "best-list-vehicle": "Best list — by truck",
  "best-list-type": "Best list — by type",
  review: "Product review",
  brand: "Brand review",
  comparison: "Comparison (X vs Y)",
  guide: "Guide / how-to",
  parts: "Parts & care",
};

/**
 * A category's main article. It renders on /[category] itself (above the post list),
 * so it has no URL of its own. "pillar" is only for Tonneau Covers; every other
 * category uses "category-hub".
 */
export const PILLAR_TYPES: readonly ArticleType[] = ["pillar", "category-hub"];
export const PILLAR_CATEGORY_SLUG = "tonneau-covers";

export function isPillarType(type: string | undefined | null): boolean {
  return !!type && (PILLAR_TYPES as readonly string[]).includes(type);
}

export function isArticleType(value: unknown): value is ArticleType {
  return typeof value === "string" && (ARTICLE_TYPES as readonly string[]).includes(value);
}

/** Category page sections, in display order. Empty groups are hidden. */
export const CATEGORY_GROUPS: { id: string; title: string; types: ArticleType[] }[] = [
  { id: "best-by-truck", title: "Best by truck", types: ["best-list-vehicle"] },
  { id: "best-by-type", title: "Best by type", types: ["best-list-type"] },
  { id: "reviews", title: "Brand reviews", types: ["review", "brand"] },
  { id: "guides", title: "Guides & comparisons", types: ["comparison", "guide"] },
  { id: "parts", title: "Parts & care", types: ["parts"] },
];

/** Umbrella category whose page links to every other live category. */
export const UMBRELLA_CATEGORY_SLUG = "bed-accessories";
