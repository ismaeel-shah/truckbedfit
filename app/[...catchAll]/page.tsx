import { notFound, redirect, permanentRedirect } from "next/navigation";
import { getD1 } from "@/lib/db/d1";

export const dynamic = "force-dynamic";

export default async function CatchAllPage({
  params,
}: {
  params: { catchAll: string[] };
}) {
  const pathname = `/${params.catchAll.join("/")}`;
  const db = getD1();
  const doc = await db
    .prepare("SELECT destination, type FROM redirects WHERE source = ? AND active = 1")
    .bind(pathname)
    .first<{ destination: string; type: number }>();

  if (doc) {
    if (doc.type === 301) permanentRedirect(doc.destination);
    else redirect(doc.destination);
  }

  notFound();
}
