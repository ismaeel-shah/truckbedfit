import { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://worknest.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const [postsRes, catsRes] = await Promise.all([
      fetch(`${base}/api/posts?limit=1000&status=published`, { next: { revalidate: 3600 } }),
      fetch(`${base}/api/categories`, { next: { revalidate: 3600 } }),
    ]);

    const { posts } = await postsRes.json();
    const categories = await catsRes.json();

    const postUrls: MetadataRoute.Sitemap = posts.map(
      (post: { slug: string; updatedAt: string; featuredImage?: string; title?: string }) => ({
        url: `${base}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        ...(post.featuredImage && {
          images: [{ url: post.featuredImage, title: post.title ?? "" }],
        }),
      })
    );

    const catUrls: MetadataRoute.Sitemap = categories.map(
      (cat: { slug: string; updatedAt: string }) => ({
        url: `${base}/category/${cat.slug}`,
        lastModified: new Date(cat.updatedAt ?? Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })
    );

    return [...staticPages, ...postUrls, ...catUrls];
  } catch {
    return staticPages;
  }
}
