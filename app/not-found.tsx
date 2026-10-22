import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { listCategories } from "@/lib/db/content";
import { categoryPath } from "@/lib/urls";

export const metadata = { title: "Page not found" };

async function getCategories() {
  try {
    return await listCategories();
  } catch {
    return [];
  }
}

// Root-level 404: rendered outside the (public) layout, so it brings its own navbar/footer.
export default async function NotFound() {
  const categories = await getCategories();
  const withPosts = categories.filter((c) => c.postCount > 0);

  return (
    <>
      <Navbar categories={withPosts.map(({ name, slug, icon, postCount }) => ({ name, slug, icon, postCount }))} />
      <main className="bg-background">
        <section className="relative overflow-hidden bg-primary text-white">
          <div className="absolute inset-0 bg-stripes" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <p className="font-heading text-8xl font-extrabold leading-none text-outline md:text-9xl" aria-hidden="true">404</p>
            <h1 className="mt-4 font-heading text-5xl font-extrabold uppercase leading-none md:text-6xl">
              This page took a <span className="text-accent">wrong turn.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              The page you&apos;re looking for doesn&apos;t exist or has moved. Try one of our guides instead.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/trucks"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-heading text-lg font-bold uppercase tracking-wide text-primary transition-colors hover:bg-orange-500"
              >
                Find gear for your truck <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md border-2 border-white/20 px-6 py-3 font-heading text-lg font-bold uppercase tracking-wide transition-colors hover:border-accent hover:text-accent"
              >
                Go to homepage
              </Link>
            </div>
          </div>
          <div className="relative h-2 hazard-stripe" aria-hidden="true" />
        </section>

        {withPosts.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-extrabold uppercase text-primary">Popular gear categories</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {withPosts.slice(0, 8).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={categoryPath(c.slug)}
                    className="flex items-center gap-3 rounded-md border-2 border-slate-200 bg-white p-4 font-heading text-lg font-bold uppercase text-primary transition-colors hover:border-accent hover:text-accent"
                  >
                    <span className="text-2xl" aria-hidden="true">{c.icon || "🛻"}</span>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer categories={withPosts.map(({ name, slug, icon }) => ({ name, slug, icon }))} />
    </>
  );
}
