import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Info } from "lucide-react";
import PageHeader from "@/components/public/PageHeader";
import ArticleGrid from "@/components/public/ArticleGrid";
import BedSizeTable from "@/components/public/trucks/BedSizeTable";
import { listCategories, listPosts } from "@/lib/db/content";
import { redirectIfMoved } from "@/lib/db/redirects";
import JsonLd from "@/components/public/JsonLd";
import { itemListSchema } from "@/lib/utils/schema";
import { getTruck, truckYears } from "@/data/trucks";
import { categoryPath, truckPath } from "@/lib/urls";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/utils/seo";

export const dynamic = "force-dynamic";

type Params = { params: { truck: string } };

/** The truck and its published articles grouped by category — or null if the hub isn't live. */
async function loadTruckHub(slug: string) {
  const truck = getTruck(slug);
  if (!truck) return null;
  const [{ posts }, categories] = await Promise.all([
    listPosts({ truck: slug, status: "published", limit: 500 }),
    listCategories(),
  ]);
  // Visibility rule: a truck hub exists only once an article is tagged with the truck.
  if (!posts.length) return null;
  const groups = categories
    .map((category) => ({ category, posts: posts.filter((post) => post.categoryId === category._id) }))
    .filter((group) => group.posts.length > 0);
  return { truck, groups };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await loadTruckHub(params.truck);
  if (!data) return { title: "Page not found" };
  const { truck } = data;
  // Keep the full <title> (with " | TruckBedFit", 14 chars) within ~60 characters for long truck names.
  const long = `${truck.name} Bed Accessories & Fitment`;
  const title = long.length <= 46 ? long : `${truck.name} Bed Accessories`;
  const description = `Bed sizes, fitment notes and our guides to tonneau covers, liners, toolboxes and racks for the ${truck.name}.`;
  const canonical = buildCanonical(truckPath(truck.slug));
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: buildOpenGraph({ title, description, url: canonical }),
    twitter: buildTwitter({ title, description }),
  };
}

export default async function TruckHubPage({ params }: Params) {
  const data = await loadTruckHub(params.truck);
  if (!data) {
    await redirectIfMoved(`/trucks/${params.truck}`);
    notFound();
  }
  const { truck, groups } = data;
  const years = truckYears(truck);

  return (
    <div className="bg-background">
      <JsonLd data={itemListSchema(`${truck.name} guides`, groups.flatMap((group) => group.posts))} />
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Trucks", href: "/trucks" }, { label: truck.name }]}
        path={truckPath(truck.slug)}
        eyebrow={years ? `${truck.make} · ${years}` : truck.make}
        title={`${truck.name} bed accessories`}
        lead={`Bed sizes, fitment notes and every guide we've written for the ${truck.name}.`}
      />

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="mb-4 font-heading text-2xl font-extrabold uppercase text-primary">Bed sizes</h2>
            <BedSizeTable trucks={[truck]} />
            <p className="mt-3 text-xs text-slate-500">
              Always confirm your exact bed length and cab style before ordering.
            </p>
          </div>

          {truck.fitmentNotes.length > 0 && (
            <div className="lg:col-span-2">
              <h2 className="mb-4 font-heading text-2xl font-extrabold uppercase text-primary">Fitment notes</h2>
              <ul className="space-y-3">
                {truck.fitmentNotes.map((note) => (
                  <li key={note} className="flex gap-3 rounded-md border-l-2 border-accent bg-white p-4 text-sm text-slate-600">
                    <Info size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {groups.map(({ category, posts }) => (
          <ArticleGrid
            key={category._id}
            id={category.slug}
            title={category.name}
            icon={category.icon || undefined}
            eyebrow={`For the ${truck.name}`}
            href={categoryPath(category.slug)}
            posts={posts}
          />
        ))}
      </div>
    </div>
  );
}
