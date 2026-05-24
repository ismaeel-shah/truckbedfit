import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getD1, nowIso, UserRow } from "@/lib/db/d1";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json() as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (!currentPassword || !newPassword) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

  const db = getD1();
  const userId = (session.user as { id?: string }).id;
  const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<UserRow>();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  await db.prepare("UPDATE users SET password = ?, updated_at = ? WHERE id = ?")
    .bind(await bcrypt.hash(newPassword, 12), nowIso(), user.id)
    .run();

  return NextResponse.json({ ok: true });
}
