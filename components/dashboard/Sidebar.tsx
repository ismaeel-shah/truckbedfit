"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, FolderOpen, Image, Settings, LogOut, ExternalLink, Users,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { label: "Dashboard",  href: "/dashboard",            icon: LayoutDashboard },
  { label: "Posts",      href: "/dashboard/posts",      icon: FileText },
  { label: "Categories", href: "/dashboard/categories", icon: FolderOpen },
  { label: "Media",      href: "/dashboard/media",      icon: Image },
  { label: "Users",      href: "/dashboard/users",      icon: Users },
  { label: "Settings",   href: "/dashboard/settings",   icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-primary text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="font-heading text-xl font-bold">
          Work<span className="text-accent">Nest</span>
        </Link>
        <p className="text-xs text-slate-400 mt-0.5">Admin Dashboard</p>
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
