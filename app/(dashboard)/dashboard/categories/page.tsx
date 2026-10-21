"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  postCount: number;
}

const emptyForm = () => ({
  name: "", icon: "📁", description: "", metaTitle: "", metaDescription: "",
});

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm]             = useState(emptyForm());
  const [editing, setEditing]       = useState<Category | null>(null);
  const [loading, setLoading]       = useState(false);

  const load = () =>
    fetch("/api/categories").then((r) => r.json()).then(setCategories);

  useEffect(() => { load(); }, []);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editing ? "PATCH" : "POST";
    const body   = editing ? { id: editing._id, ...form } : form;
    const res = await fetch("/api/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      toast.success(editing ? "Category updated" : "Category created");
      setForm(emptyForm());
      setEditing(null);
      load();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success("Deleted"); load(); }
    else toast.error("Delete failed");
  };

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name:            cat.name,
      icon:            cat.icon,
      description:     cat.description,
      metaTitle:       cat.metaTitle       ?? "",
      metaDescription: cat.metaDescription ?? "",
    });
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-8">
        Categories
      </h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">

        {/* ── List ──────────────────────────────────── */}
        <div className="card p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500">
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Posts</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <p className="font-medium text-primary dark:text-white">{cat.name}</p>
                        <p className="text-xs text-slate-400">{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-slate-500">{cat.postCount}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-accent"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Form ──────────────────────────────────── */}
        <div className="card p-6">
          <h2 className="font-semibold text-primary dark:text-white mb-4 flex items-center gap-2">
            <Plus size={18} className="text-accent" />
            {editing ? "Edit Category" : "Add Category"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Tonneau Covers"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Icon (emoji)
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                className="w-20 px-3 py-2 text-lg text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Short category description…"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                SEO
              </p>

              {/* Meta Title */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Meta Title
                  </label>
                  <span className={`text-xs ${form.metaTitle.length > 60 ? "text-red-400" : "text-slate-400"}`}>
                    {form.metaTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => set("metaTitle", e.target.value)}
                  placeholder="Leave blank to auto-generate from name…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Meta Description
                  </label>
                  <span className={`text-xs ${form.metaDescription.length > 160 ? "text-red-400" : "text-slate-400"}`}>
                    {form.metaDescription.length}/160
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) => set("metaDescription", e.target.value)}
                  placeholder="Leave blank to auto-generate from description…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {editing && (
                <button
                  type="button"
                  onClick={() => { setEditing(null); setForm(emptyForm()); }}
                  className="btn-secondary flex-1 text-sm"
                >
                  Cancel
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-primary flex-1 text-sm">
                {loading ? "Saving…" : editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
