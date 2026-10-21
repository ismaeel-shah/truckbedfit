import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getMediaBucket, isMediaKey, listMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Every uploaded image in R2, newest first. */
export async function GET() {
  const { response } = await requireUser();
  if (response) return response;

  try {
    return NextResponse.json(await listMedia());
  } catch (err) {
    console.error("GET /api/media error:", err);
    const msg = err instanceof Error ? err.message : "Could not list media";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Permanently removes an image from R2. Admins only — posts using it will show a broken image. */
export async function DELETE(req: NextRequest) {
  const { response } = await requireUser("admin");
  if (response) return response;

  const { key } = await req.json() as { key?: string };
  if (!isMediaKey(key)) return NextResponse.json({ error: "Invalid media key" }, { status: 400 });

  await getMediaBucket().delete(key);
  return NextResponse.json({ success: true });
}
