import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getD1, nowIso, parseJson } from "@/lib/db/d1";

type SettingRow = {
  key: string;
  value_json: string;
};

export async function GET() {
  const db = getD1();
  const { results = [] } = await db.prepare("SELECT key, value_json FROM site_settings").all<SettingRow>();
  const result: Record<string, Record<string, string>> = {};

  for (const row of results) {
    result[row.key] = parseJson<Record<string, string>>(row.value_json, {});
  }

  return NextResponse.json(result);
}

export async function PATCH(req: Request) {
  const { response } = await requireUser("admin");
  if (response) return response;

  const db = getD1();
  const { key, value } = await req.json() as { key?: string; value?: Record<string, string> };
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const now = nowIso();
  await db.prepare(`
    INSERT INTO site_settings (key, value_json, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
  `).bind(key, JSON.stringify(value ?? {}), now, now).run();

  return NextResponse.json({ ok: true });
}
