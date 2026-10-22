import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/public/PageHeader";
import { getPageMeta } from "@/lib/utils/pageSettings";
import { SITE_NAME } from "@/lib/site";
import { staticPageMetadata } from "@/lib/utils/seo";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("page_about");
  const base = staticPageMetadata(
    meta.metaTitle || "About",
    meta.metaDescription || `${SITE_NAME} is an independent guide to truck bed accessories — fitment-first buying guides for covers, liners, toolboxes and racks.`,
    "/about"
  );
  return meta.metaTitle ? { ...base, title: { absolute: meta.metaTitle } } : base;
}

export default function AboutPage() {
  return (
    <div className="bg-background">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        path="/about"
        eyebrow="About us"
        title={`About ${SITE_NAME}`}
        lead="An independent guide to outfitting a pickup truck bed — fitment first."
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:uppercase">
          <p>
            {SITE_NAME} is your go-to resource for outfitting a pickup truck bed. We research tonneau covers, bed liners
            and mats, toolboxes, racks, cargo management and everything else truck owners need to haul, protect and
            organize their gear.
          </p>
          <h2>Our Mission</h2>
          <p>
            The wrong accessory is a wasted weekend and a return label. We focus on fitment first — bed length, cab
            style, model year and rail systems — so you can buy with confidence. Our single-niche focus means deeper,
            more useful guides than any generalist auto blog can offer.
          </p>
          <h2>How We Work</h2>
          <p>
            We don&apos;t test products ourselves. Our picks come from manufacturer specs, official fitment guides and
            owner reports — see <Link href="/how-we-research">how we research</Link> for the details.
          </p>
          <h2>Affiliate Disclosure</h2>
          <p>
            {SITE_NAME} participates in the Amazon Associates program. When you click our Amazon links and make a
            purchase, we earn a small commission at no extra cost to you. This helps us keep the site running and the
            content free. Our editorial opinions are never influenced by affiliate relationships. Read our full{" "}
            <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
