import { notFound } from "next/navigation";
import { redirectIfMoved } from "@/lib/db/redirects";

export const dynamic = "force-dynamic";

// Unknown URLs with 3+ segments land here (1–2 segments hit /[category] and
// /[category]/[slug]); all of them check the redirects table before 404ing.
export default async function CatchAllPage({
  params,
}: {
  params: { catchAll: string[] };
}) {
  await redirectIfMoved(`/${params.catchAll.join("/")}`);
  notFound();
}
