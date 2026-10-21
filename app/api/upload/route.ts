import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getMediaBucket, MEDIA_PREFIX, toMediaItem } from "@/lib/media";

function cleanFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be 10MB or smaller" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  try {
    const bucket = getMediaBucket();
    const key = `${MEDIA_PREFIX}${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${cleanFilename(file.name || "upload")}`;
    const httpMetadata = { contentType: file.type || "application/octet-stream" };
    const customMetadata = { originalName: (file.name || "upload").slice(0, 200) };

    await bucket.put(key, await file.arrayBuffer(), { httpMetadata, customMetadata });

    const item = toMediaItem({ key, size: file.size, uploaded: new Date(), httpMetadata, customMetadata });
    // `publicId` kept for older callers that expect it.
    return NextResponse.json({ ...item, publicId: key });
  } catch (err) {
    console.error("R2 upload error:", err);
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
