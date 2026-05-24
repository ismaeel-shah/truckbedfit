import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils/slugify";
import { calculateReadingTime } from "@/lib/utils/readingTime";
import { getD1, mapPost, nowIso, postJoins, postSelect, PostRow } from "@/lib/db/d1";

function asInt(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

async function categoryIdForParam(db: ReturnType<typeof getD1>, category: string) {
  if (/^[0-9a-fA-F-]{24,36}$/.test(category)) return category;
  const row = await db.prepare("SELECT id FROM categories WHERE slug = ?").bind(category).first<{ id: string }>();
  return row?.id ?? null;
}

export async function GET(req: NextRequest) {
  const db = getD1();
  const { searchParams } = new URL(req.url);
  const page = asInt(searchParams.get("page"), 1);
  const limit = Math.min(asInt(searchParams.get("limit"), 10), 1000);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const slug = searchParams.get("slug");

  const session = await getServerSession(authOptions);
  const where: string[] = [];
  const values: unknown[] = [];

  if (status && session && status !== "all") {
    where.push("p.status = ?");
    values.push(status);
  } else if (!session || status !== "all") {
    where.push("p.status = 'published'");
  }

  if (category) {
    const categoryId = await categoryIdForParam(db, category);
    where.push("p.category_id = ?");
    values.push(categoryId ?? "__missing_category__");
  }

  if (slug) {
    where.push("p.slug = ?");
    values.push(slug);
  }

  if (search) {
    where.push("(p.title LIKE ? OR p.excerpt LIKE ?)");
    values.push(`%${search}%`, `%${search}%`);
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
    db.prepare(`
      SELECT COUNT(*) AS total
      FROM posts p
      ${whereSql}
    `).bind(...values).first<{ total: number }>(),
  ]);

  const total = countRow?.total ?? 0;
  const posts = (postResult.results ?? []).map(mapPost);

  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const body = await req.json() as Record<string, any>;
  const slug = body.slug || slugify(body.title ?? "");
  const readingTime = calculateReadingTime(body.content ?? "");

  const existing = await db.prepare("SELECT id FROM posts WHERE slug = ?").bind(slug).first();
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const now = nowIso();
  const id = crypto.randomUUID();
  const publishedAt = body.status === "published" ? now : null;

  await db.prepare(`
    INSERT INTO posts (
      id, title, slug, excerpt, content, featured_image, featured_image_alt,
      category_id, author_id, tags_json, status, published_at, scheduled_at,
      views, reading_time, meta_title, meta_description, focus_keyword, og_image,
      affiliate_products_json, faqs_json, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.title ?? "",
    slug,
    body.excerpt ?? "",
    body.content ?? "",
    body.featuredImage ?? "",
    body.featuredImageAlt ?? "",
    body.category,
    body.author || null,
    JSON.stringify(body.tags ?? []),
    body.status ?? "draft",
    publishedAt,
    body.scheduledAt || null,
    0,
    readingTime,
    body.metaTitle ?? "",
    body.metaDescription ?? "",
    body.focusKeyword ?? "",
    body.ogImage ?? "",
    JSON.stringify(body.affiliateProducts ?? []),
    JSON.stringify(body.faqs ?? []),
    now,
    now
  ).run();

  const row = await db.prepare(`
    SELECT ${postSelect}
    FROM posts p
    ${postJoins}
    WHERE p.id = ?
  `).bind(id).first<PostRow>();

  return NextResponse.json(row ? mapPost(row) : null, { status: 201 });
}
