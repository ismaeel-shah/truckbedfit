import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { LogoMark } from "@/components/Logo";
import PostImage from "./PostImage";
import type { HomePost } from "./types";

export default function GarageHero({ featured }: { featured?: HomePost }) {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div className="absolute inset-0 bg-stripes" aria-hidden="true" />
      {/* Angled orange panel behind the featured card */}
      <div className="absolute inset-y-0 -right-32 hidden w-[55%] -skew-x-12 bg-accent/10 lg:block" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
        {/* Copy + CTA */}
        <div className="lg:col-span-6">
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-accent">
            <span className="h-0.5 w-8 bg-accent" aria-hidden="true" />
            Truck bed gear guides
          </p>

          <h1 className="mt-5 font-heading text-6xl font-extrabold uppercase leading-[0.9] md:text-7xl xl:text-8xl">
            Truck bed gear
            <br />
            that actually <span className="text-accent">fits.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Fitment-first reviews of tonneau covers, liners, toolboxes, racks and
            more — so you buy the right part for your bed length, cab and model year.
          </p>

          <Link
            href="/blog"
            className="group mt-8 inline-flex items-center gap-3 rounded-md bg-accent px-7 py-4 font-heading text-xl font-bold uppercase tracking-wide text-primary shadow-lg shadow-accent/20 transition-colors hover:bg-orange-500"
          >
            View all guides
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Featured post */}
        <div className="lg:col-span-6">
          {featured ? (
            <Link
              href={`/blog/${featured.slug}`}
              className="group relative block aspect-[4/3] overflow-hidden rounded-md border-2 border-white/10 shadow-2xl transition-colors hover:border-accent"
            >
              <PostImage post={featured} className="absolute inset-0" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10" aria-hidden="true" />
              <span className="absolute left-0 top-5 bg-accent px-4 py-1.5 font-heading text-sm font-bold uppercase tracking-widest text-primary">
                Featured guide
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                {featured.category?.name && (
                  <p className="border-l-2 border-accent pl-2 text-xs font-bold uppercase tracking-[0.2em] text-white">{featured.category.name}</p>
                )}
                <h2 className="mt-2 font-heading text-3xl font-bold uppercase leading-[1.05] transition-colors group-hover:text-accent md:text-4xl">
                  {featured.title}
                </h2>
                <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {featured.readingTime} min read</span>
                    {featured.publishedAt && <span>{format(new Date(featured.publishedAt), "MMM d, yyyy")}</span>}
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-white text-primary transition-colors group-hover:bg-accent">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-5 rounded-md border-2 border-dashed border-white/20 p-8 text-center">
              <LogoMark id="hero-empty" size={72} />
              <p className="font-heading text-3xl font-bold uppercase">First guides rolling in soon</p>
              <p className="max-w-sm text-sm text-slate-400">
                We&apos;re testing gear right now. Check back shortly for in-depth truck bed reviews.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative h-2 hazard-stripe" aria-hidden="true" />
    </section>
  );
}
