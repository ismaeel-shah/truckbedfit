"use client";

import Link from "next/link";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useId } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Logo from "@/components/Logo";
import { categoryPath, truckPath } from "@/lib/urls";
import { PILLAR_CATEGORY_SLUG, UMBRELLA_CATEGORY_SLUG } from "@/lib/articleTypes";
import type { NavData } from "@/lib/db/content";

interface NavLinkItem {
  label: string;
  href: string;
}

type NavItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "menu"; label: string; items: NavLinkItem[]; footer?: NavLinkItem; activePrefixes: string[] };

/** Navbar trucks list length (spec: top 8 trucks + "All trucks"). */
const NAV_TRUCK_LIMIT = 8;
/** Categories with their own header link (spec order); every other live category goes under "More". */
const HEADER_CATEGORY_SLUGS = ["bed-liners", "toolboxes", "bed-racks"];
/** Anchors on the Tonneau Covers page offered in its menu (spec: By type · Reviews · Guides). */
const TONNEAU_ANCHORS = [
  { group: "best-by-type", label: "By type" },
  { group: "reviews", label: "Reviews" },
  { group: "guides", label: "Guides" },
];

/**
 * Header menu, per the spec:
 * Trucks ▾ · Tonneau Covers ▾ · Bed Liners · Toolboxes · Bed Racks · More ▾ · About
 * Only live pages appear (visibility rules); categories added later land in "More".
 */
function buildNavItems({ categories, trucks }: NavData): NavItem[] {
  const items: NavItem[] = [];
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  if (trucks.length) {
    items.push({
      kind: "menu",
      label: "Trucks",
      items: trucks.slice(0, NAV_TRUCK_LIMIT).map((t) => ({ label: t.name, href: truckPath(t.slug) })),
      footer: { label: "All trucks", href: "/trucks" },
      activePrefixes: ["/trucks"],
    });
  }

  const tonneau = bySlug.get(PILLAR_CATEGORY_SLUG);
  if (tonneau) {
    const anchors = TONNEAU_ANCHORS.filter((a) => tonneau.groups.includes(a.group)).map((a) => ({
      label: a.label,
      href: `${categoryPath(tonneau.slug)}#${a.group}`,
    }));
    items.push(
      anchors.length
        ? {
            kind: "menu",
            label: tonneau.name,
            items: anchors,
            footer: { label: `All ${tonneau.name.toLowerCase()}`, href: categoryPath(tonneau.slug) },
            activePrefixes: [categoryPath(tonneau.slug)],
          }
        : { kind: "link", label: tonneau.name, href: categoryPath(tonneau.slug) }
    );
  }

  for (const slug of HEADER_CATEGORY_SLUGS) {
    const category = bySlug.get(slug);
    // Short labels keep the header on one line ("Bed Liners", not "Bed Liners & Mats").
    if (category) items.push({ kind: "link", label: category.name.split(" & ")[0], href: categoryPath(slug) });
  }

  const handled = new Set([PILLAR_CATEGORY_SLUG, UMBRELLA_CATEGORY_SLUG, ...HEADER_CATEGORY_SLUGS]);
  const more = categories.filter((c) => !handled.has(c.slug)).map((c) => ({ label: c.name, href: categoryPath(c.slug) }));
  const umbrella = bySlug.get(UMBRELLA_CATEGORY_SLUG);
  if (more.length || umbrella) {
    items.push({
      kind: "menu",
      label: "More",
      items: more,
      footer: umbrella ? { label: "All accessories", href: categoryPath(umbrella.slug) } : undefined,
      activePrefixes: [...more.map((m) => m.href), ...(umbrella ? [categoryPath(umbrella.slug)] : [])],
    });
  }

  items.push({ kind: "link", label: "About", href: "/about" });
  return items;
}

const HOVER_CLOSE_DELAY_MS = 150;

const isActivePath = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

const desktopLinkClass = (active: boolean) =>
  clsx(
    "inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-2 rounded-md font-heading text-[15px] font-semibold uppercase tracking-wide transition-colors duration-150",
    active ? "bg-accent/10 text-accent" : "text-slate-700 hover:bg-slate-100 hover:text-primary"
  );

