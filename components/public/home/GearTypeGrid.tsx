import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { categoryPath } from "@/lib/urls";
import type { HomeCategory } from "./types";

/** Tiles linking to every category. */
export default function GearTypeGrid({ categories }: { categories: HomeCategory[] }) {
  if (!categories.length) return null;

  return (
    <section id="categories" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading title="Shop by Gear Type" eyebrow="Browse every category" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={categoryPath(category.slug)}
            className="group flex items-center gap-4 rounded-md border-2 border-slate-200 bg-white p-4 transition-colors hover:border-accent"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-background text-2xl" aria-hidden="true">
              {category.icon || "🛻"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-heading text-xl font-bold uppercase leading-tight text-primary">
                {category.name}
              </span>
              <span className="text-xs text-slate-500">
                {category.postCount} {category.postCount === 1 ? "guide" : "guides"}
              </span>
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary text-white transition-colors group-hover:bg-accent group-hover:text-primary">
              <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
