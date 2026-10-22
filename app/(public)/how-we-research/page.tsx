import Link from "next/link";
import PageHeader from "@/components/public/PageHeader";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { staticPageMetadata } from "@/lib/utils/seo";

export const metadata = staticPageMetadata(
  "How We Research",
  `How ${SITE_NAME} picks truck bed accessories: manufacturer specs, fitment guides and owner reports. We don't test products ourselves.`,
  "/how-we-research"
);

export default function HowWeResearchPage() {
  return (
    <div className="bg-background">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "How We Research" }]}
        path="/how-we-research"
        eyebrow="Our method"
        title="How we research"
        lead="How we pick: specs, fitment guides and owner reports. We don't test products ourselves."
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:uppercase prose-li:my-1">
          <p>
            Truck bed accessories only work if they fit. Every guide on {SITE_NAME} starts from that question: will this
            fit <em>your</em> truck? Here&apos;s exactly how we answer it — and what we don&apos;t do.
          </p>

          <h2>We don&apos;t test products ourselves</h2>
          <p>
            We don&apos;t install, drive with or lab-test the products we write about, and we never pretend to. Our
            recommendations come from research, and we say where our information comes from.
          </p>

          <h2>What we look at</h2>
          <ul>
            <li><strong>Manufacturer specs and instructions</strong> — materials, weight, installation method and requirements.</li>
            <li><strong>Official fitment guides</strong> — the make, model, model year, cab and bed length a product is listed for.</li>
            <li><strong>Owner reports</strong> — reviews, forum threads and Q&amp;As, to spot recurring fit problems, leaks or durability complaints.</li>
            <li><strong>Bed dimensions</strong> — the verified bed sizes on our truck pages, so you can compare against your own truck.</li>
          </ul>

          <h2>How we check fit</h2>
          <p>
            For each product we match the listed fitment against bed length, cab style and model year, and we flag
            factory features that commonly cause problems — special tailgates, built-in rail or storage systems, or
            bed redesigns between model years. When something needs checking on your truck, we tell you what to check.
          </p>

          <h2>How we choose our picks</h2>
          <p>
            We shortlist products that fit the trucks a guide covers, then compare build quality, features, warranty
            and value. We point out downsides as well as strengths, and we explain who a product is <em>not</em> right
            for.
          </p>

          <h2>Keeping guides current</h2>
          <p>
            Every article shows a &quot;Last updated&quot; date. We revisit guides when products, prices or truck models
            change, and we only move that date when the content actually changes.
          </p>

          <h2>How we make money</h2>
          <p>
            We earn a commission when you buy through some of our links, at no extra cost to you. It never decides what
            we recommend. Details are in our <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.
          </p>

          <h2>Spotted a mistake?</h2>
          <p>
            Fitment details change and mistakes happen. If something on our site is wrong or out of date, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll fix it.
          </p>
        </div>
      </div>
    </div>
  );
}
