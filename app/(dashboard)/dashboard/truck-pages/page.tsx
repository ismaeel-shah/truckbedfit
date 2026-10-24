import Link from "next/link";
import { CheckCircle2, Circle, Pencil } from "lucide-react";
import { listLiveTrucks } from "@/lib/db/content";
import { defaultHubTitle, hubPaths, listHubPages, TRUCKS_INDEX_PATH } from "@/lib/db/hubPages";

export const dynamic = "force-dynamic";
export const metadata = { title: "Truck pages" };

const displayDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

async function loadRows() {
  const [hubs, liveTrucks] = await Promise.all([
    listHubPages(),
    listLiveTrucks().catch(() => [] as Awaited<ReturnType<typeof listLiveTrucks>>),
  ]);
  const byPath = new Map(hubs.map((hub) => [hub.path, hub]));
  const articleCount = new Map(liveTrucks.map(({ truck, count }) => [`/trucks/${truck.slug}`, count]));
  return hubPaths().map((path) => {
    const hub = byPath.get(path);
    const count = path === TRUCKS_INDEX_PATH ? liveTrucks.length : articleCount.get(path) ?? 0;
    return {
      path,
      title: hub?.title || defaultHubTitle(path),
      written: Boolean(hub?.content.replace(/<[^>]*>/g, "").trim()),
      updatedOn: hub?.updatedOn ?? null,
      live: count > 0,
      detail: path === TRUCKS_INDEX_PATH
        ? `${count} ${count === 1 ? "truck" : "trucks"} live`
        : `${count} ${count === 1 ? "article" : "articles"}`,
    };
  });
}

export default async function TruckPagesPage() {
  const rows = await loadRows();
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary dark:text-white">Truck pages</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Write the intro, SEO title, description and FAQs for /trucks and each truck&apos;s page. The bed table and article
          lists are added automatically. A truck page goes live with its first published article.
        </p>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:bg-slate-800/60">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Page</th>
              <th scope="col" className="px-4 py-3 font-semibold">Content</th>
              <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Status</th>
              <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Updated</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {rows.map((row) => (
              <tr key={row.path} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-primary dark:text-white">{row.title}</p>
                  <p className="font-mono text-xs text-slate-400">{row.path}</p>
                </td>
                <td className="px-4 py-3">
                  {row.written ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                      <CheckCircle2 size={14} aria-hidden="true" /> Written
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Circle size={14} aria-hidden="true" /> Not yet
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-xs sm:table-cell">
                  <span className={row.live ? "font-medium text-green-600" : "text-slate-400"}>{row.live ? "Live" : "Not live"}</span>
                  <span className="text-slate-400"> · {row.detail}</span>
                </td>
                <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">{row.updatedOn ? displayDay(row.updatedOn) : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/truck-pages/edit?path=${encodeURIComponent(row.path)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-accent hover:text-accent dark:border-slate-700 dark:text-slate-300"
                  >
                    <Pencil size={12} aria-hidden="true" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
