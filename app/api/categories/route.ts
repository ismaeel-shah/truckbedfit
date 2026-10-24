import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/utils/slugify";
import { CategoryRow, getD1, mapCategory, nowIso } from "@/lib/db/d1";
import { isReservedRootSlug } from "@/lib/urls";
import { PILLAR_CATEGORY_SLUG } from "@/lib/articleTypes";

/** Category slugs are root URLs (/[category]), so they must not collide with anything. */
async function checkCategorySlug(db: ReturnType<typeof getD1>, slug: string, excludeId = ""): Promise<string | null> {
  if (!slug) return "Slug is required";
  if (isReservedRootSlug(slug)) return `"${slug}" is used by another page on the site — pick a different slug`;
  const category = await db.prepare("SELECT id FROM categories WHERE slug = ? AND id != ?").bind(slug, excludeId).first();
  if (category) return "Another category already uses this slug";
  // The category's main article takes the category slug, so no other article in it may already use it.
  const article = excludeId
    ? await db
        .prepare("SELECT id FROM posts WHERE category_id = ? AND slug = ? AND type NOT IN ('pillar', 'category-hub')")
        .bind(excludeId, slug)
        .first()
    : null;
  if (article) return "An article in this category already uses this slug — pick a different one";
  return null;
}

export async function GET() {
  const db = getD1();
  const { results = [] } = await db.prepare(`
    SELECT
      c.*,
      COUNT(p.id) AS post_count
    FROM categories c
    LEFT JOIN posts p ON p.category_id = c.id AND p.status = 'published'
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all<CategoryRow>();

  return NextResponse.json(results.map(mapCategory));
}

export async function POST(req: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const db = getD1();
  const body = await req.json() as Record<string, string>;
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const slug = body.slug ? slugify(body.slug) : slugify(name);
  const slugError = await checkCategorySlug(db, slug);
  if (slugError) return NextResponse.json({ error: slugError }, { status: 409 });

  const now = nowIso();
  const id = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO categories (id, name, slug, description, icon, meta_title, meta_description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    name,
    slug,
    body.description ?? "",
    body.icon ?? "",
    body.metaTitle ?? "",
    body.metaDescription ?? "",
    now,
    now
  ).run();

  const row = await db.prepare("SELECT c.*, 0 AS post_count FROM categories c WHERE c.id = ?").bind(id).first<CategoryRow>();
  return NextResponse.json(row ? mapCategory(row) : null, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const db = getD1();
  const { id, ...body } = await req.json() as Record<string, string>;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await db.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first<CategoryRow>();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const name = body.name?.trim() ?? existing.name;
  const slug = body.slug ? slugify(body.slug) : existing.slug;
  if (slug !== existing.slug) {
    if (existing.slug === PILLAR_CATEGORY_SLUG) {
      return NextResponse.json(
        { error: `The "${PILLAR_CATEGORY_SLUG}" slug is fixed — the site's pillar article depends on it` },
        { status: 400 }
      );
    }
    const slugError = await checkCategorySlug(db, slug, id);
    if (slugError) return NextResponse.json({ error: slugError }, { status: 409 });
    // The category's pillar/hub article shares the category slug — keep them in step.
    await db.prepare(`
      UPDATE posts SET slug = ?, updated_at = ?
      WHERE category_id = ? AND slug = ? AND type IN ('pillar', 'category-hub')
    `).bind(slug, nowIso(), id, existing.slug).run();
  }
  await db.prepare(`
    UPDATE categories
    SET name = ?, slug = ?, description = ?, icon = ?, meta_title = ?, meta_description = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    name,
    slug,
    body.description ?? existing.description,
    body.icon ?? existing.icon,
    body.metaTitle ?? existing.meta_title,
    body.metaDescription ?? existing.meta_description,
    nowIso(),
    id
  ).run();

  const row = await db.prepare("SELECT c.*, 0 AS post_count FROM categories c WHERE c.id = ?").bind(id).first<CategoryRow>();
  return NextResponse.json(row ? mapCategory(row) : null);
}

export async function DELETE(req: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const db = getD1();
  const { id } = await req.json() as { id?: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
  return NextResponse.json({ success: true });
}
