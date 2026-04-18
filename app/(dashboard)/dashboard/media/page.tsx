"use client";

import { useState } from "react";
import { Upload, Copy } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface UploadedFile {
  url: string;
  name: string;
}

export default function MediaPage() {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setUploads((prev) => [{ url, name: file.name }, ...prev]);
        toast.success(`${file.name} uploaded`);
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-primary dark:text-white mb-8">Media</h1>

      {/* Upload zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-12 text-center mb-8 hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById("media-input")?.click()}
      >
        <Upload size={32} className="text-slate-400 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400">
          {uploading ? "Uploading…" : "Drag & drop or click to upload images"}
        </p>
        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 10MB</p>
        <input
          id="media-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Gallery */}
      {uploads.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploads.map((file, i) => (
            <div key={i} className="card overflow-hidden group relative">
              <div className="relative h-40 bg-slate-100 dark:bg-slate-700">
                <Image src={file.url} alt={file.name} fill className="object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{file.name}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(file.url);
                    toast.success("URL copied");
                  }}
                  className="flex items-center gap-1 text-xs text-accent hover:underline mt-1"
                >
                  <Copy size={11} /> Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!uploads.length && (
        <p className="text-center text-slate-400 text-sm">No images uploaded yet in this session.</p>
      )}
    </div>
  );
}
