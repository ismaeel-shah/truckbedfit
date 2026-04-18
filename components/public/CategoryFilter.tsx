"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutGrid } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  postCount?: number;
}

export default function CategoryFilter({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  return (
    <div className="relative">
      {/* Scroll container */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
        <Link
          href="/blog"
          className={clsx(
            "snap-start flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border",
            pathname === "/blog"
              ? "bg-primary text-white border-primary shadow-md"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-accent hover:text-accent"
          )}
        >
          <LayoutGrid size={15} />
          All Posts
        </Link>

        {categories.map((cat) => {
          const active = pathname === `/category/${cat.slug}`;
          return (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className={clsx(
                "snap-start flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border",
                active
                  ? "bg-accent text-primary border-accent shadow-md shadow-accent/25"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-accent hover:text-accent"
              )}
            >
              <span className="text-base leading-none">{cat.icon}</span>
              {cat.name}
              {cat.postCount !== undefined && cat.postCount > 0 && (
                <span className={clsx(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  active ? "bg-primary/20" : "bg-slate-100 dark:bg-slate-700"
                )}>
                  {cat.postCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
