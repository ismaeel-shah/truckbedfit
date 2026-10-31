import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BookOpenCheck, CalendarRange, ClipboardList, Factory, Mail, MessagesSquare, Ruler, ShieldCheck, User, Wrench,
} from "lucide-react";
import PageHeader from "@/components/public/PageHeader";
import { getPageMeta } from "@/lib/utils/pageSettings";
import { getAuthorBySlug, listLiveAuthors, listLiveCategories, listLiveTrucks } from "@/lib/db/content";
import { authorPath, categoryPath } from "@/lib/urls";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { staticPageMetadata } from "@/lib/utils/seo";
import { imgLoadingProps } from "@/lib/utils/imageProps";

/** The site owner's author profile, shown in "Who's behind it". */
const OWNER_SLUG = "ismail-shah";

/** Accessory types in the intro; each links to its category once that category has a live page. */
const GEAR = [
  { label: "tonneau covers", slug: "tonneau-covers" },
  { label: "bed liners and mats", slug: "bed-liners" },
  { label: "tool boxes", slug: "toolboxes" },
  { label: "bed racks", slug: "bed-racks" },
  { label: "bed extenders", slug: "bed-extenders" },
];

const FITMENT_FACTORS = [
  {
    icon: CalendarRange,
    title: "Model year and generation",
    text: "Redesigns change bed rails and tailgates even when the bed length stays the same.",
  },
  {
    icon: Ruler,
    title: "Bed length",
    text: "Truck makers and accessory makers often label the same bed differently.",
  },
  {
    icon: Factory,
    title: "Factory bed features",
    text: "Special tailgates, rail systems, carbon-fiber beds and in-bed storage boxes.",
  },
];

const SOURCES = [
  { icon: ClipboardList, title: "Truck makers’ specifications", text: "For bed sizes and model years." },
  { icon: BookOpenCheck, title: "Fitment listings", text: "From manufacturers and retailers, down to exact part numbers." },
  { icon: MessagesSquare, title: "Owner reports", text: "From truck forums and long-term reviews, including the complaints." },
];

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("page_about");
  const base = staticPageMetadata(
    meta.metaTitle || "About",
    meta.metaDescription ||
      `${SITE_NAME} helps pickup owners find bed gear that actually fits their truck — researched from truck specs, fitment listings and owner reports.`,
    "/about"
  );
  return meta.metaTitle ? { ...base, title: { absolute: meta.metaTitle } } : base;
}

/** Live pages this page may link to; anything that fails just renders as plain text. */
async function loadLinks() {
  const [categories, trucks, authors, owner] = await Promise.all([
    listLiveCategories().catch(() => []),
    listLiveTrucks().catch(() => []),
    listLiveAuthors().catch(() => []),
    getAuthorBySlug(OWNER_SLUG).catch(() => null),
  ]);
  return {
    liveCategories: new Set(categories.map((category) => category.slug)),
    trucksLive: trucks.length > 0,
    ownerLive: authors.some((author) => author.slug === OWNER_SLUG),
    owner,
  };
}

const linkClass = "font-semibold text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent";

