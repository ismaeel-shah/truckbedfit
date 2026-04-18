import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// DELETE /api/users/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUserId = (session.user as { id?: string }).id;
  if (currentUserId === params.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findByIdAndDelete(params.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}

// PATCH /api/users/[id] — update role
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { role } = await req.json();
  const user = await User.findByIdAndUpdate(params.id, { role }, { new: true }).select("-password");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}
