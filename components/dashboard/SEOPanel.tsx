"use client";

import { runSEOChecklist } from "@/lib/utils/seo";
import { SITE_URL } from "@/lib/site";
import { CheckCircle2, XCircle } from "lucide-react";

interface SEOPanelProps {
  data: {
    title: string;
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    slug: string;
    content: string;
  };
  /** Public path of the article, e.g. /tonneau-covers/best-for-f-150 (null until a category is picked) */
  urlPath: string | null;
  onChange: (field: string, value: string) => void;
}

/** What Google will show: {year} is replaced with the current year at render time. */
function withYear(title: string) {
  return title.replace(/\{year\}/g, String(new Date().getFullYear()));
}

export default function SEOPanel({ data, urlPath, onChange }: SEOPanelProps) {
  const shownTitle = withYear(data.metaTitle);
  const checks = runSEOChecklist({ ...data, metaTitle: shownTitle });
  const score = checks.filter((c) => c.pass).length;

  return (
    <div className="space-y-5">
      {/* Score */}
      <div className="flex items-center gap-3">
        <div
          className={`text-2xl font-bold ${
            score >= 7 ? "text-green-500" : score >= 4 ? "text-yellow-500" : "text-red-500"
          }`}
        >
          {score}/{checks.length}
        </div>
        <div>
          <p className="text-sm font-semibold text-primary dark:text-white">SEO Score</p>
          <p className="text-xs text-slate-400">
            {score >= 7 ? "Good" : score >= 4 ? "Needs work" : "Poor"}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        {checks.map((c) => (
          <div key={c.id} className="flex items-center gap-2 text-xs">
            {c.pass ? (
              <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
            ) : (
              <XCircle size={14} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
            )}
            <span className={c.pass ? "text-slate-600 dark:text-slate-300" : "text-slate-400"}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      <hr className="border-slate-200 dark:border-slate-700" />

      {/* Primary keyword */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Primary keyword <span className="font-normal text-slate-400">(required to publish)</span>
        </label>
        <input
          type="text"
          value={data.focusKeyword}
          onChange={(e) => onChange("focusKeyword", e.target.value)}
          placeholder="e.g. best tonneau cover for f-150"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* SEO title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          SEO title{" "}
          <span className={`text-xs ${shownTitle.length > 60 ? "text-red-500" : "text-slate-400"}`}>
            ({shownTitle.length}/60)
          </span>
        </label>
        <input
          type="text"
          value={data.metaTitle}
          onChange={(e) => onChange("metaTitle", e.target.value)}
          placeholder="e.g. Best Tonneau Covers for F-150 ({year})"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <p className="text-xs text-slate-400 mt-1">
          Write <code>{"{year}"}</code> to always show the current year. Leave empty to use the post title.
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description <span className="font-normal text-slate-400">(required to publish)</span>{" "}
          <span className={`text-xs ${data.metaDescription.length > 160 ? "text-red-500" : "text-slate-400"}`}>
            ({data.metaDescription.length}/160)
          </span>
        </label>
        <textarea
          rows={3}
          value={data.metaDescription}
          onChange={(e) => onChange("metaDescription", e.target.value)}
          placeholder="Summarize post with keyword (max 160 chars)"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>

      {/* SERP Preview */}
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
          Google SERP Preview
        </p>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
          <p className="text-xs text-slate-400 truncate">
            {SITE_URL.replace(/^https?:\/\//, "")}{urlPath ?? "/[category]/…"}
          </p>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 leading-snug line-clamp-1 mt-0.5">
            {shownTitle || data.title || "Post title"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
            {data.metaDescription || "Post description will appear here..."}
          </p>
        </div>
      </div>
    </div>
  );
}