function SectionHeading({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-accent">
        <span className="h-0.5 w-8 bg-accent" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-3xl font-extrabold uppercase leading-none text-primary md:text-4xl">{children}</h2>
    </div>
  );
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 font-semibold text-accent">
      {children}
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

export default async function AboutPage() {
  const { liveCategories, trucksLive, ownerLive, owner } = await loadLinks();

  return (
    <div className="bg-background">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        path="/about"
        eyebrow="About"
        title={`About ${SITE_NAME}`}
        lead={`${SITE_NAME} helps pickup owners find bed gear that actually fits their truck.`}
      />

      <div className="mx-auto max-w-4xl space-y-16 px-4 py-14 sm:px-6 md:space-y-20">
        {/* Intro */}
        <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
          I research{" "}
          {GEAR.map((gear, i) => (
            <span key={gear.slug}>
              {i > 0 && ", "}
              {liveCategories.has(gear.slug) ? (
                <Link href={categoryPath(gear.slug)} className={linkClass}>{gear.label}</Link>
              ) : (
                gear.label
              )}
            </span>
          ))}{" "}
          and the other accessories truck owners use to haul, protect and organize their gear.
        </p>

        {/* Who's behind it */}
        <section aria-labelledby="who">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 hazard-stripe" aria-hidden="true" />
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-accent/10 ring-4 ring-accent/15">
                {owner?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={owner.photo} alt={owner.name} className="h-full w-full object-cover" {...imgLoadingProps(false)} />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-accent"><User size={40} aria-hidden="true" /></span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Who&apos;s behind it</p>
                <h2 id="who" className="mt-2 font-heading text-3xl font-extrabold uppercase leading-none text-primary">Ismail Shah</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Software engineer · lifelong truck enthusiast</p>
                <p className="mt-4 leading-relaxed text-slate-700">
                  I&apos;m Ismail Shah, a software engineer and lifelong truck enthusiast. I don&apos;t own a truck yet, but my
                  dream of a couple of well-known trucks, each set up just right with a good cover on the bed, led me into
                  years of research on what fits what. {SITE_NAME} is where I&apos;ve put that research to work.
                </p>
                {ownerLive && (
                  <div className="mt-4">
                    <ArrowLink href={authorPath(OWNER_SLUG)}>Read more about me</ArrowLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Why fitment comes first */}
        <section aria-labelledby="fitment">
          <SectionHeading eyebrow="Fitment first"><span id="fitment">Why fitment comes first</span></SectionHeading>
          <p className="max-w-3xl leading-relaxed text-slate-700">
            The wrong accessory means a wasted weekend and a return label. And on a pickup, &ldquo;fits your truck&rdquo; is
            more complicated than it sounds. The same model can need different parts depending on:
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {FITMENT_FACTORS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-slate-200 bg-white p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-accent">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold uppercase leading-tight text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl leading-relaxed text-slate-700">
            That&apos;s why everything on this site is organized by truck first. Every truck page lists its bed sizes by
            model year and the features that change what fits.
          </p>
          {trucksLive && (
            <div className="mt-4">
              <ArrowLink href="/trucks">Find your truck</ArrowLink>
            </div>
          )}
        </section>

        {/* How I work */}
        <section aria-labelledby="how">
          <SectionHeading eyebrow="Method"><span id="how">How I work</span></SectionHeading>
          <div className="flex items-start gap-3 rounded-xl border-l-4 border-accent bg-accent/5 px-5 py-4">
            <Wrench size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            <p className="font-medium leading-relaxed text-primary">
              I don&apos;t install or test products myself, and I never write as if I have. Every recommendation is built
              from three kinds of sources:
            </p>
          </div>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {SOURCES.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-xl border border-slate-200 bg-white p-5">
                <span className="absolute right-5 top-4 font-heading text-4xl font-extrabold leading-none text-slate-100" aria-hidden="true">
                  {i + 1}
                </span>
                <Icon size={24} className="relative text-accent" aria-hidden="true" />
                <h3 className="relative mt-3 font-heading text-lg font-bold uppercase leading-tight text-primary">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-3xl leading-relaxed text-slate-700">
            When sources disagree, I say so, and I&apos;d rather leave a measurement out than guess. AI tools help me with
            first drafts, but every fact, part number and measurement is checked by hand against the sources listed in
            each guide.
          </p>
          <div className="mt-4">
            <ArrowLink href="/how-we-research">See exactly how I research</ArrowLink>
          </div>
        </section>

        {/* Corrections + Affiliate disclosure */}
        <div className="grid gap-6 md:grid-cols-2">
          <section aria-labelledby="corrections" className="rounded-2xl bg-primary p-6 text-white sm:p-8">
            <Mail size={26} className="text-accent" aria-hidden="true" />
            <h2 id="corrections" className="mt-4 font-heading text-2xl font-extrabold uppercase leading-none">Corrections</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Truck accessories change often, and I update guides when fitment, specs or products change. If you spot a
              mistake, or own one of these products and want to share how it&apos;s held up, email me at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent hover:underline">{CONTACT_EMAIL}</a>{" "}
              or use the <Link href="/contact" className="font-semibold text-accent hover:underline">contact form</Link>.
              Corrections from real owners make the site better for everyone.
            </p>
          </section>

          <section aria-labelledby="disclosure" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <ShieldCheck size={26} className="text-accent" aria-hidden="true" />
            <h2 id="disclosure" className="mt-4 font-heading text-2xl font-extrabold uppercase leading-none text-primary">
              Affiliate disclosure
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {SITE_NAME} is reader-supported. As an Amazon Associate I earn from qualifying purchases. When you buy
              through links on this site, I may earn a small commission from Amazon or other retailers, at no extra cost
              to you. Those commissions keep the site running and the guides free, and they&apos;re helping me save for my
              first truck.
            </p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-primary">
              Commissions never decide what I recommend; fit and owner feedback do.
            </p>
            <div className="mt-4 text-sm">
              <ArrowLink href="/affiliate-disclosure">Read the full Affiliate Disclosure</ArrowLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
