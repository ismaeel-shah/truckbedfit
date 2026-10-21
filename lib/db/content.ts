import { CategoryRow, getD1, mapCategory, mapPost, postJoins, postSelect, PostRow } from "./d1";

export type PostStatusFilter = "published" | "draft" | "scheduled" | "all";

type ListPostsOptions = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  slug?: string;
  status?: PostStatusFilter;
  orderBy?: "latest" | "views";
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
    ORDER BY c.name ASC
  `).all<CategoryRow>();
  return results.map(mapCategory);
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

export async function getPublishedPostBySlug(slug: string) {
  const { posts } = await listPosts({ slug, status: "published", limit: 1 });
  return posts[0] ?? null;
}
