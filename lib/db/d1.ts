import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ArticleType } from "@/lib/articleTypes";
import { articlePath } from "@/lib/urls";

export interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatement;
}

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  meta_title: string;
  meta_description: string;
  post_count?: number;
  created_at: string;
  updated_at: string;
};

export type AuthorRow = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  photo: string;
  twitter: string;
  website: string;
  created_at: string;
  updated_at: string;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor";
  bio: string;
  photo: string;
  twitter: string;
  website: string;
  reset_token: string | null;
  reset_token_expiry: string | null;
  created_at: string;
  updated_at: string;
};

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  featured_image_alt: string;
  category_id: string;
  author_id: string | null;
  tags_json: string;
  status: "draft" | "published" | "scheduled";
  published_at: string | null;
  scheduled_at: string | null;
  views: number;
  reading_time: number;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  og_image: string;
  affiliate_products_json: string;
  faqs_json: string;
  article_id: string;
  type: ArticleType;
  trucks_json: string;
  updated_on: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
  category_description?: string;
  author_name?: string | null;
  author_slug?: string | null;
  author_bio?: string | null;
  author_photo?: string | null;
  author_twitter?: string | null;
  author_website?: string | null;
};

export type RedirectRow = {
  id: string;
  source: string;
  destination: string;
  type: 301 | 302;
  active: number;
  created_at: string;
  updated_at: string;
};

export function getD1(): D1DatabaseLike {
  const { env } = getCloudflareContext();
  const db = (env as unknown as AppCloudflareEnv).DB;
  if (!db) throw new Error("Cloudflare D1 binding DB is not configured");
  return db as D1DatabaseLike;
}

export function nowIso() {
  return new Date().toISOString();
}

/** JSON body accepted by POST /api/posts and PATCH /api/posts/[id]. */
export interface PostPayload {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  category?: string;
  author?: string | null;
  tags?: string[];
  status?: string;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  /** SEO title; may contain {year} */
  metaTitle?: string;
  /** Meta description */
  metaDescription?: string;
  /** Primary keyword */
  focusKeyword?: string;
  ogImage?: string;
  affiliateProducts?: unknown[];
  faqs?: unknown[];
  /** Planning-sheet ID, e.g. "A03" */
  articleId?: string;
  type?: string;
  /** Truck slugs from data/trucks.ts */
  trucks?: string[];
  /** Editorial "last updated" date, YYYY-MM-DD */
  updatedOn?: string | null;
}

export const POST_STATUSES = ["draft", "published", "scheduled"] as const;

export function isPostStatus(value: unknown): value is PostRow["status"] {
  return typeof value === "string" && (POST_STATUSES as readonly string[]).includes(value);
}

/** Normalises any parseable date to a UTC ISO string so it compares correctly in SQL. */
export function toIsoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function mapCategory(row: CategoryRow) {
  return {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    icon: row.icon ?? "",
    postCount: row.post_count ?? 0,
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAuthor(row: AuthorRow | null | undefined) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    bio: row.bio ?? "",
    photo: row.photo ?? "",
    twitter: row.twitter ?? "",
    website: row.website ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapUser(row: UserRow, includePassword = false) {
  const user: Record<string, unknown> = {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    bio: row.bio ?? "",
    photo: row.photo ?? "",
    twitter: row.twitter ?? "",
    website: row.website ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (includePassword) user.password = row.password;
  return user;
}

export function mapRedirect(row: RedirectRow) {
  return {
    _id: row.id,
    source: row.source,
    destination: row.destination,
    type: row.type,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPost(row: PostRow) {
  const category = {
    _id: row.category_id,
    name: row.category_name ?? "",
    slug: row.category_slug ?? "",
    icon: row.category_icon ?? "",
    description: row.category_description ?? "",
  };

  const author = row.author_id
    ? {
        _id: row.author_id,
        name: row.author_name ?? "",
        slug: row.author_slug ?? "",
        bio: row.author_bio ?? "",
        photo: row.author_photo ?? "",
        twitter: row.author_twitter ?? "",
        website: row.author_website ?? "",
      }
    : undefined;

  return {
    _id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    featuredImage: row.featured_image ?? "",
    featuredImageAlt: row.featured_image_alt ?? "",
    category,
    categoryId: row.category_id,
    author,
    authorId: row.author_id,
    tags: parseJson<string[]>(row.tags_json, []),
    status: row.status,
    publishedAt: row.published_at ?? row.created_at,
    scheduledAt: row.scheduled_at ?? undefined,
    views: row.views ?? 0,
    readingTime: row.reading_time ?? 0,
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    focusKeyword: row.focus_keyword ?? "",
    ogImage: row.og_image ?? "",
    affiliateProducts: parseJson(row.affiliate_products_json, []),
    faqs: parseJson<{ question: string; answer: string }[]>(row.faqs_json, []),
    articleId: row.article_id ?? "",
    type: row.type ?? "guide",
    trucks: parseJson<string[]>(row.trucks_json, []),
    // Editorial date; falls back to the publish date for posts saved before it existed.
    updatedOn: row.updated_on || (row.published_at ?? row.updated_at).slice(0, 10),
    url: articlePath({ slug: row.slug, type: row.type, category }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const postSelect = `
  p.*,
  c.name AS category_name,
  c.slug AS category_slug,
  c.icon AS category_icon,
  c.description AS category_description,
  a.name AS author_name,
  a.slug AS author_slug,
  a.bio AS author_bio,
  a.photo AS author_photo,
  a.twitter AS author_twitter,
  a.website AS author_website
`;

export const postJoins = `
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN authors a ON a.id = p.author_id
`;
