import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import HubPageForm from "@/components/dashboard/HubPageForm";
import { listLiveTrucks } from "@/lib/db/content";
import { defaultHubTitle, emptyHubPage, getHubPage, isHubPath, TRUCKS_INDEX_PATH } from "@/lib/db/hubPages";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit truck page" };

export default async function EditTruckPage({ searchParams }: { searchParams: { path?: string } }) {
  const path = searchParams.path ?? "";
  if (!isHubPath(path)) notFound();

  const [hub, liveTrucks] = await Promise.all([
    getHubPage(path),
    listLiveTrucks().catch(() => [] as Awaited<ReturnType<typeof listLiveTrucks>>),
  ]);
  const live = path === TRUCKS_INDEX_PATH
    ? liveTrucks.length > 0
    : liveTrucks.some(({ truck }) => `/trucks/${truck.slug}` === path);

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/truck-pages" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-accent">
          <ArrowLeft size={14} aria-hidden="true" /> Truck pages
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-bold text-primary dark:text-white">Edit truck page</h1>
      </div>
      <HubPageForm initial={hub ?? emptyHubPage(path)} defaultTitle={defaultHubTitle(path)} live={live} />
    </div>
  );
}
