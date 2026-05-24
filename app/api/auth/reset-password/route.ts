import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getD1, nowIso, UserRow } from "@/lib/db/d1";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json() as { token?: string; password?: string };
  if (!token || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password too short" }, { status: 400 });

  const db = getD1();
  const user = await db.prepare(`
    SELECT * FROM users
    WHERE reset_token = ? AND reset_token_expiry > ?
  `).bind(token, nowIso()).first<UserRow>();

  if (!user) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });

  await db.prepare(`
    UPDATE users
    SET password = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = ?
    WHERE id = ?
  `).bind(await bcrypt.hash(password, 12), nowIso(), user.id).run();

  return NextResponse.json({ ok: true });
}
