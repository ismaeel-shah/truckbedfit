import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Redirect from "@/lib/models/Redirect";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const redirects = await Redirect.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(redirects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();

  // Ensure source starts with /
  if (!body.source.startsWith("/")) body.source = `/${body.source}`;

  const existing = await Redirect.findOne({ source: body.source });
  if (existing) return NextResponse.json({ error: "A redirect for this source already exists" }, { status: 409 });

  const redirect = await Redirect.create(body);
  return NextResponse.json(redirect, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id, ...body } = await req.json();
  if (body.source && !body.source.startsWith("/")) body.source = `/${body.source}`;
  const redirect = await Redirect.findByIdAndUpdate(id, body, { new: true });
  if (!redirect) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(redirect);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await req.json();
  await Redirect.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
