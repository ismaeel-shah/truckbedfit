"use client";

import Link from "next/link";
import { Menu, X, Home, BookOpen, Tag, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_LINKS = [
  { label: "Home",     href: "/",       icon: Home },
  { label: "Blog",     href: "/blog",   icon: BookOpen },
  { label: "Chairs",   href: "/category/ergonomic-chairs",    icon: Tag },
  { label: "Desks",    href: "/category/desks-workstations",  icon: Tag },
  { label: "Monitors", href: "/category/monitors-displays",   icon: Tag },
  { label: "About",    href: "/about",  icon: Info },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-slate-200 dark:border-slate-800"
          : "bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border-slate-100 dark:border-slate-800/60"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="38" height="38" rx="10" fill="url(#navGrad)"/>
              {/* Monitor */}
              <rect x="9" y="8" width="15" height="11" rx="2.5" fill="white" opacity="0.95"/>
              <rect x="10.5" y="9.5" width="12" height="8" rx="1.5" fill="#0D1520" opacity="0.3"/>
              {/* Monitor stand */}
              <rect x="15" y="19" width="3" height="2.5" rx="1" fill="white" opacity="0.85"/>
              {/* Desk surface */}
              <rect x="4" y="21.5" width="30" height="3" rx="1.5" fill="white"/>
              {/* Coffee mug */}
              <rect x="25" y="16" width="5" height="5.5" rx="2.5" fill="white" opacity="0.8"/>
              <rect x="30" y="17.5" width="2" height="2.5" rx="1" fill="white" opacity="0.6"/>
              {/* Desk legs */}
              <rect x="7" y="24.5" width="2.5" height="5" rx="1.25" fill="white" opacity="0.65"/>
              <rect x="28.5" y="24.5" width="2.5" height="5" rx="1.25" fill="white" opacity="0.65"/>
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1B2A3B"/>
                  <stop offset="100%" stopColor="#2DD4BF"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col leading-none">
              <span className="font-heading font-bold text-[18px] text-primary tracking-tight">
                Home<span className="text-accent">Desk</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-[0.2em] uppercase">
                Essentials
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-slate-100 dark:border-slate-800">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => {
                const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <l.icon size={16} />
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
