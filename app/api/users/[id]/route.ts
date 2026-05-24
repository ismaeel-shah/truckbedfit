import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getD1, mapUser, nowIso, UserRow } from "@/lib/db/d1";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(params.id).first<UserRow>();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(mapUser(user));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUserId = (session.user as { id?: string }).id;
  if (currentUserId === params.id) {
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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const body = await req.json() as Record<string, string>;
  const existing = await db.prepare("SELECT * FROM users WHERE id = ?").bind(params.id).first<UserRow>();
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
