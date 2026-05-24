import { NextResponse } from "next/server";
import { getD1, RedirectRow } from "@/lib/db/d1";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getD1();
  const { results = [] } = await db
    .prepare("SELECT source, destination, type FROM redirects WHERE active = 1")
    .all<Pick<RedirectRow, "source" | "destination" | "type">>();

  return NextResponse.json(results, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
  });
}
