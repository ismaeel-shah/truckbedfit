"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PostEditor from "./PostEditor";
import SEOPanel from "./SEOPanel";
import MediaUploader from "./MediaUploader";
import { slugify } from "@/lib/utils/slugify";
import { ARTICLE_TYPES, ARTICLE_TYPE_LABELS, ArticleType, isPillarType, PILLAR_CATEGORY_SLUG } from "@/lib/articleTypes";
import { articlePath } from "@/lib/urls";
import { TRUCKS } from "@/data/trucks";
import { Plus, Trash2, Check, Loader2 } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Author {
  _id: string;
  name: string;
  photo?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface PostData {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  category: string;
  tags: string;
  status: "draft" | "published" | "scheduled";
  scheduledAt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogImage: string;
  faqs: FAQ[];
  author: string;
  articleId: string;
  type: ArticleType;
  trucks: string[];
  updatedOn: string;
}

/** UTC ISO string -> "YYYY-MM-DDTHH:mm" in the browser's timezone */
function isoToLocalInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

/** datetime-local value (browser time) -> UTC ISO string, or "" */
function localInputToIso(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** Today in the browser's timezone, as YYYY-MM-DD */
function todayLocal() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

const fieldClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent";

export default function PostForm({ initial }: { initial?: Partial<PostData> }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors]       = useState<Author[]>([]);
  const [saving, setSaving] = useState(false);
  const [altStatus, setAltStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [activeTab, setActiveTab] = useState<"write" | "seo" | "faqs">("write");

  const normaliseInitial = (init?: Partial<PostData>) => {
    if (!init) return {};
    const tags   = Array.isArray(init.tags) ? (init.tags as string[]).join(", ") : (init.tags ?? "");
    const author = typeof init.author === "object" && init.author !== null
      ? (init.author as { _id: string })._id
      : (init.author ?? "");
    return { ...init, tags, author };
  };

  const [form, setForm] = useState<PostData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    featuredImageAlt: "",
    category: "",
    tags: "",
    status: "draft",
    scheduledAt: "",
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    ogImage: "",
    faqs: [],
    author: "",
    articleId: "",
    type: "guide",
    trucks: [],
    updatedOn: "",
    ...normaliseInitial(initial),
  });

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    fetch("/api/authors").then((r) => r.json()).then(setAuthors);
  }, []);

  // Browser-dependent defaults are applied after mount so server and client render the same markup:
  // scheduledAt is stored as UTC ISO (datetime-local needs browser time) and new posts default
  // their "last updated" date to today.
  useEffect(() => {
    const iso = initial?.scheduledAt;
    setForm((prev) => ({
      ...prev,
      ...(iso && { scheduledAt: isoToLocalInput(iso) }),
      ...(!prev.updatedOn && !initial?._id && { updatedOn: todayLocal() }),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const category = categories.find((c) => c._id === form.category);
  const pillar = isPillarType(form.type);
  const urlPath = category
    ? articlePath({ slug: form.slug || "your-slug", type: form.type, category })
    : null;

  // The main-article type depends on the category: "pillar" for Tonneau Covers, "category-hub" elsewhere.
  const setCategory = (id: string) => {
    const next = categories.find((c) => c._id === id);
    setForm((prev) => {
      let type = prev.type;
      if (isPillarType(type) && next) type = next.slug === PILLAR_CATEGORY_SLUG ? "pillar" : "category-hub";
      return { ...prev, category: id, type };
    });
  };

  const setType = (value: string) => {
    let type = value as ArticleType;
    if (isPillarType(type) && category) type = category.slug === PILLAR_CATEGORY_SLUG ? "pillar" : "category-hub";
    set("type", type);
  };

  const toggleTruck = (slug: string) =>
    setForm((prev) => ({
      ...prev,
      trucks: prev.trucks.includes(slug) ? prev.trucks.filter((t) => t !== slug) : [...prev.trucks, slug],
    }));

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug || slugify(title),
      metaTitle: prev.metaTitle || title,
    }));
  };

  const handleSave = async (status?: PostData["status"]) => {
    if (!form.title) { toast.error("Title is required"); return; }
    if (!form.category) { toast.error("Category is required"); return; }

    const nextStatus = status ?? form.status;
    const scheduledAt = localInputToIso(form.scheduledAt);
    if (nextStatus === "scheduled" && !scheduledAt) {
      toast.error("Pick a schedule date");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      status: nextStatus,
      scheduledAt,
      updatedOn: form.updatedOn || null,
      tags: (form.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean),
    };

    const url = initial?._id ? `/api/posts/${initial._id}` : "/api/posts";
    const method = initial?._id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      toast.success(nextStatus === "published" ? "Post published!" : "Post saved");
      router.push("/dashboard/posts");
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Save failed");
    }
  };

  /* Featured image alt text — auto-save for existing posts */
  const handleAltSave = async () => {
    if (!initial?._id) return; // new post: saves with main form
    if (altStatus === "saving") return;
    setAltStatus("saving");
    try {
      const res = await fetch(`/api/posts/${initial._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredImageAlt: form.featuredImageAlt }),
      });
      if (res.ok) {
        setAltStatus("saved");
        setTimeout(() => setAltStatus("idle"), 2500);
      } else {
        setAltStatus("idle");
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Alt text save failed");
      }
    } catch {
      setAltStatus("idle");
      toast.error("Alt text save failed");
    }
  };

  /* FAQ helpers */
  const addFaq = () =>
    set("faqs", [...form.faqs, { question: "", answer: "" }]);

  const updateFaq = (i: number, field: "question" | "answer", value: string) => {
    const updated = [...form.faqs];
    updated[i] = { ...updated[i], [field]: value };
    set("faqs", updated);
  };

  const removeFaq = (i: number) =>
    set("faqs", form.faqs.filter((_, idx) => idx !== i));

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Left — main */}
      <div className="space-y-5">
        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="Post title (H1)"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-2xl font-heading font-bold px-0 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-accent text-primary dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />
        </div>

        {/* URL */}
        {pillar ? (
          <p className="text-sm text-slate-500">
            Main article of its category — it appears at{" "}
            <span className="font-mono text-slate-700 dark:text-slate-200">{urlPath ?? "/[category]"}</span>, above the category&apos;s posts.
          </p>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 whitespace-nowrap">/{category?.slug ?? "category"}/</span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              className="flex-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-accent text-slate-600 dark:text-slate-300"
            />
          </div>
        )}

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Excerpt <span className="font-normal text-slate-400">(summary shown on cards)</span>
          </label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="One or two sentences shown in article cards…"
            className={`${fieldClass} resize-none`}
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {(["write", "seo", "faqs"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-accent text-accent"
                  : "text-slate-500 hover:text-primary dark:hover:text-white"
              }`}
            >
              {tab === "faqs" ? `FAQs${form.faqs.length ? ` (${form.faqs.length})` : ""}` : tab === "seo" ? "SEO" : "Write"}
            </button>
          ))}
        </div>

        {activeTab === "write" && (
          <PostEditor content={form.content} onChange={(html) => set("content", html)} />
        )}

        {activeTab === "seo" && (
          <SEOPanel
            data={{
              title: form.title,
              metaTitle: form.metaTitle,
              metaDescription: form.metaDescription,
              focusKeyword: form.focusKeyword,
              slug: form.slug,
              content: form.content,
            }}
            urlPath={urlPath}
            onChange={(field, value) => set(field, value)}
          />
        )}

        {activeTab === "faqs" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              FAQs appear at the end of the article and as FAQ rich results in Google.
            </p>
            {form.faqs.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">
                No FAQs yet. Click &quot;Add FAQ&quot; to add your first question.
              </div>
            )}

            {form.faqs.map((faq, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary dark:text-white">
                    FAQ {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    aria-label={`Remove FAQ ${i + 1}`}
                    className="text-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFaq(i, "question", e.target.value)}
                    placeholder="e.g. Will this tonneau cover fit a 5.5 ft bed?"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Answer</label>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                    placeholder="Write a detailed answer…"
                    className={`${fieldClass} resize-none`}
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={addFaq} className="btn-secondary flex items-center gap-2 text-sm">
              <Plus size={16} /> Add FAQ
            </button>
          </div>
        )}
      </div>

      {/* Right — sidebar */}
      <div className="space-y-5">
        {/* Publish box */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-primary dark:text-white">Publish</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={fieldClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {form.status === "scheduled" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Schedule Date</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => set("scheduledAt", e.target.value)}
                className={fieldClass}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last updated</label>
            <input
              type="date"
              value={form.updatedOn}
              onChange={(e) => set("updatedOn", e.target.value)}
              className={fieldClass}
            />
            <p className="text-xs text-slate-400 mt-1">
              Shown on the article. Change it only for real content updates, not typo fixes.
            </p>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => handleSave()} disabled={saving} className="btn-secondary flex-1 text-sm">
              Save
            </button>
            <button type="button" onClick={() => handleSave("published")} disabled={saving} className="btn-primary flex-1 text-sm">
              {saving ? "Saving…" : "Publish"}
            </button>
          </div>
        </div>

        {/* Category + type */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-primary dark:text-white">Article</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setCategory(e.target.value)} className={fieldClass}>
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setType(e.target.value)} className={fieldClass}>
              {ARTICLE_TYPES.map((t) => (
                <option key={t} value={t}>{ARTICLE_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Article ID <span className="font-normal text-slate-400">(planning sheet, optional)</span>
            </label>
            <input
              type="text"
              value={form.articleId}
              onChange={(e) => set("articleId", e.target.value)}
              placeholder="e.g. A03"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="hard folding, budget"
              className={fieldClass}
            />
          </div>
        </div>

        {/* Trucks */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-primary dark:text-white">Fits these trucks</h3>
            {form.trucks.length > 0 && (
              <button type="button" onClick={() => set("trucks", [])} className="text-xs text-slate-400 hover:text-accent">
                Clear ({form.trucks.length})
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">The article is listed on each ticked truck&apos;s page.</p>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {TRUCKS.map((truck) => (
              <label key={truck.slug} className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.trucks.includes(truck.slug)}
                  onChange={() => toggleTruck(truck.slug)}
                  className="accent-[#EA580C]"
                />
                {truck.name}
              </label>
            ))}
          </div>
        </div>

        {/* Author */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-primary dark:text-white">Author</h3>
          <select value={form.author} onChange={(e) => set("author", e.target.value)} className={fieldClass}>
            <option value="">Select author…</option>
            {authors.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Featured image */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-primary dark:text-white">Featured Image</h3>
          <MediaUploader value={form.featuredImage} onChange={(url) => set("featuredImage", url)} label="" />
          {form.featuredImage && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-500">Alt Text</label>
                {initial?._id && (
                  <span className={`flex items-center gap-1 text-xs transition-all duration-300 ${
                    altStatus === "saving" ? "text-slate-400" :
                    altStatus === "saved"  ? "text-green-500" : "text-transparent"
                  }`}>
                    {altStatus === "saving" && <Loader2 size={11} className="animate-spin" />}
                    {altStatus === "saved"  && <Check size={11} />}
                    {altStatus === "saving" ? "Saving…" : altStatus === "saved" ? "Saved" : "·"}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.featuredImageAlt ?? ""}
                  onChange={(e) => { set("featuredImageAlt", e.target.value); setAltStatus("idle"); }}
                  onBlur={handleAltSave}
                  placeholder="Describe the image for accessibility…"
                  className={`flex-1 ${fieldClass}`}
                />
                {initial?._id && (
                  <button
                    type="button"
                    onClick={handleAltSave}
                    disabled={altStatus === "saving"}
                    title="Save alt text"
                    className="px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent hover:text-primary text-accent text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {altStatus === "saving" ? <Loader2 size={13} className="animate-spin" /> : "Save"}
                  </button>
                )}
              </div>
              {!initial?._id && (
                <p className="text-xs text-slate-400 mt-1">Alt text will save when you publish or save.</p>
              )}
            </div>
          )}
        </div>

        {/* OG Image */}
        <div className="card p-5">
          <h3 className="font-semibold text-primary dark:text-white mb-3">OG Image</h3>
          <p className="text-xs text-slate-400 mb-3">Used for social sharing (1200×630px)</p>
          <MediaUploader value={form.ogImage} onChange={(url) => set("ogImage", url)} label="" />
        </div>
      </div>
    </div>
  );
}
