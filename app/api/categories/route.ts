import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils/slugify";
import { CategoryRow, getD1, mapCategory, nowIso } from "@/lib/db/d1";

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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const body = await req.json() as Record<string, string>;
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const slug = body.slug ? slugify(body.slug) : slugify(name);
  const existing = await db.prepare("SELECT id FROM categories WHERE slug = ?").bind(slug).first();
  if (existing) return NextResponse.json({ error: "Category already exists" }, { status: 409 });

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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const { id, ...body } = await req.json() as Record<string, string>;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await db.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first<CategoryRow>();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const name = body.name?.trim() ?? existing.name;
  const slug = body.slug ? slugify(body.slug) : existing.slug;
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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const { id } = await req.json() as { id?: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
  return NextResponse.json({ success: true });
}
