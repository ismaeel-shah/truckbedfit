import { notFound, redirect, permanentRedirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Redirect from "@/lib/models/Redirect";

export const dynamic = "force-dynamic";

export default async function CatchAllPage({
  params,
}: {
  params: { catchAll: string[] };
}) {
  const pathname = `/${params.catchAll.join("/")}`;

  await connectDB();
  const doc = await Redirect.findOne({ source: pathname, active: true }).lean() as { destination: string; type: number } | null;

  if (doc) {
    if (doc.type === 301) {
      permanentRedirect(doc.destination);
    } else {
      redirect(doc.destination);
    }
  }

  notFound();
}
