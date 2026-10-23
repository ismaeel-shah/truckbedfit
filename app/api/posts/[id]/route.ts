import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireUser } from "@/lib/auth";
import { calculateReadingTime } from "@/lib/utils/readingTime";
import { getD1, isPostStatus, mapPost, nowIso, parseJson, PostPayload, postJoins, postSelect, PostRow, toIsoOrNull } from "@/lib/db/d1";
import { preparePostWrite } from "@/lib/db/postWrite";
import { todayIsoDate } from "@/lib/validation/post";

async function getPostById(id: string) {
  const db = getD1();
  const row = await db.prepare(`
    SELECT ${postSelect}
    FROM posts p
    ${postJoins}
    WHERE p.id = ?
  `).bind(id).first<PostRow>();
  return row ? mapPost(row) : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await getPostById(params.id);
  // Unpublished posts are only visible to signed-in users.
  if (!post || (post.status !== "published" && !(await getSessionUser()))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { response } = await requireUser();
  if (response) return response;

  const db = getD1();
  const body = await req.json() as PostPayload;
  const existing = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(params.id).first<PostRow>();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = body.status ?? existing.status;
  if (!isPostStatus(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const scheduledAt = body.scheduledAt !== undefined
    ? toIsoOrNull(body.scheduledAt)
    : existing.scheduled_at;
  if (status === "scheduled" && !scheduledAt) {
    return NextResponse.json({ error: "Scheduled posts need a valid schedule date" }, { status: 400 });
  }

  // The "last updated" date is automatic: a full save of a published post moves it to today unless
  // the editor marked it a minor edit; partial saves (alt-text autosave) never move it; a scheduled
  // post takes its publish day; a first publish gets today (preparePostWrite fills it in).
  const updatedOn = status === "scheduled" && scheduledAt
    ? scheduledAt.slice(0, 10)
    : status === "published" && body.markUpdated === true
      ? todayIsoDate()
      : existing.updated_on;

  // Partial updates (e.g. the alt-text autosave) send one field, so validate the
  // stored post merged with whatever changed.
  const prepared = await preparePostWrite({
    id: params.id,
    title: body.title ?? existing.title,
    slug: body.slug ?? existing.slug,
    categoryId: body.category ?? existing.category_id,
    type: body.type ?? existing.type,
    trucks: body.trucks ?? parseJson<string[]>(existing.trucks_json, []),
    status,
    metaTitle: body.metaTitle ?? existing.meta_title,
    metaDescription: body.metaDescription ?? existing.meta_description,
    focusKeyword: body.focusKeyword ?? existing.focus_keyword,
    updatedOn,
    faqs: body.faqs ?? parseJson(existing.faqs_json, []),
    products: body.products ?? parseJson(existing.affiliate_products_json, []),
    content: body.content ?? existing.content,
  });
  if (!prepared.ok) return NextResponse.json({ error: prepared.error }, { status: prepared.status });
  const post = prepared.record;

  // One timestamp for both columns so a fresh publish isn't shown as "Updated".
  const now = nowIso();
  const publishedAt = status === "published" && !existing.published_at
    ? now
    : body.publishedAt ?? existing.published_at;

  try {
    await db.prepare(`
      UPDATE posts
      SET
        title = ?,
        slug = ?,
        excerpt = ?,
        content = ?,
        featured_image = ?,
        featured_image_alt = ?,
        category_id = ?,
        author_id = ?,
        tags_json = ?,
        status = ?,
        published_at = ?,
        scheduled_at = ?,
        reading_time = ?,
        meta_title = ?,
        meta_description = ?,
        focus_keyword = ?,
        og_image = ?,
        affiliate_products_json = ?,
        faqs_json = ?,
        type = ?,
        trucks_json = ?,
        updated_on = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      post.title,
      post.slug,
      body.excerpt ?? existing.excerpt,
      body.content ?? existing.content,
      body.featuredImage ?? existing.featured_image,
      body.featuredImageAlt ?? existing.featured_image_alt,
      body.category ?? existing.category_id,
      body.author === undefined ? existing.author_id : body.author || null,
      JSON.stringify(body.tags ?? JSON.parse(existing.tags_json || "[]")),
      status,
      publishedAt,
      scheduledAt,
      body.content !== undefined ? calculateReadingTime(body.content) : existing.reading_time,
      post.metaTitle,
      post.metaDescription,
      post.focusKeyword,
      body.ogImage ?? existing.og_image,
      JSON.stringify(post.products),
      JSON.stringify(post.faqs),
      post.type,
      JSON.stringify(post.trucks),
      post.updatedOn,
      now,
      params.id
    ).run();

    return NextResponse.json(await getPostById(params.id));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("PATCH /api/posts/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { response } = await requireUser();
  if (response) return response;

  const db = getD1();
  const existing = await db.prepare("SELECT id FROM posts WHERE id = ?").bind(params.id).first();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.prepare("DELETE FROM posts WHERE id = ?").bind(params.id).run();
  return NextResponse.json({ success: true });
}
