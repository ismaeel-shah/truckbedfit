import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/public/PageHeader";
import { listLiveTrucks } from "@/lib/db/content";
import { truckPath } from "@/lib/urls";
import { truckYears } from "@/data/trucks";
import { staticPageMetadata } from "@/lib/utils/seo";

export const dynamic = "force-dynamic";

export const metadata = staticPageMetadata(
  "Truck Bed Accessories by Truck",
  "Pick your pickup to see its bed sizes, fitment notes and every tonneau cover, liner, toolbox and rack guide for it.",
  "/trucks"
);

export default async function TrucksIndexPage() {
  // Only trucks with at least one published article get a hub (visibility rule);
  // with none live the index itself is a 404 rather than an empty page.
  const trucks = await listLiveTrucks();
  if (!trucks.length) notFound();

  return (
    <div className="bg-background">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Trucks" }]}
        path="/trucks"
        eyebrow="Shop by truck"
        title="Find gear for your truck"
        lead="Bed sizes, fitment notes and every guide we've written for your pickup."
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trucks.map(({ truck, count }) => {
              const beds = truck.generations.flatMap((g) => g.beds.map((b) => b.label));
              return (
                <li key={truck.slug}>
                  <Link
                    href={truckPath(truck.slug)}
                    className="group flex h-full flex-col rounded-md border-2 border-slate-200 bg-white p-5 transition-colors hover:border-accent"
                  >
                    <span className="font-heading text-2xl font-extrabold uppercase leading-tight text-primary group-hover:text-accent">
                      {truck.name}
                    </span>
                    {truckYears(truck) && <span className="mt-1 text-sm text-slate-500">{truckYears(truck)}</span>}
                    {beds.length > 0 && (
                      <span className="mt-3 flex flex-wrap gap-1.5">
                        {beds.filter((bed, i) => beds.indexOf(bed) === i).map((bed) => (
                          <span key={bed} className="rounded-sm bg-background px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {bed} bed
                          </span>
                        ))}
                      </span>
                    )}
                    <span className="mt-auto flex items-center justify-between pt-5 text-xs font-bold uppercase tracking-widest text-primary group-hover:text-accent">
                      {count} {count === 1 ? "guide" : "guides"} <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
      </div>
    </div>
  );
}
