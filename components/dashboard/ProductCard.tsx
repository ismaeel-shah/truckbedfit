"use client";

import { useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Image as ImageIcon, Trash2 } from "lucide-react";
import { asinProblem } from "@/lib/products";
import { productImageShortcode, productShortcode } from "@/lib/utils/shortcodes";
import AmazonPreview from "./AmazonPreview";

/** A product row in the Products tab; key points are edited as one-per-line text. */
export interface FormProduct {
  label: string;
  name: string;
  asin: string;
  note: string;
  bullets: string;
}

export const emptyProduct = (): FormProduct => ({ label: "", name: "", asin: "", note: "", bullets: "" });

const LABEL_SUGGESTIONS = ["Best overall", "Best budget", "Best premium", "Best for short beds", "Best for long beds"];
const NOTE_MAX = 220;
const BULLETS_MAX = 8;

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-colors " +
  "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300";
const iconButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-primary " +
  "disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-slate-700 dark:hover:text-white";
const copyButtonClass =
  "hidden items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-600 transition-colors " +
  "hover:border-accent hover:text-accent sm:flex dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300";

interface ProductCardProps {
  product: FormProduct;
  index: number;
  total: number;
  onChange: (field: keyof FormProduct, value: string) => void;
  onMove: (by: -1 | 1) => void;
  onRemove: () => void;
  onCopyCode: (code: string) => void;
}

/** One product in the Products tab: a summary header (collapsible) and its fields. */
export default function ProductCard({ product, index, total, onChange, onMove, onRemove, onCopyCode }: ProductCardProps) {
  const [open, setOpen] = useState(true);
  const number = index + 1;
  const code = productShortcode(number);
  const imageCode = productImageShortcode(number);
  const asinError = product.asin ? asinProblem(product.asin) : null;
  const asinOk = Boolean(product.asin) && !asinError;
  const bulletCount = product.bullets.split("\n").filter((line) => line.trim()).length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header: number, summary, actions */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-white dark:bg-accent dark:text-primary">
          {number}
        </span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-left" aria-expanded={open}>
          <span className="block truncate text-sm font-semibold text-primary dark:text-white">
            {product.name || "New product"}
          </span>
          <span className="mt-0.5 flex items-center gap-2 truncate text-xs text-slate-500">
            {product.label && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary dark:bg-white/10 dark:text-slate-200">
                {product.label}
              </span>
            )}
            <span className={clsx("font-mono", asinOk ? "text-green-600" : "text-slate-400")}>
              {asinOk ? product.asin : "No ASIN yet"}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onCopyCode(code)}
          title="Copy this code and paste it in the article to show the product's full box there"
          className={copyButtonClass}
        >
          <Copy size={12} /> {code}
        </button>
        <button
          type="button"
          onClick={() => onCopyCode(imageCode)}
          title="Copy this code and paste it in the article to show only the product's photo there"
          className={copyButtonClass}
        >
          <ImageIcon size={12} /> Photo
        </button>
        <div className="flex items-center">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move product ${number} up`} className={iconButtonClass}>
            <ArrowUp size={16} />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} aria-label={`Move product ${number} down`} className={iconButtonClass}>
            <ArrowDown size={16} />
          </button>
          <button type="button" onClick={onRemove} aria-label={`Remove product ${number}`} className={clsx(iconButtonClass, "hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10")}>
            <Trash2 size={16} />
          </button>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-label={open ? "Collapse" : "Expand"} className={iconButtonClass}>
            <ChevronDown size={16} className={clsx("transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_1.6fr]">
            <div>
              <label className={labelClass}>Label</label>
              <input
                type="text"
                value={product.label}
                onChange={(e) => onChange("label", e.target.value)}
                placeholder="e.g. Best overall"
                maxLength={40}
                className={inputClass}
              />
              {!product.label && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {LABEL_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => onChange("label", suggestion)}
                      className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent dark:border-slate-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>
                Product name <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="e.g. BAKFlip MX4 Hard Folding Cover"
                maxLength={150}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              ASIN or Amazon link <span className="text-accent">*</span>
            </label>
            <div
              className={clsx(
                "flex overflow-hidden rounded-lg border bg-white transition-colors focus-within:ring-2 dark:bg-slate-800",
                asinError
                  ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-200"
                  : asinOk
                    ? "border-green-300 focus-within:border-green-400 focus-within:ring-green-100"
                    : "border-slate-200 focus-within:border-accent focus-within:ring-accent/20 dark:border-slate-700"
              )}
            >
              <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 font-mono text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                ASIN
              </span>
              <input
                type="text"
                value={product.asin}
                onChange={(e) => onChange("asin", e.target.value)}
                placeholder="B0ABCD1234 or paste the Amazon product link"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-sm text-slate-800 placeholder:font-sans placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
              />
              {asinOk && <span className="flex items-center pr-3 text-xs font-semibold text-green-600">✓ Valid</span>}
            </div>
            {asinError && <p className="mt-1.5 text-xs text-red-500">{asinError}</p>}
            <AmazonPreview asin={product.asin} />
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label className={labelClass.replace("mb-1.5 ", "")}>Why it&apos;s a pick</label>
              <span className={clsx("text-[11px]", product.note.length > NOTE_MAX - 20 ? "text-amber-600" : "text-slate-400")}>
                {product.note.length}/{NOTE_MAX}
              </span>
            </div>
            <input
              type="text"
              value={product.note}
              onChange={(e) => onChange("note", e.target.value)}
              placeholder="e.g. Low-profile, lockable and fits 5.5 ft and 6.5 ft beds"
              maxLength={NOTE_MAX}
              className={inputClass}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">One line, shown on the &quot;Our top picks&quot; card.</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label className={labelClass.replace("mb-1.5 ", "")}>Key points</label>
              <span className={clsx("text-[11px]", bulletCount > BULLETS_MAX ? "text-red-500" : "text-slate-400")}>
                {bulletCount}/{BULLETS_MAX}
              </span>
            </div>
            <textarea
              rows={3}
              value={product.bullets}
              onChange={(e) => onChange("bullets", e.target.value)}
              placeholder={"One point per line, e.g.\nFolds up to the cab\nWorks with most bed racks"}
              className={clsx(inputClass, "resize-y")}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Shown in the full product box — place it in the article with <code className="font-mono">{code}</code>
              {" "}(or just the photo with <code className="font-mono">{imageCode}</code>).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
