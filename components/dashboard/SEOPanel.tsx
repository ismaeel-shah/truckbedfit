"use client";

import { runSEOChecklist } from "@/lib/utils/seo";
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
  onChange: (field: string, value: string) => void;
}

export default function SEOPanel({ data, onChange }: SEOPanelProps) {
  const checks = runSEOChecklist(data);
  const score = checks.filter((c) => c.pass).length;

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://worknest.example.com";

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

      {/* Focus Keyword */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Focus Keyword
        </label>
        <input
          type="text"
          value={data.focusKeyword}
          onChange={(e) => onChange("focusKeyword", e.target.value)}
          placeholder="e.g. best ergonomic chair under 300"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Meta Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Meta Title{" "}
          <span className={`text-xs ${data.metaTitle.length > 60 ? "text-red-500" : "text-slate-400"}`}>
            ({data.metaTitle.length}/60)
          </span>
        </label>
        <input
          type="text"
          value={data.metaTitle}
          onChange={(e) => onChange("metaTitle", e.target.value)}
          placeholder="SEO title (max 60 chars)"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Meta Description{" "}
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
            {siteUrl}/blog/{data.slug}
          </p>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 leading-snug line-clamp-1 mt-0.5">
            {data.metaTitle || data.title || "Post title"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
            {data.metaDescription || "Post description will appear here..."}
          </p>
        </div>
      </div>
    </div>
  );
}
