import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Dashboard auth guard ──────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Skip non-page paths ───────────────────────────────────────
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/login") ||
    pathname.match(/\.(.*)$/) // static files
  ) {
    return NextResponse.next();
  }

  // ── Dynamic redirects from DB ─────────────────────────────────
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
    const res = await fetch(`${base}/api/redirects/active`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const redirects: Array<{ source: string; destination: string; type: number }> = await res.json();
      const match = redirects.find((r) => r.source === pathname);
      if (match) {
        const dest = match.destination.startsWith("http")
          ? match.destination
          : new URL(match.destination, req.nextUrl.origin).toString();
        return NextResponse.redirect(dest, { status: match.type });
      }
    }
  } catch {
    // silently skip if redirect fetch fails
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|icon\\.svg).*)"],
};
