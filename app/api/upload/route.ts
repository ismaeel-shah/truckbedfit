import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function cleanFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const { env } = getCloudflareContext();
    const bucket = (env as unknown as AppCloudflareEnv).MEDIA_BUCKET;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!bucket) return NextResponse.json({ error: "R2 bucket not configured" }, { status: 500 });
    if (!publicUrl) return NextResponse.json({ error: "R2_PUBLIC_URL env var not set" }, { status: 500 });

    const bytes = await file.arrayBuffer();
    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${cleanFilename(file.name || "upload")}`;

    await bucket.put(key, bytes, {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    return NextResponse.json({
      url: `${publicUrl.replace(/\/$/, "")}/${key}`,
      publicId: key,
    });
  } catch (err) {
    console.error("R2 upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
