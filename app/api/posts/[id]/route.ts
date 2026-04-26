import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import "@/lib/models/Category";
import "@/lib/models/Author";
import { calculateReadingTime } from "@/lib/utils/readingTime";

// GET /api/posts/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const post = await Post.findById(params.id)
    .populate("category", "name slug icon")
    .populate("author", "name bio photo twitter website")
    .lean();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

// PATCH /api/posts/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  if (body.content) {
    body.readingTime = calculateReadingTime(body.content);
  }

  if (body.status === "published") {
    const existing = await Post.findById(params.id);
    if (existing && !existing.publishedAt) {
      body.publishedAt = new Date();
    }
  }

  const { _id, __v, createdAt, ...updateFields } = body;
  const post = await Post.findByIdAndUpdate(
    params.id,
    { $set: updateFields },
    { new: true, runValidators: false }
  ).populate("category", "name slug icon").lean();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

// DELETE /api/posts/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const post = await Post.findByIdAndDelete(params.id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
