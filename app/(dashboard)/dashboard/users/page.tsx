"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Plus, Trash2, ShieldCheck, User as UserIcon, X, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
  createdAt: string;
}

const ROLE_LABELS = { admin: "Admin", editor: "Editor" };
const ROLE_COLORS = {
  admin:  "bg-accent/15 text-accent",
  editor: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

export default function UsersPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id;

  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });

  const load = () => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/users", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("User created successfully");
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "editor" });
      load();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to create user");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to delete user");
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ role }),
    });
    if (res.ok) {
      toast.success("Role updated");
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role: role as User["role"] } : u));
    } else {
      toast.error("Failed to update role");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary dark:text-white">Users</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Add User Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-primary dark:text-white">New User</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"} required
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="editor">Editor — can create & edit posts</option>
                  <option value="admin">Admin — full access</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                  {saving ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-700">
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map((user) => {
                const isMe = user._id === currentUserId;
                return (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                          <UserIcon size={14} className="text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-primary dark:text-white leading-tight">
                            {user.name}
                            {isMe && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {isMe ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role]}`}>
                          <ShieldCheck size={11} /> {ROLE_LABELS[user.role]}
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent ${ROLE_COLORS[user.role]}`}
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!isMe && (
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
