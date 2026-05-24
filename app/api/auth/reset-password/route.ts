import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (password.length < 6)  return NextResponse.json({ error: "Password too short" }, { status: 400 });

  await connectDB();
  const user = await User.findOne({
    resetToken:       token,
    resetTokenExpiry: { $gt: new Date() }, // token must not be expired
  });

  if (!user) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });

  user.password         = await bcrypt.hash(password, 12);
  user.resetToken       = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return NextResponse.json({ ok: true });
}
