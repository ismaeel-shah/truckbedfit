import RedirectsManager from "@/components/dashboard/RedirectsManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Redirects" };

async function getRedirects() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/redirects`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function RedirectsPage() {
  const redirects = await getRedirects();
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary dark:text-white">Redirects</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage 301/302 redirects. Changes apply within 60 seconds.
        </p>
      </div>
      <RedirectsManager initialRedirects={redirects} />
    </div>
  );
}
