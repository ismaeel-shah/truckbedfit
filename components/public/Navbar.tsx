"use client";

import Link from "next/link";
import { Menu, X, Home, Truck, Info, LayoutGrid, ChevronDown, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useId } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Logo from "@/components/Logo";
import { categoryPath } from "@/lib/urls";

export interface NavCategory {
  name: string;
  slug: string;
  icon: string;
  postCount: number;
}

const LINKS_BEFORE = [
  { label: "Home", href: "/",     icon: Home },
  { label: "Trucks", href: "/trucks", icon: Truck },
];
const LINKS_AFTER = [
  { label: "About", href: "/about", icon: Info },
];

const HOVER_CLOSE_DELAY_MS = 150;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function guideCount(n: number) {
  return `${n} ${n === 1 ? "guide" : "guides"}`;
}

const desktopLinkClass = (active: boolean) =>
  clsx(
    "inline-flex items-center gap-1 px-3 py-2 rounded-md font-heading text-[15px] font-semibold uppercase tracking-wide transition-colors duration-150",
    active ? "bg-accent/10 text-accent" : "text-slate-700 hover:bg-slate-100 hover:text-primary"
  );

const mobileLinkClass = (active: boolean) =>
  clsx(
    "flex w-full items-center gap-3 px-3 py-2.5 rounded-md font-heading text-base font-semibold uppercase tracking-wide transition-colors",
    active ? "bg-accent/10 text-accent" : "text-slate-700 hover:bg-slate-50"
  );

export default function Navbar({ categories = [] }: { categories?: NavCategory[] }) {
  const [open, setOpen]                     = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const pathname = usePathname();
  const mobileCatsId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigating.
  useEffect(() => {
    setOpen(false);
    setMobileCatsOpen(false);
  }, [pathname]);

  // While the mobile menu is open: freeze page scroll (overflow on <html> keeps the
  // scroll position and the sticky header intact), close on Escape, and close if the
  // viewport grows to the desktop layout where the menu is hidden.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const desktop = window.matchMedia("(min-width: 768px)");
    const onViewportChange = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false); };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    desktop.addEventListener("change", onViewportChange);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      html.style.overflow = previousOverflow;
      desktop.removeEventListener("change", onViewportChange);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const categoriesActive = pathname.startsWith("/category");

  return (
    <>
    {/* Backdrop behind the mobile menu. Rendered outside <header> because the header's
        backdrop-blur would otherwise trap this fixed element inside it. */}
    {open && (
      <div
        className="fixed inset-x-0 bottom-0 top-[68px] z-40 touch-none bg-black/40 md:hidden"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
    )}
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-slate-200"
          : "bg-white/90 backdrop-blur-sm border-slate-100"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link href="/">
            <Logo id="nav" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {LINKS_BEFORE.map((l) => (
              <Link key={l.href} href={l.href} className={desktopLinkClass(isActive(pathname, l.href))}>
                {l.label}
              </Link>
            ))}
            {categories.length > 0 && (
              <CategoriesDropdown categories={categories} active={categoriesActive} />
            )}
            {LINKS_AFTER.map((l) => (
              <Link key={l.href} href={l.href} className={desktopLinkClass(isActive(pathname, l.href))}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden max-h-[calc(100dvh-68px)] overflow-y-auto overscroll-contain py-4 border-t border-slate-100">
            <nav className="flex flex-col gap-1" aria-label="Main">
              {LINKS_BEFORE.map((l) => (
                <Link key={l.href} href={l.href} className={mobileLinkClass(isActive(pathname, l.href))}>
                  <l.icon size={16} />
                  {l.label}
                </Link>
              ))}

              {categories.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setMobileCatsOpen((v) => !v)}
                    aria-expanded={mobileCatsOpen}
                    aria-controls={mobileCatsId}
                    className={mobileLinkClass(categoriesActive)}
                  >
                    <LayoutGrid size={16} />
                    Categories
                    <ChevronDown
                      size={16}
                      className={clsx("ml-auto transition-transform duration-200", mobileCatsOpen && "rotate-180")}
                    />
                  </button>
                  {mobileCatsOpen && (
                    <ul id={mobileCatsId} className="mt-1 ml-5 border-l-2 border-accent/40 pl-3 space-y-0.5">
                      {categories.map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={categoryPath(c.slug)}
                            className={clsx(
                              "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                              pathname === categoryPath(c.slug) ? "bg-accent/10 text-accent" : "text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            <span className="text-lg" aria-hidden="true">{c.icon || "🛻"}</span>
                            <span className="flex-1 font-medium">{c.name}</span>
                            <span className="text-xs text-slate-400">{guideCount(c.postCount)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {LINKS_AFTER.map((l) => (
                <Link key={l.href} href={l.href} className={mobileLinkClass(isActive(pathname, l.href))}>
                  <l.icon size={16} />
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
    </>
  );
}

/** Desktop "Categories" disclosure: opens on mouse hover or click, closes on outside click, Escape, focus loss or navigation. */
function CategoriesDropdown({ categories, active }: { categories: NavCategory[]; active: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const openedByHover = useRef(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(closeTimer.current);
    if (!open) {
      openedByHover.current = true;
      setOpen(true);
    }
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  const handleClick = () => {
    // A click right after hover opened the panel shouldn't immediately close it.
    if (open && openedByHover.current) {
      openedByHover.current = false;
      return;
    }
    openedByHover.current = false;
    setOpen((v) => !v);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-controls={panelId}
        className={desktopLinkClass(active || open)}
      >
        Categories
        <ChevronDown size={15} className={clsx("transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        // pt-3 bridges the gap so the panel doesn't close while the mouse moves onto it
        <div id={panelId} className="absolute right-0 top-full w-[min(36rem,calc(100vw-2rem))] pt-3">
          <div className="overflow-hidden rounded-md border-2 border-primary bg-white shadow-2xl">
            <div className="h-1.5 hazard-stripe" aria-hidden="true" />
            <div className="flex items-baseline justify-between px-5 pb-2 pt-4">
              <p className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Gear categories</p>
              <span className="text-xs text-slate-400">{categories.length} total</span>
            </div>
            <ul className="grid max-h-[60vh] gap-1 overflow-y-auto px-3 pb-3 sm:grid-cols-2">
              {categories.map((c) => {
                const current = pathname === categoryPath(c.slug);
                return (
                  <li key={c.slug}>
                    <Link
                      href={categoryPath(c.slug)}
                      onClick={() => setOpen(false)}
                      aria-current={current ? "page" : undefined}
                      className={clsx(
                        "group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-background",
                        current && "bg-accent/10"
                      )}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-background text-xl transition-colors group-hover:bg-accent/15" aria-hidden="true">
                        {c.icon || "🛻"}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-heading text-lg font-bold uppercase leading-tight text-primary transition-colors group-hover:text-accent">
                          {c.name}
                        </span>
                        <span className="text-xs text-slate-500">{guideCount(c.postCount)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/trucks"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between bg-primary px-5 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white transition-colors hover:text-accent"
            >
              Shop by truck <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
