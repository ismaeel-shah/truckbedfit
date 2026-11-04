import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Info } from "lucide-react";
import PageHeader from "@/components/public/PageHeader";
import ArticleGrid from "@/components/public/ArticleGrid";
import BedSizeGlance from "@/components/public/trucks/BedSizeGlance";
import { listCategories, listPosts } from "@/lib/db/content";
import { redirectIfMoved } from "@/lib/db/redirects";
import JsonLd from "@/components/public/JsonLd";
import { itemListSchema } from "@/lib/utils/schema";
import { getTruck, hasHub, truckYears } from "@/data/trucks";
import { categoryPath, truckPath } from "@/lib/urls";
import { hubPageMetadata } from "@/lib/utils/seo";
import { getHubPage } from "@/lib/db/hubPages";
import { HubArticle, HubFaqs, HubShortAnswer } from "@/components/public/HubContent";

export const dynamic = "force-dynamic";

type Params = { params: { truck: string } };

/** The truck and its published articles grouped by category — or null if the hub isn't live. */
async function loadTruckHub(slug: string) {
  const truck = getTruck(slug);
  // Trucks without a hub (data/trucks.ts `hub: false`) can be tagged but have no page.
  if (!truck || !hasHub(truck)) return null;
  const [{ posts }, categories, hub] = await Promise.all([
    listPosts({ truck: slug, status: "published", limit: 500 }),
    listCategories(),
    getHubPage(truckPath(slug)),
  ]);
  // Visibility rule: a truck hub exists only once an article is tagged with the truck.
  if (!posts.length) return null;
  const groups = categories
    .map((category) => ({ category, posts: posts.filter((post) => post.categoryId === category._id) }))
    .filter((group) => group.posts.length > 0);
  return { truck, groups, hub };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await loadTruckHub(params.truck);
  if (!data) return { title: "Page not found" };
  const { truck, hub } = data;
  // Keep the full <title> (with " | TruckBedFit", 14 chars) within ~60 characters for long truck names.
  const long = `${truck.name} Bed Accessories & Fitment`;
  const title = long.length <= 46 ? long : `${truck.name} Bed Accessories`;
  const description = `Bed sizes, fitment notes and my guides to tonneau covers, liners, toolboxes and racks for the ${truck.name}.`;
  // An SEO title/description written under Dashboard → Truck pages wins over the generated ones.
  return hubPageMetadata(hub, { title, description }, truckPath(truck.slug));
}

export default async function TruckHubPage({ params }: Params) {
  const data = await loadTruckHub(params.truck);
  if (!data) {
    await redirectIfMoved(`/trucks/${params.truck}`);
    notFound();
  }
  const { truck, groups, hub } = data;
  const years = truckYears(truck);
  const bedLabels = Array.from(new Set(truck.generations.flatMap((gen) => gen.beds.map((bed) => bed.label))));
  const guideCount = groups.reduce((sum, group) => sum + group.posts.length, 0);
  const hasArticle = Boolean(hub?.content.replace(/<[^>]*>/g, "").trim());
  const jumpLinks = [
    { href: "#bed-sizes", label: "Bed sizes" },
    { href: "#guides", label: `Guides (${guideCount})` },
    ...(hasArticle ? [{ href: "#fitment-guide", label: "Fitment guide" }] : []),
    ...(hub?.faqs.length ? [{ href: "#faq", label: "FAQs" }] : []),
  ];

  return (
    <div className="bg-background">
      <JsonLd data={itemListSchema(`${truck.name} guides`, groups.flatMap((group) => group.posts))} />
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Trucks", href: "/trucks" }, { label: truck.name }]}
        path={truckPath(truck.slug)}
        eyebrow={years ? `${truck.make} · ${years}` : truck.make}
        title={hub?.title || `${truck.name} bed accessories`}
        lead={`Bed sizes, fitment notes and every guide I've written for the ${truck.name}.`}
      >
        {bedLabels.length > 0 && (
          <p className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 text-xs font-bold uppercase tracking-widest text-slate-400">Beds</span>
            {bedLabels.map((label) => (
              <span key={label} className="rounded-sm bg-white/10 px-2.5 py-1 font-semibold text-white">{label}</span>
            ))}
          </p>
        )}
        <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
          {jumpLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200 transition-colors hover:border-accent hover:bg-accent hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </PageHeader>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6 lg:px-8">
        <HubShortAnswer hub={hub} />

        {/* At a glance: the verified bed sizes and the factory features that change what fits */}
        <section id="bed-sizes" aria-labelledby="bed-sizes-title" className="scroll-mt-24">
          <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-5">
            <div className={truck.fitmentNotes.length ? "p-6 lg:col-span-3 lg:p-8" : "p-6 lg:col-span-5 lg:p-8"}>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">At a glance</p>
              <h2 id="bed-sizes-title" className="mt-2 font-heading text-2xl font-extrabold uppercase text-primary">
                {truck.name} bed sizes
              </h2>
              <p className="mb-5 mt-1 text-sm text-slate-500">Inside length with the tailgate closed, by model years.</p>
              <BedSizeGlance truck={truck} />
              <p className="mt-5 text-xs text-slate-500">Always confirm your exact bed length and cab style before ordering.</p>
            </div>
            {truck.fitmentNotes.length > 0 && (
              <div className="border-t border-slate-200 bg-primary p-6 text-white lg:col-span-2 lg:border-l lg:border-t-0 lg:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Check before you buy</p>
                <h2 className="mt-2 font-heading text-2xl font-extrabold uppercase">Fitment notes</h2>
                <ul className="mt-5 space-y-3">
                  {truck.fitmentNotes.map((note) => (
                    <li key={note} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                      <Info size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <div id="guides" className="scroll-mt-24 space-y-16">
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

        <HubArticle hub={hub} trucks={[truck.slug]} id="fitment-guide" />

        <HubFaqs hub={hub} />
      </div>
    </div>
  );
}
