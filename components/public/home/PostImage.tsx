import clsx from "clsx";
import { imgLoadingProps } from "@/lib/utils/imageProps";
import type { HomePost } from "./types";

interface PostImageProps {
  post: HomePost;
  className?: string;
  /** Above-the-fold image (e.g. the hero): load immediately instead of lazily. */
  priority?: boolean;
}

/** Featured image, or a striped charcoal panel with the category icon when there is none. */
export default function PostImage({ post, className, priority = false }: PostImageProps) {
  if (post.featuredImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={post.featuredImage}
        alt={post.featuredImageAlt || post.title}
        className={clsx("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", className)}
        {...imgLoadingProps(priority)}
      />
    );
  }

  return (
    <div className={clsx("w-full h-full bg-primary bg-stripes flex items-center justify-center text-4xl", className)}>
      <span className="opacity-80">{post.category?.icon || "🛻"}</span>
    </div>
  );
}
