import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import Category from "@/lib/models/Category";
import "@/lib/models/Author";
import { slugify } from "@/lib/utils/slugify";
import { calculateReadingTime } from "@/lib/utils/readingTime";

// GET /api/posts — public listing with optional filters
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const slug = searchParams.get("slug");

  const session = await getServerSession(authOptions);
  const query: Record<string, unknown> = {};

  // Only allow draft/all status for authenticated users
  if (status && session) {
    query.status = status;
  } else {
    query.status = "published";
  }

  if (category) {
    // Support both ObjectId and category slug
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const cat = await Category.findOne({ slug: category }).lean();
      if (cat) query.category = (cat as { _id: unknown })._id;
      else query.category = null;
    }
  }
  if (slug) {
    query.slug = slug;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate("category", "name slug icon")
      .populate("author", "name bio photo twitter website")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query),
  ]);

  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) });
}

// POST /api/posts — create post (auth required)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  const slug = body.slug || slugify(body.title);
  const readingTime = calculateReadingTime(body.content ?? "");

  // Ensure slug is unique
  const existing = await Post.findOne({ slug });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const post = await Post.create({
    ...body,
    slug,
    readingTime,
    author: body.author || null,
    publishedAt: body.status === "published" ? new Date() : null,
  });

  // Update category post count
  await Category.findByIdAndUpdate(body.category, { $inc: { postCount: 1 } });

  return NextResponse.json(post, { status: 201 });
}
