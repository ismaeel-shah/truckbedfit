import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listPosts } from "@/lib/db/content";
import { TRUCKS, truckYears } from "@/data/trucks";

/**
 * [trucktable]: every truck with its years and bed lengths, linked to that category's published
 * "best list — by truck" page for it. Rows without a page yet say so, and fill in by themselves the
 * day the page is published — the plan's "truck table with links to every truck page".
 */
export default async function TruckTable({ category }: { category: string }) {
  const pageFor = new Map<string, string>();
  try {
    const { posts } = await listPosts({ category, types: ["best-list-vehicle"], status: "published", limit: 500 });
    // listPosts is newest first. Walk oldest → newest so each truck links to its first (main) page,
    // not a later one such as an older-generation page.
    for (const post of [...posts].reverse()) {
      for (const slug of post.trucks) if (!pageFor.has(slug)) pageFor.set(slug, post.url);
    }
  } catch (err) {
    console.error("truck table lookup failed:", err);
  }

  const rows = TRUCKS.map((truck) => {
    // Non-breaking spaces keep "8 ft" on one line when the cell wraps.
    const beds = truck.generations.flatMap((g) => g.beds.map((b) => b.label.replace(/ /g, " ")));
    return {
      truck,
      years: truckYears(truck),
      beds: beds.filter((bed, i) => beds.indexOf(bed) === i).join(", "),
      href: pageFor.get(truck.slug),
    };
  });

  return (
    // The article's .prose sets word-break: break-word, which would split "lengths" mid-word in narrow cells.
    <figure className="not-prose my-8 [word-break:normal]">
      <div className="overflow-x-auto rounded-md border-2 border-slate-200">
        <table className="w-full text-left text-sm sm:min-w-[34rem]">
          <thead className="bg-primary text-white">
            <tr>
              {["Truck", "Model years", "Bed lengths", ""].map((heading, i) => (
                // Model years hide on phones so the guide link stays on screen.
                <th key={i} scope="col" className={`px-3 py-3 sm:px-4 font-heading text-sm font-bold uppercase tracking-wider ${i === 1 ? "hidden sm:table-cell" : ""}`}>
                  {heading || <span className="sr-only">Guide</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map(({ truck, years, beds, href }) => (
              <tr key={truck.slug}>
                <td className="px-3 py-3 sm:px-4 font-semibold text-primary">
                  {href ? <Link href={href} className="hover:text-accent">{truck.name}</Link> : truck.name}
                </td>
                <td className="hidden px-3 py-3 sm:px-4 text-slate-600 sm:table-cell">{years || "—"}</td>
                <td className="px-3 py-3 sm:px-4 text-slate-600">{beds || <span className="text-slate-400">Not verified yet</span>}</td>
                <td className="px-3 py-3 sm:px-4 text-right">
                  {href ? (
                    <Link href={href} className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-accent hover:text-primary">
                      See the guide <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="whitespace-nowrap text-xs text-slate-400">Coming soon</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-2 text-xs text-slate-500">
        Bed lengths are nominal sizes. Always confirm your exact bed length and cab style before ordering.
      </figcaption>
    </figure>
  );
}
