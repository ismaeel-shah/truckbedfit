import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";

  // Redirect non-www to www (301 permanent)
  if (host === "homedeskessentials.com") {
    const url = req.nextUrl.clone();
    url.host = "www.homedeskessentials.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // Protect /dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/auth).*)"],
};
