import Link from "next/link";
import { Mail } from "lucide-react";
import Logo from "@/components/Logo";
import { CONTACT_EMAIL, LEGAL_PAGES, SITE_NAME } from "@/lib/site";

export interface FooterCategory {
  name: string;
  slug: string;
  icon: string;
}

const QUICK_LINKS = [
  { label: "About Us",  href: "/about"   },
  { label: "Contact",   href: "/contact" },
  { label: "Blog",      href: "/blog"    },
];

export default function Footer({ categories = [] }: { categories?: FooterCategory[] }) {
  return (
    <footer className="bg-primary text-white mt-24">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo id="footer" tone="dark" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Your trusted guide to truck bed gear. We dig into fitment, materials,
              and real-world use so you buy the right part the first time.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition-all duration-200 hover:border-accent hover:bg-accent hover:text-primary"
            >
              <Mail size={15} aria-hidden="true" /> {CONTACT_EMAIL}
            </a>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            {categories.length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
                  Categories
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      className="flex items-center gap-2 text-sm text-slate-300 hover:text-accent transition-colors group"
                    >
                      {c.icon && <span className="text-base">{c.icon}</span>}
                      <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                        {c.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-300 hover:text-accent transition-colors hover:translate-x-0.5 inline-block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
              Legal
            </p>
            <ul className="space-y-2.5">
              {LEGAL_PAGES.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-300 hover:text-accent transition-colors hover:translate-x-0.5 inline-block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} {SITE_NAME}. As an Amazon Associate, we earn from qualifying purchases.{" "}
            <Link href="/affiliate-disclosure" className="underline-offset-2 hover:text-accent hover:underline">Read our affiliate disclosure</Link>
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
