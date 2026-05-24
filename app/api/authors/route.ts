import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Author from "@/lib/models/Author";
import { slugify } from "@/lib/utils/slugify";

export async function GET() {
  await connectDB();
  const authors = await Author.find().sort({ name: 1 }).lean();
  return NextResponse.json(authors);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { name, bio, photo, twitter, website } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const slug = slugify(name);
    const existing = await Author.findOne({ slug });
    if (existing) return NextResponse.json({ error: "Author with this name already exists" }, { status: 400 });

    const author = await Author.create({ name: name.trim(), slug, bio, photo, twitter, website });
    return NextResponse.json(author, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[authors POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
