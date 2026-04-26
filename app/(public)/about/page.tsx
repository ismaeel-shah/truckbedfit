import { Metadata } from "next";
import { getPageMeta } from "@/lib/utils/pageSettings";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("page_about");
  return {
    title: meta.metaTitle
      ? { absolute: meta.metaTitle }
      : "About",
    description: meta.metaDescription || "About Home Desk Essentials — your trusted home office equipment guide.",
  };
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-heading text-4xl font-bold text-primary dark:text-white mb-6">
        About Home Desk Essentials
      </h1>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p>
          Home Desk Essentials is your go-to resource for building the perfect home office.
          We research, test, and review the best ergonomic chairs, standing
          desks, monitors, keyboards, lighting setups, and everything else
          remote workers need to stay productive and comfortable.
        </p>
        <h2>Our Mission</h2>
        <p>
          We believe everyone deserves a workspace that supports their health
          and productivity. Our single-niche focus on home office equipment
          means you get deeper, more useful content than any generalist tech
          blog can offer.
        </p>
        <h2>Affiliate Disclosure</h2>
        <p>
          Home Desk Essentials participates in the Amazon Associates program. When you click
          our Amazon links and make a purchase, we earn a small commission at no
          extra cost to you. This helps us keep the site running and the content
          free.
        </p>
        <p>
          We only recommend products we genuinely believe are worth your money.
          Our editorial opinions are never influenced by affiliate relationships.
        </p>
      </div>
    </div>
  );
}
