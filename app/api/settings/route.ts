import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import SiteSettings from "@/lib/models/SiteSettings";

// GET /api/settings  — returns all settings as { key: value, ... }
export async function GET() {
  await connectDB();
  const rows = await SiteSettings.find().lean();
  const result: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    result[row.key] = row.value as Record<string, string>;
  }
  return NextResponse.json(result);
}

// PATCH /api/settings  — body: { key: string, value: object }
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  await SiteSettings.findOneAndUpdate(
    { key },
    { value },
    { upsert: true, new: true }
  );
  return NextResponse.json({ ok: true });
}
