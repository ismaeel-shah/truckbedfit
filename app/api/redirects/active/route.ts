import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Redirect from "@/lib/models/Redirect";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const redirects = await Redirect.find({ active: true })
    .select("source destination type")
    .lean();
  return NextResponse.json(redirects, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
  });
}
