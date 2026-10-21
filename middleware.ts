import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { SITE_URL } from "@/lib/site";

const canonicalHost = new URL(SITE_URL).host;
const bareHost = canonicalHost.replace(/^www\./, "");

// Admin-only dashboard pages. The matching APIs enforce this too; this just avoids
// showing editors pages that would fail to load.
const ADMIN_PATHS = ["/dashboard/users", "/dashboard/redirects"];

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";

  // Redirect the bare domain to the canonical www host (301 permanent)
  if (canonicalHost !== bareHost && host === bareHost) {
    const url = req.nextUrl.clone();
    url.host = canonicalHost;
    url.protocol = "https:";
    url.port = "";
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
    if (token.role !== "admin" && ADMIN_PATHS.some((path) => req.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  const response = NextResponse.next();
  // Only the canonical domain may be indexed. Keeps the workers.dev address, preview
  // URLs and localhost out of search results so they never compete with the real site.
  if (host !== canonicalHost) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/auth).*)"],
};
