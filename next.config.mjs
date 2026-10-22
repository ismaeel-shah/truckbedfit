import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Exposes the D1/R2 bindings from wrangler.jsonc to `next dev`.
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permanent (301) redirects for URLs that moved. Old /blog/<slug> article URLs are
  // redirected in app/(public)/blog/[slug] instead, because the target needs the
  // post's category from D1. Add new moves here, never put years/dates in URLs.
  async redirects() {
    // statusCode 301 (Next's `permanent: true` would send 308).
    return [
      {
        source: "/guides/how-to-measure-truck-bed-for-tonneau-cover",
        destination: "/tonneau-covers/how-to-measure-truck-bed-for-tonneau-cover",
        statusCode: 301,
      },
      { source: "/blog", destination: "/", statusCode: 301 },
      { source: "/category/:slug", destination: "/:slug", statusCode: 301 },
    ];
  },
  images: {
    // Images are served as-is from R2/Amazon. Next's optimizer would need a
    // Cloudflare Images binding on Workers and, with wildcard hosts, acts as an open proxy.
    unoptimized: true,
  },
};

export default nextConfig;
