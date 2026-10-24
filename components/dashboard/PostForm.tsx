"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PostEditor from "./PostEditor";
import SEOPanel from "./SEOPanel";
import MediaUploader from "./MediaUploader";
import ProductCard, { emptyProduct, FormProduct } from "./ProductCard";
import FaqEditor from "./FaqEditor";
import ShortAnswerField from "./ShortAnswerField";
import { slugify } from "@/lib/utils/slugify";
import { ARTICLE_TYPES, ARTICLE_TYPE_LABELS, ArticleType, isPillarType, PILLAR_CATEGORY_SLUG } from "@/lib/articleTypes";
import { articlePath } from "@/lib/urls";
import { hasHub, TRUCKS } from "@/data/trucks";
import { extractAsin, MAX_PRODUCTS } from "@/lib/products";
import { productShortcode } from "@/lib/utils/shortcodes";
import { Plus, Check, Loader2, Package } from "lucide-react";

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
  products: FormProduct[];
  author: string;
  type: ArticleType;
  trucks: string[];
  /** Read-only: shown in the Publish box; both dates are set by the server */
  updatedOn: string;
  publishedAt: string;
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

/** "YYYY-MM-DD" → "Oct 23, 2026" (noon UTC, so no timezone can shift the day) */
const displayDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const fieldClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent";

