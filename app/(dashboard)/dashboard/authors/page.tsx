"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil, X, Check, User, AtSign, Globe } from "lucide-react";

interface Author {
  _id: string;
  name: string;
  bio?: string;
  photo?: string;
  twitter?: string;
  website?: string;
}

const empty = (): Omit<Author, "_id"> => ({ name: "", bio: "", photo: "", twitter: "", website: "" });

export default function AuthorsPage() {
  const [authors, setAuthors]   = useState<Author[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState(empty());
  const [saving, setSaving]     = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/authors")
      .then((r) => r.json())
      .then((data) => { setAuthors(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty()); setEditId(null); setShowForm(true); };

  const openEdit = (a: Author) => {
    setForm({ name: a.name, bio: a.bio ?? "", photo: a.photo ?? "", twitter: a.twitter ?? "", website: a.website ?? "" });
    setEditId(a._id);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(empty()); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const url    = editId ? `/api/authors/${editId}` : "/api/authors";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editId ? "Author updated" : "Author created");
      closeForm();
      load();
    } else {
      let msg = "Save failed";
      try { const err = await res.json(); msg = err.error ?? msg; } catch {}
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/authors/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Author deleted"); load(); }
    else toast.error("Delete failed");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary dark:text-white">Authors</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Author
        </button>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-primary dark:text-white text-lg">
                {editId ? "Edit Author" : "New Author"}
              </h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Author name"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Photo URL</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                    {form.photo
                      ? <img src={form.photo} alt="preview" className="w-full h-full object-cover" />
                      : <User size={18} className="text-slate-400" />
                    }
                  </div>
                  <input
                    type="url"
                    value={form.photo}
                    onChange={(e) => setForm({ ...form, photo: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Short bio shown below posts…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Twitter / X</label>
                  <input
                    type="text"
                    value={form.twitter}
                    onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                    placeholder="@username"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://yoursite.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeForm} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                <Check size={15} /> {saving ? "Saving…" : "Save Author"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authors grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading…</div>
      ) : authors.length === 0 ? (
        <div className="text-center py-20">
          <User size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No authors yet. Create your first author.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {authors.map((a) => (
            <div key={a._id} className="card p-5 flex gap-4 items-start">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                {a.photo
                  ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" />
                  : <User size={24} className="text-slate-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-primary dark:text-white text-sm leading-tight">{a.name}</h3>
                {a.bio && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.bio}</p>}
                <div className="flex items-center gap-3 mt-2">
                  {a.twitter && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <AtSign size={11} /> {a.twitter.replace("@", "")}
                    </span>
                  )}
                  {a.website && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Globe size={11} /> Website
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(a)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-accent hover:border-accent transition-colors"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a._id, a.name)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-400 transition-colors"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
