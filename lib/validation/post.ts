import { z } from "zod";
import { ARTICLE_TYPES, PILLAR_CATEGORY_SLUG } from "@/lib/articleTypes";
import { TRUCK_SLUGS } from "@/data/trucks";
import { isValidAsin, MAX_PRODUCTS } from "@/lib/products";

// The dashboard's equivalent of "validate frontmatter and fail the build": every save is
// checked against this schema and rejected with a readable message if it doesn't pass.

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const postRecordSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200, "Title is too long (max 200 characters)"),
    slug: z.string().regex(SLUG_RE, "Slug may only use lowercase letters, numbers and single hyphens"),
    categorySlug: z.string().min(1, "Category is required"),
    type: z.enum(ARTICLE_TYPES, { message: "Pick an article type" }),
    trucks: z
      .array(z.string().refine((slug) => TRUCK_SLUGS.includes(slug), { message: "Unknown truck in the truck list" }))
      .max(TRUCK_SLUGS.length),
    status: z.enum(["draft", "published", "scheduled"]),
    metaTitle: z.string().max(120, "SEO title is too long"),
    metaDescription: z.string().max(320, "Description is too long"),
    focusKeyword: z.string().max(120, "Primary keyword is too long"),
    updatedOn: z.string().regex(DATE_RE, "Updated date must be a valid date").nullable(),
    faqs: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .max(30, "Too many FAQs (max 30)"),
    products: z
      .array(
        z.object({
          label: z.string().max(40, "Product label is too long (max 40 characters)"),
          name: z.string().max(150, "Product name is too long (max 150 characters)"),
          asin: z.string(),
          note: z.string().max(220, "Product note is too long (max 220 characters)"),
          bullets: z.array(z.string().max(150, "Product key point is too long (max 150 characters)")).max(8, "Max 8 key points per product"),
        })
      )
      .max(MAX_PRODUCTS, `Too many products (max ${MAX_PRODUCTS})`),
  })
  .superRefine((post, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

    if (post.type === "pillar" && post.categorySlug !== PILLAR_CATEGORY_SLUG) {
      issue("type", "\"Pillar\" is only for Tonneau Covers — use \"Category hub\" for other categories");
    }
    if (post.type === "category-hub" && post.categorySlug === PILLAR_CATEGORY_SLUG) {
      issue("type", "Tonneau Covers' main article uses the \"Pillar\" type");
    }
    post.faqs.forEach((faq, i) => {
      if (!faq.question.trim() || !faq.answer.trim()) issue("faqs", `FAQ ${i + 1} needs both a question and an answer`);
    });

    if (post.status !== "draft") {
      // Drafts may hold half-filled products; anything going live needs a working Amazon link.
      post.products.forEach((product, i) => {
        if (!product.name) issue("products", `Product ${i + 1} needs a name (Products tab)`);
        else if (!isValidAsin(product.asin)) issue("products", `Product ${i + 1} needs a valid 10-character ASIN (Products tab)`);
      });
      if (!post.metaDescription.trim()) issue("metaDescription", "Add a description (SEO tab) before publishing");
      if (!post.focusKeyword.trim()) issue("focusKeyword", "Add a primary keyword (SEO tab) before publishing");
    }
  });

export type PostRecord = z.infer<typeof postRecordSchema>;

/** Drops FAQ rows the editor left completely empty. */
export function cleanFaqs(faqs: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(faqs)) return [];
  return faqs
    .map((f) => ({
      question: typeof f?.question === "string" ? f.question : "",
      answer: typeof f?.answer === "string" ? f.answer : "",
    }))
    .filter((f) => f.question.trim() || f.answer.trim());
}

/** First problem as one sentence, for the dashboard toast. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid post data";
}

/** Today's date (UTC) as YYYY-MM-DD. */
export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
