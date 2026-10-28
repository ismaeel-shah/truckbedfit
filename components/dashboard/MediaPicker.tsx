"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImageOff, Search, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

interface MediaItem {
  key: string;
  url: string;
  name: string;
}

const PAGE_SIZE = 48;

/** Modal over the Media library: pick an uploaded image (or upload a new one) and get its URL. */
export default function MediaPicker({ onPick, onClose }: { onPick: (url: string, name: string) => void; onClose: () => void }) {
  const [items, setItems]         = useState<MediaItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery]         = useState("");
  const [visible, setVisible]     = useState(PAGE_SIZE);
  const inputRef  = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/media", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load media");
        if (!cancelled) setItems(data.items);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Could not load media");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Latest onClose without re-running the effect (which would steal focus back to search).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    searchRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setItems((prev) => [data as MediaItem, ...prev]);
      toast.success(`${file.name} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose an image"
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 className="font-heading text-lg font-bold text-primary dark:text-white">Choose an image</h2>
          <div className="relative ml-auto w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
              onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
              placeholder="Search by file name…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-primary transition-all hover:brightness-110 disabled:opacity-60"
          >
            <Upload size={15} /> {uploading ? "Uploading…" : "Upload new"}
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-700 dark:hover:text-white">
            <X size={18} />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ""; }}
          />
        </div>

        <div className="overflow-y-auto p-5">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700" />)}
            </div>
          ) : loadError ? (
            <p className="py-10 text-center text-sm text-red-500">{loadError}</p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              {items.length ? "No images match your search." : "No images yet — upload one to use it here."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filtered.slice(0, visible).map((item) => (
                  <PickerTile key={item.key} item={item} onPick={() => onPick(item.url, item.name)} />
                ))}
              </div>
              {filtered.length > visible && (
                <div className="mt-5 text-center">
                  <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-secondary !py-2 text-sm">
                    Load more ({filtered.length - visible} more)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function PickerTile({ item, onPick }: { item: MediaItem; onPick: () => void }) {
  const [broken, setBroken] = useState(false);
  return (
    <button
      type="button"
      onClick={onPick}
      title={item.name}
      className="group overflow-hidden rounded-lg border border-slate-200 text-left transition-all hover:border-accent hover:ring-2 hover:ring-accent/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-slate-700"
    >
      <span className="block h-32 bg-slate-100 dark:bg-slate-700">
        {broken ? (
          <span className="flex h-full items-center justify-center text-slate-400"><ImageOff size={20} /></span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-cover" />
        )}
      </span>
      <span className="block truncate px-2 py-1.5 text-[11px] text-slate-600 group-hover:text-accent dark:text-slate-300">{item.name}</span>
    </button>
  );
}
