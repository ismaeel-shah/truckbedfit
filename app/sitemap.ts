import { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://worknest.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
  ];

  try {
    const [postsRes, catsRes] = await Promise.all([
      fetch(`${base}/api/posts?limit=1000&status=published`, { cache: "no-store" }),
      fetch(`${base}/api/categories`, { cache: "no-store" }),
    ]);

    const { posts } = await postsRes.json();
    const categories = await catsRes.json();

    const postUrls: MetadataRoute.Sitemap = posts.map(
      (post: { slug: string; updatedAt: string; featuredImage?: string; title?: string }) => ({
        url: `${base}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        ...(post.featuredImage && {
          images: [{ url: post.featuredImage, title: post.title ?? "" }],
        }),
      })
    );

    const catUrls: MetadataRoute.Sitemap = categories.map(
      (cat: { slug: string; updatedAt: string }) => ({
        url: `${base}/category/${cat.slug}`,
        lastModified: new Date(cat.updatedAt ?? Date.now()),
      })
    );

    return [...staticPages, ...postUrls, ...catUrls];
  } catch {
    return staticPages;
  }
}
