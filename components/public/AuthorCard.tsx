"use client";

import { useState } from "react";
import { AtSign, Globe, User, ChevronDown, ChevronUp } from "lucide-react";

interface Author {
  name: string;
  bio?: string;
  photo?: string;
  twitter?: string;
  website?: string;
}

export default function AuthorCard({ author }: { author: Author }) {
  const [expanded, setExpanded] = useState(false);
  const hasBio = !!author.bio;
  const hasLinks = !!(author.twitter || author.website);

  return (
    <div className="mt-12 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">

      {/* ── Mobile layout (< md) — 3 stacked rows ── */}
      <div className="md:hidden">

        {/* Row 1: Image + name centered */}
        <div className="flex flex-col items-center gap-3 pt-6 pb-4 px-5 bg-slate-50 dark:bg-slate-800/50">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 ring-2 ring-accent/20">
            {author.photo ? (
              <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent/20">
                <User size={32} className="text-accent" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-0.5">Written by</p>
            <h3 className="font-heading font-bold text-primary dark:text-white text-lg">{author.name}</h3>
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
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4">
            {author.twitter && (
              <a
                href={`https://twitter.com/${author.twitter.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-accent transition-colors"
              >
                <AtSign size={13} /> {author.twitter.replace("@", "")}
              </a>
            )}
            {author.website && (
              <a
                href={author.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-accent transition-colors"
              >
                <Globe size={13} /> Website
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Desktop layout (≥ md) — original side by side ── */}
      <div className="hidden md:flex gap-5 items-start p-6">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
          {author.photo ? (
            <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent/20">
              <User size={28} className="text-accent" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Written by</p>
          <h3 className="font-heading font-bold text-primary dark:text-white text-lg leading-tight">{author.name}</h3>
          {hasBio && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{author.bio}</p>
          )}
          {hasLinks && (
            <div className="flex items-center gap-3 mt-3">
              {author.twitter && (
                <a
                  href={`https://twitter.com/${author.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-accent transition-colors"
                >
                  <AtSign size={13} /> {author.twitter.replace("@", "")}
                </a>
              )}
              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-accent transition-colors"
                >
                  <Globe size={13} /> Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
