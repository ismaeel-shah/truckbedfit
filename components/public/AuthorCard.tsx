"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, User, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { authorPath, authorProfiles } from "@/lib/urls";
import BrandIcon from "./BrandIcon";

interface Author {
  name: string;
  slug?: string;
  bio?: string;
  photo?: string;
  twitter?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

export default function AuthorCard({ author }: { author: Author }) {
  const [expanded, setExpanded] = useState(false);
  const hasBio = !!author.bio;
  const hasLinks = !!author.slug || authorProfiles(author).length > 0;

  return (
    <div className="mt-12 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">

      {/* ── Mobile layout (< md) — 3 stacked rows ── */}
      <div className="md:hidden">

        {/* Row 1: Image + name centered */}
        <div className="flex flex-col items-center gap-3 pt-6 pb-4 px-5 bg-slate-50 dark:bg-slate-800/50">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 ring-2 ring-accent/20">
            {author.photo ? (
              <img src={author.photo} alt={author.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent/20">
                <User size={32} className="text-accent" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-0.5">Written by</p>
            <h3 className="font-heading font-bold text-primary dark:text-white text-lg"><AuthorName author={author} /></h3>
          </div>
        </div>

        {/* Row 2: Bio with see more toggle */}
        {hasBio && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700">
            <p className={`text-sm text-slate-500 dark:text-slate-400 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
              {author.bio}
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              {expanded ? (
                <><ChevronUp size={13} /> See less</>
              ) : (
                <><ChevronDown size={13} /> See more</>
              )}
            </button>
          </div>
        )}

        {/* Row 3: Links */}
        {hasLinks && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-4">
            <AllArticlesLink author={author} />
            <ProfileIcons author={author} />
          </div>
        )}
      </div>

      {/* ── Desktop layout (≥ md) — original side by side ── */}
      <div className="hidden md:flex gap-5 items-start p-6">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
          {author.photo ? (
            <img src={author.photo} alt={author.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent/20">
              <User size={28} className="text-accent" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Written by</p>
          <h3 className="font-heading font-bold text-primary dark:text-white text-lg leading-tight"><AuthorName author={author} /></h3>
          {hasBio && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{author.bio}</p>
          )}
          {hasLinks && (
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <AllArticlesLink author={author} />
              <ProfileIcons author={author} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

/** The author name, linked to their author page when it has a slug. */
function AuthorName({ author }: { author: Author }) {
  if (!author.slug) return <>{author.name}</>;
  return (
    <Link href={authorPath(author.slug)} rel="author" className="hover:text-accent transition-colors">
      {author.name}
    </Link>
  );
}

/** The author's profiles as small icon links (website, X, Instagram, Facebook, LinkedIn). */
function ProfileIcons({ author }: { author: Author }) {
  const profiles = authorProfiles(author);
  if (!profiles.length) return null;
  return (
    <span className="flex items-center gap-3">
      {profiles.map((profile) => (
        <a
          key={profile.network}
          href={profile.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${author.name} on ${profile.label}`}
          title={profile.label}
          className="text-slate-400 transition-colors hover:text-accent"
        >
          {profile.network === "website" ? <Globe size={15} aria-hidden="true" /> : <BrandIcon brand={profile.network} size={14} />}
        </a>
      ))}
    </span>
  );
}

function AllArticlesLink({ author }: { author: Author }) {
  if (!author.slug) return null;
  return (
    <Link
      href={authorPath(author.slug)}
      className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-primary transition-colors"
    >
      All articles by {author.name} <ArrowRight size={13} aria-hidden="true" />
    </Link>
  );
}
