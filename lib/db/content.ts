import { AuthorRow, CategoryRow, getD1, mapAuthor, mapCategory, mapPost, postJoins, postSelect, PostRow } from "./d1";
import { ArticleType, CATEGORY_GROUPS, PILLAR_TYPES } from "@/lib/articleTypes";
import { Truck, TRUCKS } from "@/data/trucks";

export type PostStatusFilter = "published" | "draft" | "scheduled" | "all";

type ListPostsOptions = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  slug?: string;
  status?: PostStatusFilter;
  orderBy?: "latest" | "views";
  /** Only these article types */
  types?: readonly ArticleType[];
  /** Leave out these article types (e.g. pillars from post lists) */
  excludeTypes?: readonly ArticleType[];
  /** Only posts tagged with this truck slug */
  truck?: string;
  /** Only posts by this author id */
  authorId?: string;
  /** Leave out one post (e.g. the article being viewed) */
  excludeId?: string;
};

/** Accepts either a category id or slug. */
async function categoryIdForParam(category: string) {
  const row = await getD1()
    .prepare("SELECT id FROM categories WHERE id = ? OR slug = ? LIMIT 1")
    .bind(category, category)
    .first<{ id: string }>();
  return row?.id ?? null;
}

// Scheduled posts are promoted lazily on read instead of via a cron job.
// Throttled per Worker isolate so busy pages don't issue an UPDATE on every request.
const SCHEDULE_CHECK_INTERVAL_MS = 60_000;
let lastScheduleCheck = 0;

export async function publishDueScheduledPosts() {
  const nowMs = Date.now();
  if (nowMs - lastScheduleCheck < SCHEDULE_CHECK_INTERVAL_MS) return;
  lastScheduleCheck = nowMs;

  try {
    await getD1().prepare(`
      UPDATE posts
      SET status = 'published', published_at = scheduled_at, updated_at = scheduled_at
      WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= ?
    `).bind(new Date(nowMs).toISOString()).run();
  } catch (err) {
    lastScheduleCheck = 0;
    console.error("publishDueScheduledPosts failed:", err);
  }
}

export async function incrementPostViews(id: string) {
  await getD1().prepare("UPDATE posts SET views = views + 1 WHERE id = ?").bind(id).run();
}

export async function listCategories() {
  const db = getD1();
  const { results = [] } = await db.prepare(`
    SELECT c.*, COUNT(p.id) AS post_count
    FROM categories c
    LEFT JOIN posts p ON p.category_id = c.id AND p.status = 'published'
    GROUP BY c.id
    ORDER BY c.created_at ASC, c.name ASC
  `).all<CategoryRow>();
  return results.map(mapCategory);
}

/** Categories with at least one published article — the only ones that get a page, menu entry or sitemap URL. */
export async function listLiveCategories() {
  await publishDueScheduledPosts();
  return (await listCategories()).filter((category) => category.postCount > 0);
}

/** Trucks (in data/trucks.ts order) tagged on at least one published article, with article counts. */
export async function listLiveTrucks(): Promise<{ truck: Truck; count: number }[]> {
  await publishDueScheduledPosts();
  const { results = [] } = await getD1().prepare(`
    SELECT j.value AS slug, COUNT(*) AS count
    FROM posts p, json_each(p.trucks_json) j
    WHERE p.status = 'published'
    GROUP BY j.value
  `).all<{ slug: string; count: number }>();
  const counts = new Map(results.map((row) => [row.slug, row.count]));
  return TRUCKS.filter((truck) => counts.has(truck.slug)).map((truck) => ({ truck, count: counts.get(truck.slug)! }));
}

export interface NavCategory {
  name: string;
  slug: string;
  icon: string;
  postCount: number;
  /** CATEGORY_GROUPS ids that have published posts (for "By type / Reviews / Guides" anchors) */
  groups: string[];
}

export interface NavData {
  categories: NavCategory[];
  /** Live trucks in data/trucks.ts order */
  trucks: { name: string; slug: string }[];
}

/** Everything the header/footer menus need — live items only (visibility rules). */
export async function getNavData(): Promise<NavData> {
  const [categories, trucks, typeRows] = await Promise.all([
    listLiveCategories(),
    listLiveTrucks(),
    getD1().prepare(`
      SELECT DISTINCT p.category_id AS categoryId, p.type AS type
      FROM posts p
      WHERE p.status = 'published'
    `).all<{ categoryId: string; type: string }>(),
  ]);

  const typesByCategory = new Map<string, Set<string>>();
  for (const row of typeRows.results ?? []) {
    if (!typesByCategory.has(row.categoryId)) typesByCategory.set(row.categoryId, new Set());
    typesByCategory.get(row.categoryId)!.add(row.type);
  }

  return {
    categories: categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      postCount: c.postCount,
      groups: CATEGORY_GROUPS
        .filter((g) => g.types.some((t) => typesByCategory.get(c._id)?.has(t)))
        .map((g) => g.id),
    })),
    trucks: trucks.map(({ truck }) => ({ name: truck.name, slug: truck.slug })),
  };
}

