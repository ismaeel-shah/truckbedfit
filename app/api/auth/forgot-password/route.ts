import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getD1, nowIso, UserRow } from "@/lib/db/d1";
import { sendPasswordResetEmail } from "@/lib/utils/email";
import { SITE_URL } from "@/lib/site";

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email?: string };
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const db = getD1();
  const user = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email.toLowerCase().trim())
    .first<UserRow>();

  if (!user) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await db.prepare(`
    UPDATE users
    SET reset_token = ?, reset_token_expiry = ?, updated_at = ?
    WHERE id = ?
  `).bind(token, expiry, nowIso(), user.id).run();

  const resetUrl = `${SITE_URL}/login/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Email send failed:", msg);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
