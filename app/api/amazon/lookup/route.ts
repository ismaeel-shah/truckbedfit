import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { MAX_PRODUCTS } from "@/lib/products";
import { isAmazonApiConfigured } from "@/lib/amazon/creatorsApi";
import { getAmazonItems } from "@/lib/amazon/productImages";

/** Dashboard check that ASINs exist on Amazon (and their image), via the same 1-day cache the site uses. */
export async function GET(req: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const asins = (req.nextUrl.searchParams.get("asins") ?? "")
    .split(",")
    .map((asin) => asin.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, MAX_PRODUCTS);

  return NextResponse.json({
    configured: isAmazonApiConfigured(),
    items: await getAmazonItems(asins),
  });
}
