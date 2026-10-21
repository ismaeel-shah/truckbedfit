"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Upload, Copy, Check, ExternalLink, Trash2, RefreshCw, Search, ImageOff } from "lucide-react";
import toast from "react-hot-toast";

interface MediaItem {
  key: string;
  url: string;
  name: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

const PAGE_SIZE = 48;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Copies an absolute URL so it can be pasted anywhere (dev URLs are site-relative). */
function absoluteUrl(url: string) {
  return new URL(url, window.location.origin).href;
}

/** Clipboard API first, then the legacy execCommand path (some browsers/contexts block the API). */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}

export default function MediaPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const [items, setItems]           = useState<MediaItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [truncated, setTruncated]   = useState(false);
  const [progress, setProgress]     = useState<{ done: number; total: number } | null>(null);
  const [query, setQuery]           = useState("");
  const [visible, setVisible]       = useState(PAGE_SIZE);
  const [copiedKey, setCopiedKey]   = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/media", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load media");
      setItems(data.items);
      setTruncated(Boolean(data.truncated));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const handleFiles = async (files: FileList) => {
    const list = Array.from(files);
    if (!list.length) return;
    setProgress({ done: 0, total: list.length });

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? `Failed to upload ${file.name}`);
        setItems((prev) => [data as MediaItem, ...prev]);
        toast.success(`${file.name} uploaded`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
      }
      setProgress({ done: i + 1, total: list.length });
    }
    setProgress(null);
  };

  const handleCopy = async (item: MediaItem) => {
    const url = absoluteUrl(item.url);
    if (await copyText(url)) {
      setCopiedKey(item.key);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopiedKey(null), 2000);
    } else {
      // Last resort: a prompt with the URL pre-selected so it can be copied by hand.
      window.prompt("Copy this image URL:", url);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.name}"?\n\nAny post using this image will show a broken image. This cannot be undone.`)) return;
    setDeletingKey(item.key);
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setItems((prev) => prev.filter((i) => i.key !== item.key));
      toast.success("Image deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingKey(null);
    }
  };

  const uploading = progress !== null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary dark:text-white">Media</h1>
          {!loading && !loadError && (
            <p className="text-sm text-slate-500 mt-1">{items.length} {items.length === 1 ? "image" : "images"} in the library</p>
          )}
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Upload zone */}
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (!uploading) handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !uploading) { e.preventDefault(); inputRef.current?.click(); } }}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-10 text-center mb-8 hover:border-accent focus:outline-none focus-visible:border-accent transition-colors cursor-pointer"
      >
        <Upload size={30} className="text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          {uploading ? `Uploading ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…` : "Drag & drop or click to upload images"}
        </p>
        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 10MB · uploads stay in the library below</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* Search */}
      {items.length > 0 && (
        <div className="relative max-w-sm mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
            placeholder="Search by file name…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      )}

      {truncated && (
        <p className="mb-4 text-xs text-amber-600">Showing the newest images only — the library is very large.</p>
      )}

      {/* States */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-36 bg-slate-100" />
              <div className="p-3 space-y-2"><div className="h-3 bg-slate-100 rounded" /><div className="h-3 w-1/2 bg-slate-100 rounded" /></div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-red-500 mb-3">{loadError}</p>
          <button type="button" onClick={load} className="btn-secondary text-sm !py-2">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">
          {items.length ? "No images match your search." : "No images uploaded yet."}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filtered.slice(0, visible).map((item) => (
              <MediaCard
                key={item.key}
                item={item}
                copied={copiedKey === item.key}
                deleting={deletingKey === item.key}
                canDelete={isAdmin}
                onCopy={() => handleCopy(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </div>
          {filtered.length > visible && (
            <div className="text-center mt-8">
              <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-secondary text-sm !py-2">
                Load more ({filtered.length - visible} more)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface MediaCardProps {
  item: MediaItem;
  copied: boolean;
  deleting: boolean;
  canDelete: boolean;
  onCopy: () => void;
  onDelete: () => void;
}

function MediaCard({ item, copied, deleting, canDelete, onCopy, onDelete }: MediaCardProps) {
  const [broken, setBroken] = useState(false);

  return (
    <div className={`card overflow-hidden flex flex-col ${deleting ? "opacity-50" : ""}`}>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="relative block h-36 bg-slate-100 dark:bg-slate-700" title="Open full size">
        {broken ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
            <ImageOff size={22} />
            <span className="text-[11px]">Preview unavailable</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.name} loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-cover" />
        )}
      </a>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" title={item.name}>{item.name}</p>
          <p className="text-[11px] text-slate-400">
            {formatSize(item.size)} · {format(new Date(item.uploadedAt), "MMM d, yyyy")}
          </p>
        </div>
        <div className="mt-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onCopy}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              copied ? "bg-green-50 text-green-600" : "bg-accent/10 text-accent hover:bg-accent/20"
            }`}
          >
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy URL</>}
          </button>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${item.name}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-accent hover:bg-slate-100 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              aria-label={`Delete ${item.name}`}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
