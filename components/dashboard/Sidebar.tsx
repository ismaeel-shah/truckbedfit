"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, FolderOpen, Image, Settings, LogOut, ExternalLink, Users, UserCircle, ArrowLeftRight,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { label: "Dashboard",  href: "/dashboard",            icon: LayoutDashboard },
  { label: "Posts",      href: "/dashboard/posts",      icon: FileText },
  { label: "Categories", href: "/dashboard/categories", icon: FolderOpen },
  { label: "Authors",    href: "/dashboard/authors",    icon: UserCircle },
  { label: "Media",      href: "/dashboard/media",      icon: Image },
  { label: "Users",      href: "/dashboard/users",      icon: Users },
  { label: "Redirects",  href: "/dashboard/redirects",  icon: ArrowLeftRight },
  { label: "Settings",   href: "/dashboard/settings",   icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-primary text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="34" height="34" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="38" rx="10" fill="url(#sidebarGrad)"/>
            <rect x="9" y="8" width="15" height="11" rx="2.5" fill="white" opacity="0.95"/>
            <rect x="10.5" y="9.5" width="12" height="8" rx="1.5" fill="#0D1520" opacity="0.3"/>
            <rect x="15" y="19" width="3" height="2.5" rx="1" fill="white" opacity="0.85"/>
            <rect x="4" y="21.5" width="30" height="3" rx="1.5" fill="white"/>
            <rect x="25" y="16" width="5" height="5.5" rx="2.5" fill="white" opacity="0.8"/>
            <rect x="30" y="17.5" width="2" height="2.5" rx="1" fill="white" opacity="0.6"/>
            <rect x="7" y="24.5" width="2.5" height="5" rx="1.25" fill="white" opacity="0.65"/>
            <rect x="28.5" y="24.5" width="2.5" height="5" rx="1.25" fill="white" opacity="0.65"/>
            <defs>
              <linearGradient id="sidebarGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2DD4BF"/>
                <stop offset="100%" stopColor="#1B2A3B"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-heading font-bold text-[16px] text-white tracking-tight">
              Home<span className="text-accent">Desk</span>
            </span>
            <span className="text-[8px] font-semibold text-slate-400 tracking-[0.2em] uppercase">
              Essentials
            </span>
          </div>
        </Link>
        <p className="text-xs text-slate-400 mt-2">Admin Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-primary"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink size={18} /> View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
