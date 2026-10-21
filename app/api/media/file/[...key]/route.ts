import { NextResponse } from "next/server";
import { getMediaBucket, isMediaKey } from "@/lib/media";

/**
 * Development only: serves uploads from the local R2 simulation, which the
 * public media domain can't reach. Production images are served straight from
 * R2 via R2_PUBLIC_URL, so this returns 404 there.
 */
export async function GET(_req: Request, { params }: { params: { key: string[] } }) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const key = params.key.map(decodeURIComponent).join("/");
  if (!isMediaKey(key)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const object = await getMediaBucket().get(key);
  if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
      ETag: object.httpEtag,
    },
  });
}
