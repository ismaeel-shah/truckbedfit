import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getD1, mapUser, nowIso, UserRow } from "@/lib/db/d1";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const { results = [] } = await db
    .prepare("SELECT * FROM users ORDER BY created_at DESC")
    .all<UserRow>();

  return NextResponse.json(results.map((row) => mapUser(row)));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getD1();
  const { name, email, password, role } = await req.json() as {
    name?: string;
    email?: string;
    password?: string;
    role?: "admin" | "editor";
  };

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(normalizedEmail).first();
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const id = crypto.randomUUID();
  const now = nowIso();
  const hashed = await bcrypt.hash(password, 12);
  await db.prepare(`
    INSERT INTO users (id, name, email, password, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, name, normalizedEmail, hashed, role ?? "editor", now, now).run();

  const row = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  return NextResponse.json(row ? mapUser(row) : null, { status: 201 });
}
