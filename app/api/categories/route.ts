import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import { slugify } from "@/lib/utils/slugify";

// GET /api/categories — public
export async function GET() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return NextResponse.json(categories);
}

// POST /api/categories — auth required
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const slug = body.slug || slugify(body.name);

  const existing = await Category.findOne({ slug });
  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await Category.create({ ...body, slug });
  return NextResponse.json(category, { status: 201 });
}

// PATCH /api/categories — update by id in body
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id, ...body } = await req.json();
  const category = await Category.findByIdAndUpdate(id, body, { new: true });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

// DELETE /api/categories — delete by id in body
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await req.json();
  await Category.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
