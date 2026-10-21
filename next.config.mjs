import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Exposes the D1/R2 bindings from wrangler.jsonc to `next dev`.
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Images are served as-is from R2/Amazon. Next's optimizer would need a
    // Cloudflare Images binding on Workers and, with wildcard hosts, acts as an open proxy.
    unoptimized: true,
  },
};

export default nextConfig;
