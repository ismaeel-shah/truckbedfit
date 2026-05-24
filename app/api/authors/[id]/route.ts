import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthorRow, getD1, mapAuthor, nowIso } from "@/lib/db/d1";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const body = await req.json() as Record<string, string>;
  const existing = await db.prepare("SELECT * FROM authors WHERE id = ?").bind(params.id).first<AuthorRow>();
  if (!existing) return NextResponse.json({ error: "Author not found" }, { status: 404 });

  await db.prepare(`
    UPDATE authors
    SET name = ?, bio = ?, photo = ?, twitter = ?, website = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    body.name ?? existing.name,
    body.bio ?? existing.bio,
    body.photo ?? existing.photo,
    body.twitter ?? existing.twitter,
    body.website ?? existing.website,
    nowIso(),
    params.id
  ).run();

  const row = await db.prepare("SELECT * FROM authors WHERE id = ?").bind(params.id).first<AuthorRow>();
  return NextResponse.json(row ? mapAuthor(row) : null);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const existing = await db.prepare("SELECT id FROM authors WHERE id = ?").bind(params.id).first();
  if (!existing) return NextResponse.json({ error: "Author not found" }, { status: 404 });

  await db.prepare("DELETE FROM authors WHERE id = ?").bind(params.id).run();
  return NextResponse.json({ success: true });
}
