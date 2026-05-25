import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function cleanFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadToR2(file: File, buffer: Buffer) {
  try {
    const { env } = getCloudflareContext();
    const bucket = (env as unknown as AppCloudflareEnv).MEDIA_BUCKET;
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!bucket || !publicUrl) return null;

    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${cleanFilename(file.name || "upload")}`;
    await bucket.put(key, buffer, {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    return {
      url: `${publicUrl.replace(/\/$/, "")}/${key}`,
      publicId: key,
    };
  } catch {
    return null;
  }
}

async function uploadToCloudinary(buffer: Buffer) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return null;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  try {
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "homedeskessentials" }, (error, result) => {
            if (error || !result) return reject(error ?? new Error("No result"));
            resolve(result);
          })
          .end(buffer);
      }
    );
    return { url: result.secure_url, publicId: result.public_id };
  } catch {
    return null;
  }
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

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const r2Result = await uploadToR2(file, buffer);
  if (r2Result) return NextResponse.json(r2Result);

  const cloudinaryResult = await uploadToCloudinary(buffer);
  if (cloudinaryResult) return NextResponse.json(cloudinaryResult);

  return NextResponse.json(
    { error: "No storage configured. Add Cloudinary secrets or R2_PUBLIC_URL in Cloudflare Workers." },
    { status: 500 }
  );
}
