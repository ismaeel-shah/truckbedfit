import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils/slugify";
import { AuthorRow, getD1, mapAuthor, nowIso } from "@/lib/db/d1";

export async function GET() {
  const db = getD1();
  const { results = [] } = await db
    .prepare("SELECT * FROM authors ORDER BY name ASC")
    .all<AuthorRow>();

  return NextResponse.json(results.map((row) => mapAuthor(row)));
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getD1();
    const body = await req.json() as Record<string, string>;
    const name = body.name?.trim();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const slug = slugify(name);
    const existing = await db.prepare("SELECT id FROM authors WHERE slug = ?").bind(slug).first();
    if (existing) return NextResponse.json({ error: "Author with this name already exists" }, { status: 400 });

    const id = crypto.randomUUID();
    const now = nowIso();
    await db.prepare(`
      INSERT INTO authors (id, name, slug, bio, photo, twitter, website, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      name,
      slug,
      body.bio ?? "",
      body.photo ?? "",
      body.twitter ?? "",
      body.website ?? "",
      now,
      now
    ).run();

    const row = await db.prepare("SELECT * FROM authors WHERE id = ?").bind(id).first<AuthorRow>();
    return NextResponse.json(row ? mapAuthor(row) : null, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[authors POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
