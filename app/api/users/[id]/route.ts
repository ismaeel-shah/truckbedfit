import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getD1, mapUser, nowIso, UserRow } from "@/lib/db/d1";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { response } = await requireUser("admin");
  if (response) return response;

  const db = getD1();
  const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(params.id).first<UserRow>();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(mapUser(user));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user: currentUser, response } = await requireUser("admin");
  if (response) return response;

  if (currentUser.id === params.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const db = getD1();
  const existing = await db.prepare("SELECT id FROM users WHERE id = ?").bind(params.id).first();
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.prepare("DELETE FROM users WHERE id = ?").bind(params.id).run();
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user: currentUser, response } = await requireUser("admin");
  if (response) return response;

  const db = getD1();
  const body = await req.json() as Record<string, string>;
  const existing = await db.prepare("SELECT * FROM users WHERE id = ?").bind(params.id).first<UserRow>();
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (body.role !== undefined && body.role !== "admin" && body.role !== "editor") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (body.role && body.role !== existing.role && currentUser.id === params.id) {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
  }

  await db.prepare(`
    UPDATE users
    SET role = ?, bio = ?, photo = ?, twitter = ?, website = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    body.role ?? existing.role,
    body.bio ?? existing.bio,
    body.photo ?? existing.photo,
    body.twitter ?? existing.twitter,
    body.website ?? existing.website,
    nowIso(),
    params.id
  ).run();

  const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(params.id).first<UserRow>();
  return NextResponse.json(user ? mapUser(user) : null);
}
