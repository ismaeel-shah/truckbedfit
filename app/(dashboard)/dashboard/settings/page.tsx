"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Save, ChevronDown, ChevronUp } from "lucide-react";

/* ── Pages whose SEO can be managed ── */
const PAGES = [
  {
    key: "page_home",
    label: "Home Page",
    path: "/",
    fields: ["metaTitle", "metaDescription"],
  },
  {
    key: "page_blog",
    label: "Blog Listing Page",
    path: "/blog",
    fields: ["metaTitle", "metaDescription"],
  },
  {
    key: "page_about",
    label: "About Page",
    path: "/about",
    fields: ["metaTitle", "metaDescription"],
  },
  {
    key: "page_contact",
    label: "Contact Page",
    path: "/contact",
    fields: ["metaTitle", "metaDescription"],
  },
] as const;

const FIELD_LABELS: Record<string, string> = {
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
};

const FIELD_HINTS: Record<string, string> = {
  metaTitle: "Recommended: 50–60 characters",
  metaDescription: "Recommended: 150–160 characters",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [password, setPassword]   = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving]        = useState(false);
  const [openPage, setOpenPage]    = useState<string | null>(null);
  const [pageData, setPageData]    = useState<Record<string, Record<string, string>>>({});
  const [pageSaving, setPageSaving] = useState<string | null>(null);

  /* Load current page settings */
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setPageData(data))
      .catch(() => {});
  }, []);

  const setField = (pageKey: string, field: string, value: string) => {
    setPageData((prev) => ({
      ...prev,
      [pageKey]: { ...(prev[pageKey] ?? {}), [field]: value },
    }));
  };

  const savePage = async (pageKey: string) => {
    setPageSaving(pageKey);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: pageKey, value: pageData[pageKey] ?? {} }),
    });
    setPageSaving(null);
    if (res.ok) toast.success("Page settings saved");
    else toast.error("Save failed");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.next !== password.confirm) { toast.error("Passwords don't match"); return; }
    if (password.next.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSaving(true);
    const res = await fetch("/api/auth/change-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ currentPassword: password.current, newPassword: password.next }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Password updated successfully");
      setPassword({ current: "", next: "", confirm: "" });
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to update password");
    }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-8">Settings</h1>

      <div className="max-w-2xl space-y-6">

        {/* ── Pages SEO ─────────────────────────────── */}
        <div className="card p-6">
          <h2 className="font-semibold text-primary dark:text-white mb-1">Pages SEO</h2>
          <p className="text-xs text-slate-400 mb-5">
            Edit meta title &amp; description for each page. Changes reflect on the live site after save.
          </p>

          <div className="space-y-2">
            {PAGES.map((page) => {
              const isOpen = openPage === page.key;
              const data   = pageData[page.key] ?? {};
              return (
                <div key={page.key} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {/* Accordion header */}
                  <button
                    type="button"
                    onClick={() => setOpenPage(isOpen ? null : page.key)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-primary dark:text-white">{page.label}</p>
                      <p className="text-xs text-slate-400">{page.path}</p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>

                  {/* Accordion body */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-700 space-y-3">
                      {page.fields.map((field) => (
                        <div key={field}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {FIELD_LABELS[field]}
                            </label>
                            <span className="text-xs text-slate-400">
                              {(data[field] ?? "").length} chars &mdash; {FIELD_HINTS[field]}
                            </span>
                          </div>
                          {field === "metaDescription" ? (
                            <textarea
                              rows={2}
                              value={data[field] ?? ""}
                              onChange={(e) => setField(page.key, field, e.target.value)}
                              placeholder={`Enter ${FIELD_LABELS[field]}…`}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={data[field] ?? ""}
                              onChange={(e) => setField(page.key, field, e.target.value)}
                              placeholder={`Enter ${FIELD_LABELS[field]}…`}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => savePage(page.key)}
                        disabled={pageSaving === page.key}
                        className="btn-primary text-sm flex items-center gap-2"
                      >
                        <Save size={14} />
                        {pageSaving === page.key ? "Saving…" : "Save"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Account info ──────────────────────────── */}
        <div className="card p-6">
          <h2 className="font-semibold text-primary dark:text-white mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Name</label>
              <p className="text-sm text-primary dark:text-white">{session?.user?.name ?? "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
              <p className="text-sm text-primary dark:text-white">{session?.user?.email ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* ── Change password ───────────────────────── */}
        <div className="card p-6">
          <h2 className="font-semibold text-primary dark:text-white mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {[
              { label: "Current Password", key: "current" },
              { label: "New Password",     key: "next"    },
              { label: "Confirm Password", key: "confirm" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                <input
                  type="password"
                  required
                  value={password[key as keyof typeof password]}
                  onChange={(e) => setPassword({ ...password, [key]: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
              <Save size={15} /> {saving ? "Saving…" : "Update Password"}
            </button>
          </form>
        </div>

        {/* ── Site info ─────────────────────────────── */}
        <div className="card p-6">
          <h2 className="font-semibold text-primary dark:text-white mb-4">Site Info</h2>
          <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <p><span className="font-medium text-primary dark:text-white">Site URL:</span> {process.env.NEXT_PUBLIC_SITE_URL ?? "Not set"}</p>
            <p><span className="font-medium text-primary dark:text-white">Site Name:</span> {process.env.NEXT_PUBLIC_SITE_NAME ?? "WorkNest"}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
