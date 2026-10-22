import { getD1 } from "./d1";
import { isPillarType } from "@/lib/articleTypes";
import { slugify } from "@/lib/utils/slugify";
import { cleanFaqs, firstIssue, PostRecord, postRecordSchema, todayIsoDate } from "@/lib/validation/post";

/** Everything a create/update needs validated, already merged with the stored post on updates. */
export interface PostWriteInput {
  /** Set when updating, so the post doesn't clash with its own slug */
  id?: string;
  title: string;
  slug: string;
  categoryId: string;
  type: string;
  trucks: unknown;
  articleId: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  updatedOn: string | null;
  faqs: unknown;
}

type PrepareResult =
  | { ok: true; record: PostRecord }
  | { ok: false; status: number; error: string };

/**
 * Normalises and validates a post before it is written:
 * - a pillar/category-hub article takes its category's slug (it renders on /[category]),
 *   so slug uniqueness also guarantees one main article per category;
 * - publishing without an "updated" date stamps today;
 * - empty FAQ rows are dropped; then the zod schema runs;
 * - the slug must not clash with another post or with a category page.
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
    articleId: input.articleId ?? "",
    status: input.status,
    metaTitle: input.metaTitle ?? "",
    metaDescription: input.metaDescription ?? "",
    focusKeyword: input.focusKeyword ?? "",
    updatedOn,
    faqs: cleanFaqs(input.faqs),
  });
  if (!parsed.success) return { ok: false, status: 400, error: firstIssue(parsed.error) };

  const clash = await db
    .prepare("SELECT id FROM posts WHERE slug = ? AND id != ?")
    .bind(slug, input.id ?? "")
    .first();
  if (clash) {
    return {
      ok: false,
      status: 409,
      error: pillar
        ? "This category already has a main article (pillar/hub). Edit that one instead."
        : "Another post already uses this slug",
    };
  }

  if (!pillar) {
    const categorySlug = await db.prepare("SELECT 1 FROM categories WHERE slug = ?").bind(slug).first();
    if (categorySlug) return { ok: false, status: 400, error: `"${slug}" is a category name — pick a different slug` };
  }

  return { ok: true, record: parsed.data };
}
