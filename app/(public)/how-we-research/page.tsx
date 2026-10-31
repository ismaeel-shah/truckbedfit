import Link from "next/link";
import PageHeader from "@/components/public/PageHeader";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { staticPageMetadata } from "@/lib/utils/seo";

export const metadata = staticPageMetadata(
  "How I Research",
  `How ${SITE_NAME} picks truck bed accessories: truck specs, fitment listings and owner reports. I don't install or test products myself.`,
  "/how-we-research"
);

export default function HowWeResearchPage() {
  return (
    <div className="bg-background">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "How I Research" }]}
        path="/how-we-research"
        eyebrow="My method"
        title="How I research"
        lead="How I pick: truck specs, fitment listings and owner reports. I don't install or test products myself."
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:uppercase prose-li:my-1">
          <p>
            Truck bed accessories only work if they fit. Every guide on {SITE_NAME} starts from that question: will this
            fit <em>your</em> truck? Here&apos;s exactly how I answer it — and what I don&apos;t do.
          </p>

          <h2>I don&apos;t test products myself</h2>
          <p>
            I don&apos;t install, drive with or lab-test the products I write about, and I never write as if I have. My
            recommendations come from research, and I say where my information comes from.
          </p>

          <h2>What I look at</h2>
          <ul>
            <li><strong>Truck makers&apos; specifications</strong> — bed sizes and model years.</li>
            <li><strong>Manufacturer and retailer fitment listings</strong> — the make, model, model year, cab and bed length a product is listed for, down to exact part numbers.</li>
            <li><strong>Manufacturer specs and instructions</strong> — materials, weight, installation method and requirements.</li>
            <li><strong>Owner reports</strong> — truck forums, long-term reviews and Q&amp;As, including the complaints, to spot recurring fit problems, leaks or durability issues.</li>
          </ul>

          <h2>How I check fit</h2>
          <p>
            For each product I match the listed fitment against bed length, cab style and model year, and I flag
            factory features that commonly cause problems — special tailgates, built-in rail or storage systems, or
            bed redesigns between model years. When something needs checking on your truck, I tell you what to check.
            The bed sizes on each truck page are listed by model year so you can compare them against your own truck.
          </p>

          <h2>When sources disagree</h2>
          <p>
            When sources disagree, I say so, and I&apos;d rather leave a measurement out than guess. AI tools help me with
            first drafts, but every fact, part number and measurement is checked by hand against the sources listed in
            each guide.
          </p>

          <h2>How I choose my picks</h2>
          <p>
            I shortlist products that fit the trucks a guide covers, then compare build quality, features, warranty
            and value. I point out downsides as well as strengths, and I explain who a product is <em>not</em> right
            for.
          </p>

          <h2>Keeping guides current</h2>
          <p>
            Every article shows when it was published and, once I&apos;ve revised it, when it was last updated. I
            revisit guides when fitment, specs or products change; small fixes like typos don&apos;t change that date.
          </p>

          <h2>How I make money</h2>
          <p>
            I earn a commission when you buy through some of my links, at no extra cost to you. It never decides what
            I recommend; fit and owner feedback do. Details are in the <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.
          </p>

          <h2>Spotted a mistake?</h2>
          <p>
            Fitment details change and mistakes happen. If something on the site is wrong or out of date, email me at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or use the <Link href="/contact">contact form</Link>,
            and I&apos;ll fix it. You can read more about me on the <Link href="/about">About</Link> page.
          </p>
        </div>
      </div>
    </div>
  );
}
