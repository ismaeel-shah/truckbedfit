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
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="38" height="38" rx="10" fill="url(#footerGrad)"/>
                <rect x="9" y="8" width="15" height="11" rx="2.5" fill="white" opacity="0.95"/>
                <rect x="10.5" y="9.5" width="12" height="8" rx="1.5" fill="#0D1520" opacity="0.3"/>
                <rect x="15" y="19" width="3" height="2.5" rx="1" fill="white" opacity="0.85"/>
                <rect x="4" y="21.5" width="30" height="3" rx="1.5" fill="white"/>
                <rect x="25" y="16" width="5" height="5.5" rx="2.5" fill="white" opacity="0.8"/>
                <rect x="30" y="17.5" width="2" height="2.5" rx="1" fill="white" opacity="0.6"/>
                <rect x="7" y="24.5" width="2.5" height="5" rx="1.25" fill="white" opacity="0.65"/>
                <rect x="28.5" y="24.5" width="2.5" height="5" rx="1.25" fill="white" opacity="0.65"/>
                <defs>
                  <linearGradient id="footerGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2DD4BF"/>
                    <stop offset="100%" stopColor="#1B2A3B"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-bold text-[18px] text-white tracking-tight">
                  Home<span className="text-accent">Desk</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 tracking-[0.2em] uppercase">
                  Essentials
                </span>
              </div>
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
            © {new Date().getFullYear()} Home Desk Essentials. As an Amazon Associate, we earn from qualifying purchases.
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
