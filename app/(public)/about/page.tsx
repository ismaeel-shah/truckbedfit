import { Metadata } from "next";
import Link from "next/link";
import { getPageMeta } from "@/lib/utils/pageSettings";
import { SITE_NAME } from "@/lib/site";
import { staticPageMetadata } from "@/lib/utils/seo";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("page_about");
  const base = staticPageMetadata(
    meta.metaTitle || "About",
    meta.metaDescription || `${SITE_NAME} is an independent guide to truck bed accessories — fitment-first reviews of covers, liners, toolboxes and racks.`,
    "/about"
  );
  return meta.metaTitle ? { ...base, title: { absolute: meta.metaTitle } } : base;
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-heading text-4xl font-bold text-primary dark:text-white mb-6">
        About {SITE_NAME}
      </h1>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p>
          {SITE_NAME} is your go-to resource for outfitting a pickup truck bed.
          We research and review tonneau covers, bed liners and mats, toolboxes,
          racks, cargo management, and everything else truck owners need to haul,
          protect, and organize their gear.
        </p>
        <h2>Our Mission</h2>
        <p>
          The wrong accessory is a wasted weekend and a return label. We focus on
          fitment first — bed length, cab style, model year, and rail systems — so
          you can buy with confidence. Our single-niche focus means deeper, more
          useful guides than any generalist auto blog can offer.
        </p>
        <h2>Affiliate Disclosure</h2>
        <p>
          {SITE_NAME} participates in the Amazon Associates program. When you click
          our Amazon links and make a purchase, we earn a small commission at no
          extra cost to you. This helps us keep the site running and the content
          free.
        </p>
        <p>
          We only recommend products we genuinely believe are worth your money.
          Our editorial opinions are never influenced by affiliate relationships.
          Read our full <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.
        </p>
      </div>
    </div>
  );
}