export default function PostForm({ initial }: { initial?: Partial<PostData> }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors]       = useState<Author[]>([]);
  const [saving, setSaving] = useState(false);
  const [altStatus, setAltStatus] = useState<"idle" | "saving" | "saved">("idle");
  // Ticked for typo-level fixes so the article's "Updated" date doesn't move.
  const [minorEdit, setMinorEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "products" | "seo" | "faqs">("write");

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
    products: [],
    author: "",
    type: "guide",
    trucks: [],
    updatedOn: "",
    publishedAt: "",
    ...normaliseInitial(initial),
  });

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    fetch("/api/authors").then((r) => r.json()).then(setAuthors);
  }, []);

  // scheduledAt is stored as UTC ISO but datetime-local needs browser time; converted after
  // mount so server and client render the same markup.
  useEffect(() => {
    const iso = initial?.scheduledAt;
    if (iso) setForm((prev) => ({ ...prev, scheduledAt: isoToLocalInput(iso) }));
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

  // One save button whose action follows the status picked above it.
  const live = initial?.status === "published";
  const action =
    form.status === "draft" ? { label: "Save draft", busy: "Saving…", done: "Draft saved" }
    : form.status === "scheduled" ? { label: "Schedule", busy: "Scheduling…", done: "Post scheduled" }
    : live ? { label: "Update", busy: "Updating…", done: "Post updated" }
    : { label: "Publish", busy: "Publishing…", done: "Post published!" };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    if (!form.category) { toast.error("Category is required"); return; }

    const nextStatus = form.status;
    const scheduledAt = localInputToIso(form.scheduledAt);
    if (nextStatus === "scheduled" && !scheduledAt) {
      toast.error("Pick a schedule date");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      // Both dates are set by the server (undefined fields aren't sent).
      updatedOn: undefined,
      publishedAt: undefined,
      status: nextStatus,
      scheduledAt,
      markUpdated: !minorEdit,
      tags: (form.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean),
      products: form.products.map((p) => ({ ...p, bullets: p.bullets.split("\n").map((b) => b.trim()).filter(Boolean) })),
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
      toast.success(action.done);
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

  /* Product helpers */
  const addProduct = () => set("products", [...form.products, emptyProduct()]);

  const updateProduct = (i: number, field: keyof FormProduct, value: string) => {
    const updated = [...form.products];
    updated[i] = { ...updated[i], [field]: field === "asin" ? extractAsin(value) : value };
    set("products", updated);
  };

  const moveProduct = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= form.products.length) return;
    const updated = [...form.products];
    [updated[i], updated[j]] = [updated[j], updated[i]];
    set("products", updated);
  };

  const removeProduct = (i: number) =>
    set("products", form.products.filter((_, idx) => idx !== i));

  const copyShortcode = (code: string) =>
    navigator.clipboard.writeText(code).then(
      () => toast.success(`Copied ${code} — paste it in the article where the box should go`),
      () => toast.error("Copy failed — type it in the article instead")
    );

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

        {/* Short answer (stored as the post's excerpt) */}
        <ShortAnswerField value={form.excerpt} onChange={(value) => set("excerpt", value)} />

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {(["write", "products", "seo", "faqs"] as const).map((tab) => (
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
              {tab === "faqs" ? `FAQs${form.faqs.length ? ` (${form.faqs.length})` : ""}`
                : tab === "products" ? `Products${form.products.length ? ` (${form.products.length})` : ""}`
                : tab === "seo" ? "SEO" : "Write"}
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
              shortAnswer: form.excerpt,
            }}
            urlPath={urlPath}
            onChange={(field, value) => set(field, value)}
          />
        )}

        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Products appear as <strong>&quot;Our top picks&quot;</strong> cards at the top of the article, in this order.
              To show a product&apos;s full box inside the article, copy its code (e.g.{" "}
              <code className="font-mono text-primary dark:text-white">{productShortcode(1)}</code>) into the text.
              Images come from Amazon automatically; prices are never shown.
            </div>

            {form.products.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
                <Package size={32} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">No products yet</p>
                <p className="mt-1 text-xs text-slate-400">Add the products this article recommends.</p>
              </div>
            )}

            {form.products.map((product, i) => (
              <ProductCard
                key={i}
                product={product}
                index={i}
                total={form.products.length}
                onChange={(field, value) => updateProduct(i, field, value)}
                onMove={(by) => moveProduct(i, by)}
                onRemove={() => removeProduct(i)}
                onCopyCode={copyShortcode}
              />
            ))}

            {form.products.length < MAX_PRODUCTS && (
              <button
                type="button"
                onClick={addProduct}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent dark:border-slate-600"
              >
                <Plus size={16} /> Add product
              </button>
            )}
          </div>
        )}

        {activeTab === "faqs" && (
          <FaqEditor faqs={form.faqs} onChange={(faqs) => set("faqs", faqs)} />
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

          {/* Dates are automatic; an already-published post can opt out of the "Updated" bump. */}
          {live && form.status === "published" && (
            <div className="space-y-3">
              {form.publishedAt && (
                <div className="space-y-0.5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:bg-slate-800">
                  <p>
                    Published: <span className="font-medium text-slate-700 dark:text-slate-200">{displayDay(form.publishedAt.slice(0, 10))}</span>
                  </p>
                  {form.updatedOn > form.publishedAt.slice(0, 10) && (
                    <p>
                      Last updated: <span className="font-medium text-slate-700 dark:text-slate-200">{displayDay(form.updatedOn)}</span>
                    </p>
                  )}
                </div>
              )}
              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={minorEdit}
                  onChange={(e) => setMinorEdit(e.target.checked)}
                  className="mt-1 accent-[#EA580C]"
                />
                <span>
                  Minor edit
                  <span className="block text-xs text-slate-400">Typo or small fix — keep the article&apos;s &quot;Updated&quot; date.</span>
                </span>
              </label>
            </div>
          )}

          {live && form.status !== "published" && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              This post is live. Saving it as {form.status === "draft" ? "a draft" : "scheduled"} takes it off the site.
            </p>
          )}

          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center text-sm disabled:opacity-60">
            {saving ? action.busy : action.label}
          </button>
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
          <p className="text-xs text-slate-400">The article is listed on each ticked truck&apos;s page (if it has one) and its bed chart uses these trucks.</p>
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
                {!hasHub(truck) && <span className="text-xs text-slate-400">(no truck page)</span>}
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
