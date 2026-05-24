import { CategoryRow, getD1, mapCategory, mapPost, postJoins, postSelect, PostRow } from "./d1";

type ListPostsOptions = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  slug?: string;
  status?: "published" | "draft" | "scheduled" | "all";
};

async function categoryIdForParam(category: string) {
  const db = getD1();
  if (/^[0-9a-fA-F-]{24,36}$/.test(category)) return category;
  const row = await db.prepare("SELECT id FROM categories WHERE slug = ?").bind(category).first<{ id: string }>();
  return row?.id ?? null;
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
  const skip = (page - 1) * limit;
  const [postResult, countRow] = await Promise.all([
    db.prepare(`
      SELECT ${postSelect}
      FROM posts p
      ${postJoins}
      ${whereSql}
      ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.created_at DESC
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
