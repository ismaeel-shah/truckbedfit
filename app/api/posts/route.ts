import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireUser } from "@/lib/auth";
import { calculateReadingTime } from "@/lib/utils/readingTime";
import { getD1, isPostStatus, mapPost, nowIso, PostPayload, postJoins, postSelect, PostRow, toIsoOrNull } from "@/lib/db/d1";
import { listPosts, PostStatusFilter } from "@/lib/db/content";
import { preparePostWrite } from "@/lib/db/postWrite";

function asInt(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestedStatus = searchParams.get("status");

  // Only signed-in users may list drafts/scheduled posts; everyone else sees published.
  let status: PostStatusFilter = "published";
  if (requestedStatus && (requestedStatus === "all" || isPostStatus(requestedStatus))) {
    if (await getSessionUser()) status = requestedStatus;
  }

  const result = await listPosts({
    page: asInt(searchParams.get("page"), 1),
    limit: asInt(searchParams.get("limit"), 10),
    category: searchParams.get("category") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    slug: searchParams.get("slug") ?? undefined,
    status,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const db = getD1();
  const body = await req.json() as PostPayload;
  const status = body.status ?? "draft";
  const scheduledAt = toIsoOrNull(body.scheduledAt);

  if (!isPostStatus(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  if (status === "scheduled" && !scheduledAt) {
    return NextResponse.json({ error: "Scheduled posts need a valid schedule date" }, { status: 400 });
  }

  const prepared = await preparePostWrite({
    title: body.title ?? "",
    slug: body.slug ?? "",
    categoryId: body.category ?? "",
    type: body.type ?? "guide",
    trucks: body.trucks ?? [],
    articleId: body.articleId ?? "",
    status,
    metaTitle: body.metaTitle ?? "",
    metaDescription: body.metaDescription ?? "",
    focusKeyword: body.focusKeyword ?? "",
    updatedOn: body.updatedOn ?? null,
    faqs: body.faqs ?? [],
  });
  if (!prepared.ok) return NextResponse.json({ error: prepared.error }, { status: prepared.status });
  const post = prepared.record;

  const now = nowIso();
  const id = crypto.randomUUID();
  const publishedAt = status === "published" ? now : null;

  await db.prepare(`
    INSERT INTO posts (
      id, title, slug, excerpt, content, featured_image, featured_image_alt,
      category_id, author_id, tags_json, status, published_at, scheduled_at,
      views, reading_time, meta_title, meta_description, focus_keyword, og_image,
      affiliate_products_json, faqs_json, article_id, type, trucks_json, updated_on,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    post.title,
    post.slug,
    body.excerpt ?? "",
    body.content ?? "",
    body.featuredImage ?? "",
    body.featuredImageAlt ?? "",
    body.category,
    body.author || null,
    JSON.stringify(body.tags ?? []),
    status,
    publishedAt,
    status === "scheduled" ? scheduledAt : null,
    0,
    calculateReadingTime(body.content ?? ""),
    post.metaTitle,
    post.metaDescription,
    post.focusKeyword,
    body.ogImage ?? "",
    "[]",
    JSON.stringify(post.faqs),
    post.articleId,
    post.type,
    JSON.stringify(post.trucks),
    post.updatedOn,
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
