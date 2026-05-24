import { MetadataRoute } from "next";
import { listCategories, listPosts } from "@/lib/db/content";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://worknest.example.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
  ];

  try {
    const [{ posts }, categories] = await Promise.all([
      listPosts({ limit: 1000, status: "published" }),
      listCategories(),
    ]);

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
