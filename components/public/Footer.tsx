import Link from "next/link";
import { Mail, Rss, MessageCircle, Play } from "lucide-react";

const CATEGORIES = [
  { label: "Ergonomic Chairs",        href: "/category/ergonomic-chairs",        icon: "🪑" },
  { label: "Desks & Stations",        href: "/category/desks-workstations",      icon: "🗂️" },
  { label: "Monitors",                href: "/category/monitors-displays",       icon: "🖥️" },
  { label: "Keyboards & Mice",        href: "/category/keyboards-mice",          icon: "⌨️" },
  { label: "Lighting & Webcams",      href: "/category/lighting-webcams",        icon: "💡" },
  { label: "Headphones",              href: "/category/headphones-audio",        icon: "🎧" },
  { label: "Networking",              href: "/category/networking",              icon: "🌐" },
  { label: "Accessories",             href: "/category/cables-accessories",      icon: "🔌" },
  { label: "Storage & Organization",  href: "/category/storage-organization",    icon: "🗄️" },
  { label: "Printer & Scanning",      href: "/category/printer-scanning",        icon: "🖨️" },
  { label: "Power & Surge Protection",href: "/category/power-surge-protection",  icon: "⚡" },
  { label: "Notebooks & Stationery",  href: "/category/notebooks-stationery",    icon: "📓" },
  { label: "Standing Desk Accessories",href: "/category/standing-desk-accessories",icon: "🧍" },
  { label: "Bags & Cases",            href: "/category/bags-cases",              icon: "💼" },
];

const QUICK_LINKS = [
  { label: "About Us",  href: "/about"   },
  { label: "Contact",   href: "/contact" },
  { label: "Blog",      href: "/blog"    },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-24">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
                <span className="text-primary font-heading font-black text-sm">W</span>
              </div>
              <span className="font-heading font-bold text-xl">
                Work<span className="text-accent">Nest</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Your trusted guide for home office gear. We research so you can
              work better from anywhere.
            </p>
            <div className="flex items-center gap-3">
              {[MessageCircle, Play, Rss, Mail].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-accent hover:text-primary border border-white/10 hover:border-accent flex items-center justify-center transition-all duration-200"
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
              Categories
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-accent transition-colors group"
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                    {c.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
              Quick Links
            </h4>
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
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} WorkNest. As an Amazon Associate, we earn from qualifying purchases.
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