/** A category's published pillar/hub article (renders on /[category]). */
export async function getCategoryPillar(categoryId: string) {
  const { posts } = await listPosts({ category: categoryId, types: PILLAR_TYPES, status: "published", limit: 1 });
  return posts[0] ?? null;
}

/** The published article at /[category]/[slug] (pillars live on the category page itself). */
export async function getPublishedArticle(categorySlug: string, slug: string) {
  const { posts } = await listPosts({
    category: categorySlug,
    slug,
    excludeTypes: PILLAR_TYPES,
    status: "published",
    limit: 1,
  });
  return posts[0] ?? null;
}

export async function listPosts(options: ListPostsOptions = {}) {
  await publishDueScheduledPosts();

  const db = getD1();
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(Math.max(1, options.limit ?? 10), 1000);
  const where: string[] = [];
  const values: unknown[] = [];

  if (options.status && options.status !== "all") {
    where.push("p.status = ?");
    values.push(options.status);
  } else if (!options.status) {
    where.push("p.status = 'published'");
  }

  if (options.category) {
    const categoryId = await categoryIdForParam(options.category);
    where.push("p.category_id = ?");
    values.push(categoryId ?? "__missing_category__");
  }

  if (options.slug) {
    where.push("p.slug = ?");
    values.push(options.slug);
  }

  if (options.search) {
    where.push("(p.title LIKE ? OR p.excerpt LIKE ?)");
    values.push(`%${options.search}%`, `%${options.search}%`);
  }

  if (options.types?.length) {
    where.push(`p.type IN (${options.types.map(() => "?").join(", ")})`);
    values.push(...options.types);
  }

  if (options.excludeTypes?.length) {
    where.push(`p.type NOT IN (${options.excludeTypes.map(() => "?").join(", ")})`);
    values.push(...options.excludeTypes);
  }

  if (options.truck) {
    // trucks_json is a JSON array of slugs; json_each matches whole values, not substrings.
    where.push("EXISTS (SELECT 1 FROM json_each(p.trucks_json) WHERE json_each.value = ?)");
    values.push(options.truck);
  }

  if (options.authorId) {
    where.push("p.author_id = ?");
    values.push(options.authorId);
  }

  if (options.excludeId) {
    where.push("p.id != ?");
    values.push(options.excludeId);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql = options.orderBy === "views"
    ? "p.views DESC, COALESCE(p.published_at, p.created_at) DESC"
    : "COALESCE(p.published_at, p.created_at) DESC, p.created_at DESC";
  const skip = (page - 1) * limit;
  const [postResult, countRow] = await Promise.all([
    db.prepare(`
      SELECT ${postSelect}
      FROM posts p
      ${postJoins}
      ${whereSql}
      ORDER BY ${orderSql}
      LIMIT ? OFFSET ?
    `).bind(...values, limit, skip).all<PostRow>(),
    db.prepare(`SELECT COUNT(*) AS total FROM posts p ${whereSql}`).bind(...values).first<{ total: number }>(),
  ]);

  const total = countRow?.total ?? 0;
  return {
    posts: (postResult.results ?? []).map(mapPost),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function getCategoryBySlug(slug: string) {
  const categories = await listCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getAuthorBySlug(slug: string) {
  const row = await getD1().prepare("SELECT * FROM authors WHERE slug = ?").bind(slug).first<AuthorRow>();
  return mapAuthor(row);
}

/** Slugs of authors with at least one published article, with their latest "updated" date (for the sitemap). */
export async function listLiveAuthors(): Promise<{ slug: string; updatedOn: string }[]> {
  await publishDueScheduledPosts();
  const { results = [] } = await getD1().prepare(`
    SELECT a.slug AS slug, MAX(COALESCE(p.updated_on, substr(p.published_at, 1, 10))) AS updatedOn
    FROM authors a
    JOIN posts p ON p.author_id = a.id AND p.status = 'published'
    GROUP BY a.id
    ORDER BY a.name
  `).all<{ slug: string; updatedOn: string }>();
  return results;
}

export async function getPublishedPostBySlug(slug: string) {
  const { posts } = await listPosts({ slug, status: "published", limit: 1 });
  return posts[0] ?? null;
}
