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
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-white/80 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center shadow-md shadow-accent/30">
              <span className="text-primary font-heading font-black text-sm">W</span>
            </div>
            <span className="font-heading font-bold text-xl text-primary">
              Work<span className="text-accent">Nest</span>
            </span>
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
                      : "text-slate-600 hover:bg-slate-100 hover:text-primary"
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
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-slate-100">
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
                        : "text-slate-600 hover:bg-slate-50"
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
