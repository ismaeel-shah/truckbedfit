import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Author from "@/lib/models/Author";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { name, bio, photo, twitter, website } = await req.json();
  const update: Record<string, unknown> = {};
  if (name !== undefined)    update.name    = name;
  if (bio !== undefined)     update.bio     = bio;
  if (photo !== undefined)   update.photo   = photo;
  if (twitter !== undefined) update.twitter = twitter;
  if (website !== undefined) update.website = website;

  const author = await Author.findByIdAndUpdate(params.id, update, { new: true });
  if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });
  return NextResponse.json(author);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const author = await Author.findByIdAndDelete(params.id);
  if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
