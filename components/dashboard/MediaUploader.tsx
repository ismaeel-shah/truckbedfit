"use client";

import { useRef, useState } from "react";
import { Upload, X, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

function isValidUrl(url: string) {
  // Site-relative paths (e.g. /api/media/file/... in local dev) are fine too.
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function MediaUploader({ value, onChange, label = "Image" }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Upload failed");
        return;
      }
      const data = await res.json();
      if (data.url) { onChange(data.url); toast.success("Image uploaded"); }
      else toast.error("Upload failed");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const validPreview = isValidUrl(value);

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      )}

      {validPreview ? (
        <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}
          className="h-36 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
        >
          <Upload size={22} className="text-slate-400" />
          <p className="text-sm text-slate-400 text-center px-4">
            {uploading ? "Uploading…" : "Click or drag & drop an image"}
          </p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ""; }}
      />

      {/* URL input — directly controls parent state */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Or paste image URL (https://...)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent/50 text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>
    </div>
  );
}
