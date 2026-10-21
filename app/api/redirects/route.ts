import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getD1, mapRedirect, nowIso, RedirectRow } from "@/lib/db/d1";

function normalizeSource(source: string) {
  return source.startsWith("/") ? source : `/${source}`;
}

export async function GET() {
  const { response } = await requireUser("admin");
  if (response) return response;

  const db = getD1();
  const { results = [] } = await db
    .prepare("SELECT * FROM redirects ORDER BY created_at DESC")
    .all<RedirectRow>();
  return NextResponse.json(results.map(mapRedirect));
}

export async function POST(req: NextRequest) {
  const { response } = await requireUser("admin");
  if (response) return response;

  const db = getD1();
  const body = await req.json() as { source?: string; destination?: string; type?: 301 | 302; active?: boolean };
  if (!body.source || !body.destination) return NextResponse.json({ error: "Source and destination are required" }, { status: 400 });

  const source = normalizeSource(body.source);
  const existing = await db.prepare("SELECT id FROM redirects WHERE source = ?").bind(source).first();
  if (existing) return NextResponse.json({ error: "A redirect for this source already exists" }, { status: 409 });

  const id = crypto.randomUUID();
  const now = nowIso();
  await db.prepare(`
    INSERT INTO redirects (id, source, destination, type, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, source, body.destination, body.type ?? 301, body.active === false ? 0 : 1, now, now).run();

  const row = await db.prepare("SELECT * FROM redirects WHERE id = ?").bind(id).first<RedirectRow>();
  return NextResponse.json(row ? mapRedirect(row) : null, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { response } = await requireUser("admin");
  if (response) return response;

  const db = getD1();
  const { id, ...body } = await req.json() as { id?: string; source?: string; destination?: string; type?: 301 | 302; active?: boolean };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await db.prepare("SELECT * FROM redirects WHERE id = ?").bind(id).first<RedirectRow>();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.prepare(`
    UPDATE redirects
    SET source = ?, destination = ?, type = ?, active = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    body.source ? normalizeSource(body.source) : existing.source,
    body.destination ?? existing.destination,
    body.type ?? existing.type,
    body.active === undefined ? existing.active : body.active ? 1 : 0,
    nowIso(),
    id
  ).run();

  const row = await db.prepare("SELECT * FROM redirects WHERE id = ?").bind(id).first<RedirectRow>();
  return NextResponse.json(row ? mapRedirect(row) : null);
}

export async function DELETE(req: NextRequest) {
  const { response } = await requireUser("admin");
  if (response) return response;

  const db = getD1();
  const { id } = await req.json() as { id?: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.prepare("DELETE FROM redirects WHERE id = ?").bind(id).run();
  return NextResponse.json({ success: true });
}
