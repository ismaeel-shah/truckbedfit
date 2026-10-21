import type { listCategories, listPosts } from "@/lib/db/content";

export type HomePost = Awaited<ReturnType<typeof listPosts>>["posts"][number];
export type HomeCategory = Awaited<ReturnType<typeof listCategories>>[number];
