"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

interface Redirect {
  _id: string;
  source: string;
  destination: string;
  type: 301 | 302;
  active: boolean;
}

type RedirectForm = Omit<Redirect, "_id">;

const empty: RedirectForm = { source: "", destination: "", type: 301, active: true };

export default function RedirectsManager({ initialRedirects }: { initialRedirects: Redirect[] }) {
  const [redirects, setRedirects] = useState<Redirect[]>(initialRedirects);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => { setForm({ ...empty }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.source || !form.destination) return toast.error("Source and destination are required");
    setSaving(true);
    try {
      if (editId) {
        const res = await fetch("/api/redirects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...form }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
        const updated = await res.json();
        setRedirects((prev) => prev.map((r) => r._id === editId ? updated : r));
        toast.success("Redirect updated");
      } else {
        const res = await fetch("/api/redirects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
        const created = await res.json();
        setRedirects((prev) => [created, ...prev]);
        toast.success("Redirect added");
      }
      resetForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (r: Redirect) => {
    setForm({ source: r.source, destination: r.destination, type: r.type, active: r.active });
    setEditId(r._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    const res = await fetch("/api/redirects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setRedirects((prev) => prev.filter((r) => r._id !== id));
      toast.success("Deleted");
    } else toast.error("Delete failed");
  };

  const handleToggle = async (r: Redirect) => {
    const res = await fetch("/api/redirects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r._id, active: !r.active }),
    });
    if (res.ok) {
      setRedirects((prev) => prev.map((x) => x._id === r._id ? { ...x, active: !x.active } : x));
    }
  };

  return (
    <div className="space-y-6">
      {/* Add button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add New Redirect
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="font-heading font-bold text-lg text-primary dark:text-white mb-5">
            {editId ? "Edit Redirect" : "Add New Redirect"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  From (Source URL)
                </label>
                <input
                  type="text"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="/old-blog-url"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-slate-400 mt-1">Relative path e.g. /old-page</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  To (Destination URL)
                </label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  placeholder="/new-blog-url or https://..."
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-slate-400 mt-1">Relative path or full URL</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Redirect Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: parseInt(e.target.value) as 301 | 302 })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value={301}>301 — Permanent (SEO recommended)</option>
                  <option value={302}>302 — Temporary</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className={`transition-colors ${form.active ? "text-accent" : "text-slate-400"}`}
                >
                  {form.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                <Check size={15} /> {saving ? "Saving…" : editId ? "Update" : "Add Redirect"}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary flex items-center gap-2">
                <X size={15} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {redirects.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No redirects yet. Add one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-5 py-3 font-medium">From</th>
                  <th className="px-5 py-3 font-medium">To</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {redirects.map((r) => (
                  <tr key={r._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!r.active ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3 font-mono text-xs text-primary dark:text-white max-w-[180px] truncate">
                      {r.source}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                      {r.destination}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        r.type === 301
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleToggle(r)} className={`transition-colors ${r.active ? "text-accent" : "text-slate-400"}`}>
                        {r.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(r)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-accent transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
