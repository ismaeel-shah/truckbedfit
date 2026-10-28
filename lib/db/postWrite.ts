import { getD1 } from "./d1";
import { isPillarType } from "@/lib/articleTypes";
import { slugify } from "@/lib/utils/slugify";
import { cleanProducts } from "@/lib/products";
import { productImageShortcode, productShortcode, splitShortcodes } from "@/lib/utils/shortcodes";
import { cleanFaqs, cleanKeywordList, firstIssue, PostRecord, postRecordSchema, todayIsoDate } from "@/lib/validation/post";

/** Everything a create/update needs validated, already merged with the stored post on updates. */
export interface PostWriteInput {
  /** Set when updating, so the post doesn't clash with its own slug */
  id?: string;
  title: string;
  slug: string;
  categoryId: string;
  type: string;
  trucks: unknown;
  status: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  /** One per line */
  secondaryKeywords?: string;
  updatedOn: string | null;
  faqs: unknown;
  products: unknown;
  /** Article HTML, to check its [product N] references */
  content: string;
}

type PrepareResult =
  | { ok: true; record: PostRecord }
  | { ok: false; status: number; error: string };

/**
 * Normalises and validates a post before it is written:
 * - a pillar/category-hub article takes its category's slug (it renders on /[category]),
 *   so per-category slug uniqueness also guarantees one main article per category;
 * - publishing without an "updated" date stamps today;
 * - empty FAQ and product rows are dropped (Amazon links become ASINs); then the zod schema runs;
 * - the slug must not clash with another post in the same category (UNIQUE(category_id, slug)).
 */
export async function preparePostWrite(input: PostWriteInput): Promise<PrepareResult> {
  const db = getD1();

  const category = input.categoryId
    ? await db.prepare("SELECT slug FROM categories WHERE id = ?").bind(input.categoryId).first<{ slug: string }>()
    : null;
  if (!category) return { ok: false, status: 400, error: "Pick a category" };

  const pillar = isPillarType(input.type);
  const slug = pillar ? category.slug : slugify(input.slug || input.title);
  const updatedOn = input.updatedOn || (input.status !== "draft" ? todayIsoDate() : null);

  const parsed = postRecordSchema.safeParse({
    title: input.title,
    slug,
    categorySlug: category.slug,
    type: input.type,
    trucks: Array.isArray(input.trucks) ? input.trucks : [],
    status: input.status,
    metaTitle: input.metaTitle ?? "",
    metaDescription: input.metaDescription ?? "",
    focusKeyword: input.focusKeyword ?? "",
    secondaryKeywords: cleanKeywordList(input.secondaryKeywords),
    updatedOn,
    faqs: cleanFaqs(input.faqs),
    products: cleanProducts(input.products),
  });
  if (!parsed.success) return { ok: false, status: 400, error: firstIssue(parsed.error) };

  if (parsed.data.status !== "draft") {
    const productCount = parsed.data.products.length;
    const missing = splitShortcodes(input.content)
      .find((segment) => segment.kind === "product" && (segment.number < 1 || segment.number > productCount));
    if (missing?.kind === "product") {
      return {
        ok: false,
        status: 400,
        error: `The article uses ${(missing.display === "image" ? productImageShortcode : productShortcode)(missing.number)} but the Products tab has ${productCount} product${productCount === 1 ? "" : "s"}`,
      };
    }
  }

  // The category's own slug is reserved for its main article (it renders on /[category]).
  if (!pillar && slug === category.slug) {
    return { ok: false, status: 400, error: `"${slug}" is this category's own name — pick a different slug` };
  }

  // URLs are /[category]/[slug], so a slug only has to be unique within its category.
  const clash = await db
    .prepare("SELECT id FROM posts WHERE category_id = ? AND slug = ? AND id != ?")
    .bind(input.categoryId, slug, input.id ?? "")
    .first();
  if (clash) {
    return {
      ok: false,
      status: 409,
      error: pillar
        ? "This category already has a main article (pillar/hub). Edit that one instead."
        : "Another post in this category already uses this slug",
    };
  }

  return { ok: true, record: parsed.data };
}
