"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ExternalLink } from "lucide-react";
import PostEditor from "./PostEditor";
import SEOPanel from "./SEOPanel";
import FaqEditor from "./FaqEditor";
import ShortAnswerField from "./ShortAnswerField";
import type { HubPage } from "@/lib/db/hubPages";

/** "YYYY-MM-DD" → "Oct 24, 2026" */
const displayDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Editor for a generated hub page's written parts: H1, intro (with shortcodes), SEO fields and FAQs. */
export default function HubPageForm({ initial, defaultTitle, live }: {
  initial: HubPage;
  /** The generated H1, used when the H1 field is left empty */
  defaultTitle: string;
  /** The page is public (it has at least one published article) */
  live: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [tab, setTab] = useState<"write" | "seo" | "faqs">("write");
  const [minorEdit, setMinorEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/hub-pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, markUpdated: !minorEdit }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Truck page saved");
      router.push("/dashboard/truck-pages");
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Save failed");
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-5">
        <div>
          <input
            type="text"
            placeholder={defaultTitle}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full text-2xl font-heading font-bold px-0 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-accent text-primary dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />
          <p className="mt-1 text-xs text-slate-400">H1 of the page. Leave empty to keep &quot;{defaultTitle}&quot;.</p>
        </div>
        <p className="text-sm text-slate-500">
          URL: <span className="font-mono text-slate-700 dark:text-slate-200">{form.path}</span>
        </p>

        <ShortAnswerField value={form.shortAnswer} onChange={(value) => set("shortAnswer", value)} />

        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {(["write", "seo", "faqs"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === t ? "border-b-2 border-accent text-accent" : "text-slate-500 hover:text-primary dark:hover:text-white"
              }`}
            >
              {t === "write" ? "Write" : t === "seo" ? "SEO" : `FAQs${form.faqs.length ? ` (${form.faqs.length})` : ""}`}
            </button>
          ))}
        </div>

        {tab === "write" && (
          <div className="space-y-3">
            <p className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              This text appears at the top of the page, above the parts the site builds itself (bed sizes, fitment notes and the
              article lists). Shortcodes like <code className="font-mono">[bedchart]</code> and <code className="font-mono">[trustbox]</code> work here.
            </p>
            <PostEditor content={form.content} onChange={(html) => set("content", html)} />
          </div>
        )}

        {tab === "seo" && (
          <SEOPanel
            data={{
              title: form.title || defaultTitle,
              metaTitle: form.metaTitle,
              metaDescription: form.metaDescription,
              focusKeyword: form.focusKeyword,
              slug: form.path.split("/").pop() ?? "",
              content: form.content,
              shortAnswer: form.shortAnswer,
            }}
            urlPath={form.path}
            onChange={(field, value) => set(field, value)}
          />
        )}

        {tab === "faqs" && (
          <FaqEditor
            faqs={form.faqs}
            onChange={(faqs) => set("faqs", faqs)}
            intro="FAQs appear at the end of the page and as FAQ rich results in Google."
          />
        )}
      </div>

      <div className="space-y-5">
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-primary dark:text-white">Save</h3>
          <p className={`rounded-lg px-3 py-2 text-xs ${live ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300" : "bg-slate-50 text-slate-500 dark:bg-slate-800"}`}>
            {live
              ? "Live — this page is public."
              : "Not live yet — it goes live once an article tagged with this truck is published. You can write it now."}
          </p>
          {initial.updatedOn && (
            <>
              <p className="text-xs text-slate-500">
                Last updated: <span className="font-medium text-slate-700 dark:text-slate-200">{displayDay(initial.updatedOn)}</span>
              </p>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={minorEdit} onChange={(e) => setMinorEdit(e.target.checked)} className="mt-1 accent-[#EA580C]" />
                <span>
                  Minor edit
                  <span className="block text-xs text-slate-400">Typo or small fix — keep the &quot;Updated&quot; date.</span>
                </span>
              </label>
            </>
          )}
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center text-sm disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
          {live && (
            <Link href={form.path} target="_blank" className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-accent">
              View page <ExternalLink size={12} />
            </Link>
          )}
        </div>

        <div className="card p-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-primary dark:text-white">Tip</p>
          <p className="mt-1">
            Keep this page a summary that links out: the truck&apos;s full cover picks belong on its tonneau-cover page,
            not here (one keyword, one page).
          </p>
        </div>
      </div>
    </div>
  );
}
