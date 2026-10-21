import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireUser } from "@/lib/auth";
import { calculateReadingTime } from "@/lib/utils/readingTime";
import { slugify } from "@/lib/utils/slugify";
import { getD1, isPostStatus, mapPost, nowIso, PostPayload, postJoins, postSelect, PostRow, toIsoOrNull } from "@/lib/db/d1";

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

  const slug = body.slug ? slugify(body.slug) : existing.slug;
  if (slug !== existing.slug) {
    const clash = await db.prepare("SELECT id FROM posts WHERE slug = ? AND id != ?").bind(slug, params.id).first();
    if (clash) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

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
        updated_at = ?
      WHERE id = ?
    `).bind(
      body.title ?? existing.title,
      slug,
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
      body.metaTitle ?? existing.meta_title,
      body.metaDescription ?? existing.meta_description,
      body.focusKeyword ?? existing.focus_keyword,
      body.ogImage ?? existing.og_image,
      JSON.stringify(body.affiliateProducts ?? JSON.parse(existing.affiliate_products_json || "[]")),
      JSON.stringify(body.faqs ?? JSON.parse(existing.faqs_json || "[]")),
      now,
      params.id
    ).run();

    const post = await getPostById(params.id);
    return NextResponse.json(post);
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
