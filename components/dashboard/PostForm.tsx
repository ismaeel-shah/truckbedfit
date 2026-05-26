"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PostEditor from "./PostEditor";
import SEOPanel from "./SEOPanel";
import MediaUploader from "./MediaUploader";
import { slugify } from "@/lib/utils/slugify";
import { Plus, Trash2, GripVertical, Check, Loader2 } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  icon: string;
}

interface Author {
  _id: string;
  name: string;
  photo?: string;
}

interface AffiliateProduct {
  name: string;
  amazonUrl: string;
  imageUrl: string;
  price: string;
  badge: string;
  pros: string[];
  cons: string[];
  order: number;
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
  tags: string | string[];
  status: "draft" | "published" | "scheduled";
  scheduledAt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogImage: string;
  affiliateProducts: AffiliateProduct[];
  faqs: FAQ[];
  author: string;
}

const emptyProduct = (): AffiliateProduct => ({
  name: "",
  amazonUrl: "",
  imageUrl: "",
  price: "",
  badge: "",
  pros: [""],
  cons: [""],
  order: 0,
});

export default function PostForm({ initial }: { initial?: Partial<PostData> }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors]       = useState<Author[]>([]);
  const [saving, setSaving] = useState(false);
  const [altStatus, setAltStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [activeTab, setActiveTab] = useState<"write" | "seo" | "products" | "faqs">("write");

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
    affiliateProducts: [],
    faqs: [],
    author: "",
    ...normaliseInitial(initial),
  });

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    fetch("/api/authors").then((r) => r.json()).then(setAuthors);
  }, []);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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

    setSaving(true);
    const payload = {
      ...form,
      status: status ?? form.status,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
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
      toast.success(status === "published" ? "Post published!" : "Post saved");
      router.push("/dashboard/posts");
      router.refresh();
    } else {
      const err = await res.json();
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
        toast.error("Alt text save failed");
      }
    } catch {
      setAltStatus("idle");
      toast.error("Alt text save failed");
    }
  };

  /* Affiliate products helpers */
  const addProduct = () =>
    set("affiliateProducts", [...form.affiliateProducts, emptyProduct()]);

  const updateProduct = (i: number, field: string, value: unknown) => {
    const updated = [...form.affiliateProducts];
    updated[i] = { ...updated[i], [field]: value };
    set("affiliateProducts", updated);
  };

  const removeProduct = (i: number) =>
    set("affiliateProducts", form.affiliateProducts.filter((_, idx) => idx !== i));

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

  const updateProCon = (
    pi: number,
    type: "pros" | "cons",
    vi: number,
    value: string
  ) => {
    const updated = [...form.affiliateProducts];
    const arr = [...updated[pi][type]];
    arr[vi] = value;
    updated[pi] = { ...updated[pi], [type]: arr };
    set("affiliateProducts", updated);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Left — main */}
      <div className="space-y-5">
        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="Post title"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-2xl font-heading font-bold px-0 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-accent text-primary dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />
        </div>

        {/* Slug */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">/blog/</span>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => set("slug", slugify(e.target.value))}
            className="flex-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-accent text-slate-600 dark:text-slate-300"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Excerpt
          </label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="Short summary shown in blog cards…"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {(["write", "seo", "products", "faqs"] as const).map((tab) => (
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
              {tab === "products" ? "Affiliate Products" : tab === "faqs" ? `FAQs${form.faqs.length ? ` (${form.faqs.length})` : ""}` : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
            onChange={(field, value) => set(field, value)}
          />
        )}

        {activeTab === "faqs" && (
          <div className="space-y-4">
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
                    className="text-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFaq(i, "question", e.target.value)}
                    placeholder="e.g. What is the best ergonomic chair?"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Answer
                  </label>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                    placeholder="Write a detailed answer…"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addFaq}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Add FAQ
            </button>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-4">
            {form.affiliateProducts.map((product, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-slate-300 cursor-grab" />
                    <span className="text-sm font-semibold text-primary dark:text-white">
                      Product {i + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(i)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {["name", "amazonUrl", "imageUrl", "price", "badge"].map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">
                        {field === "amazonUrl" ? "Amazon URL" : field === "imageUrl" ? "Image URL" : field}
                      </label>
                      <input
                        type="text"
                        value={product[field as keyof typeof product] as string}
                        onChange={(e) => updateProduct(i, field, e.target.value)}
                        className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  ))}
                </div>

                {/* Pros */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Pros</label>
                  {product.pros.map((pro, vi) => (
                    <div key={vi} className="flex gap-2 mb-1">
                      <input
                        type="text"
                        value={pro}
                        onChange={(e) => updateProCon(i, "pros", vi, e.target.value)}
                        placeholder="Add a pro"
                        className="flex-1 px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateProduct(i, "pros", [...product.pros, ""])}
                    className="text-xs text-accent hover:underline"
                  >
                    + Add pro
                  </button>
                </div>

                {/* Cons */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Cons</label>
                  {product.cons.map((con, vi) => (
                    <div key={vi} className="flex gap-2 mb-1">
                      <input
                        type="text"
                        value={con}
                        onChange={(e) => updateProCon(i, "cons", vi, e.target.value)}
                        placeholder="Add a con"
                        className="flex-1 px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateProduct(i, "cons", [...product.cons, ""])}
                    className="text-xs text-accent hover:underline"
                  >
                    + Add con
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addProduct}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Add Product
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {form.status === "scheduled" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Schedule Date
              </label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => set("scheduledAt", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="btn-secondary flex-1 text-sm"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave("published")}
              disabled={saving}
              className="btn-primary flex-1 text-sm"
            >
              {saving ? "Saving…" : "Publish"}
            </button>
          </div>
        </div>

        {/* Category */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-primary dark:text-white">Category</h3>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="ergonomic, chair, review"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Author */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-primary dark:text-white">Author</h3>
          <select
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select author…</option>
            {authors.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Featured image */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-primary dark:text-white">Featured Image</h3>
          <MediaUploader
            value={form.featuredImage}
            onChange={(url) => set("featuredImage", url)}
            label=""
          />
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
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
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
                <p className="text-xs text-slate-400 mt-1">Alt text will save when you publish or save draft.</p>
              )}
            </div>
          )}
        </div>

        {/* OG Image */}
        <div className="card p-5">
          <h3 className="font-semibold text-primary dark:text-white mb-3">OG Image</h3>
          <p className="text-xs text-slate-400 mb-3">Used for social sharing (1200×630px)</p>
          <MediaUploader
            value={form.ogImage}
            onChange={(url) => set("ogImage", url)}
            label=""
          />
        </div>
      </div>
    </div>
  );
}
