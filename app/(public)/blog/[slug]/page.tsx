import { notFound, permanentRedirect } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/db/content";
import { redirectIfMoved } from "@/lib/db/redirects";

export const dynamic = "force-dynamic";

// Articles used to live at /blog/<slug>. Send old links and bookmarks to the post's
// current URL (/<category>/<slug>, or /<category> for a pillar/hub).
export default async function OldBlogPostRedirect({ params }: { params: { slug: string } }) {
  const post = await getPublishedPostBySlug(params.slug);
  if (post) permanentRedirect(post.url);
  await redirectIfMoved(`/blog/${params.slug}`);
  notFound();
}