const mobileLinkClass = (active: boolean) =>
  clsx(
    "flex w-full items-center gap-3 px-3 py-2.5 rounded-md font-heading text-base font-semibold uppercase tracking-wide transition-colors",
    active ? "bg-accent/10 text-accent" : "text-slate-700 hover:bg-slate-50"
  );

export default function Navbar({ nav }: { nav: NavData }) {
  const [open, setOpen]               = useState(false);
  const [mobileMenu, setMobileMenu]   = useState<string | null>(null);
  const [scrolled, setScrolled]       = useState(false);
  const pathname = usePathname();
  const items = buildNavItems(nav);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigating.
  useEffect(() => {
    setOpen(false);
    setMobileMenu(null);
  }, [pathname]);

  // While the mobile menu is open: freeze page scroll (overflow on <html> keeps the
  // scroll position and the sticky header intact), close on Escape, and close if the
  // viewport grows to the desktop layout where the menu is hidden.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const desktop = window.matchMedia("(min-width: 1024px)");
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

  return (
    <>
    {/* Backdrop behind the mobile menu. Rendered outside <header> because the header's
        backdrop-blur would otherwise trap this fixed element inside it. */}
    {open && (
      <div
        className="fixed inset-x-0 bottom-0 top-[68px] z-40 touch-none bg-black/40 lg:hidden"
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
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main">
            {items.map((item) =>
              item.kind === "link" ? (
                <Link key={item.href} href={item.href} className={desktopLinkClass(isActivePath(pathname, item.href))}>
                  {item.label}
                </Link>
              ) : (
                <NavDropdown
                  key={item.label}
                  item={item}
                  active={item.activePrefixes.some((p) => isActivePath(pathname, p))}
                />
              )
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden max-h-[calc(100dvh-68px)] overflow-y-auto overscroll-contain py-4 border-t border-slate-100">
            <nav className="flex flex-col gap-1" aria-label="Main">
              <Link href="/" className={mobileLinkClass(pathname === "/")}>Home</Link>
              {items.map((item) =>
                item.kind === "link" ? (
                  <Link key={item.href} href={item.href} className={mobileLinkClass(isActivePath(pathname, item.href))}>
                    {item.label}
                  </Link>
                ) : (
                  <MobileMenuSection
                    key={item.label}
                    item={item}
                    expanded={mobileMenu === item.label}
                    onToggle={() => setMobileMenu((m) => (m === item.label ? null : item.label))}
                    active={item.activePrefixes.some((p) => isActivePath(pathname, p))}
                  />
                )
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
    </>
  );
}

type MenuItem = Extract<NavItem, { kind: "menu" }>;

function MobileMenuSection({ item, expanded, onToggle, active }: {
  item: MenuItem; expanded: boolean; onToggle: () => void; active: boolean;
}) {
  const listId = useId();
  const links = item.footer ? [...item.items, item.footer] : item.items;
  return (
    <div>
      <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={listId} className={mobileLinkClass(active)}>
        {item.label}
        <ChevronDown size={16} className={clsx("ml-auto transition-transform duration-200", expanded && "rotate-180")} aria-hidden="true" />
      </button>
      {expanded && (
        <ul id={listId} className="mt-1 ml-5 border-l-2 border-accent/40 pl-3 space-y-0.5">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="block rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Desktop dropdown: opens on mouse hover or click, closes on outside click, Escape, focus loss or navigation. */
function NavDropdown({ item, active }: { item: MenuItem; active: boolean }) {
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
        {item.label}
        <ChevronDown size={15} className={clsx("transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        // pt-3 bridges the gap so the panel doesn't close while the mouse moves onto it
        <div id={panelId} className="absolute right-0 top-full w-64 pt-3">
          <div className="overflow-hidden rounded-md border-2 border-primary bg-white shadow-2xl">
            <div className="h-1.5 hazard-stripe" aria-hidden="true" />
            {item.items.length > 0 && (
              <ul className="max-h-[60vh] overflow-y-auto p-2">
                {item.items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className="block rounded-md px-3 py-2 font-heading text-base font-bold uppercase text-primary transition-colors hover:bg-background hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {item.footer && (
              <Link
                href={item.footer.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between bg-primary px-4 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white transition-colors hover:text-accent"
              >
                {item.footer.label} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
