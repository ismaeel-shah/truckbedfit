import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateReadingTime } from "@/lib/utils/readingTime";
import { getD1, mapPost, nowIso, postJoins, postSelect, PostRow } from "@/lib/db/d1";

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
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const body = await req.json() as Record<string, any>;
  const existing = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(params.id).first<PostRow>();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const publishedAt = body.status === "published" && !existing.published_at
    ? nowIso()
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
      body.slug ?? existing.slug,
      body.excerpt ?? existing.excerpt,
      body.content ?? existing.content,
      body.featuredImage ?? existing.featured_image,
      body.featuredImageAlt ?? existing.featured_image_alt,
      body.category ?? existing.category_id,
      body.author || null,
      JSON.stringify(body.tags ?? JSON.parse(existing.tags_json || "[]")),
      body.status ?? existing.status,
      publishedAt,
      body.scheduledAt || existing.scheduled_at,
      body.content ? calculateReadingTime(body.content) : existing.reading_time,
      body.metaTitle ?? existing.meta_title,
      body.metaDescription ?? existing.meta_description,
      body.focusKeyword ?? existing.focus_keyword,
      body.ogImage ?? existing.og_image,
      JSON.stringify(body.affiliateProducts ?? JSON.parse(existing.affiliate_products_json || "[]")),
      JSON.stringify(body.faqs ?? JSON.parse(existing.faqs_json || "[]")),
      nowIso(),
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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const existing = await db.prepare("SELECT id FROM posts WHERE id = ?").bind(params.id).first();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.prepare("DELETE FROM posts WHERE id = ?").bind(params.id).run();
  return NextResponse.json({ success: true });
}
