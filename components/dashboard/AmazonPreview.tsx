"use client";

import { useEffect, useState } from "react";
import { isValidAsin } from "@/lib/products";
import type { AmazonItemStatus } from "@/lib/amazon/productImages";

type Lookup = { configured: boolean; item?: AmazonItemStatus };

/** Under a product's ASIN field: confirms the ASIN on Amazon and shows its image (Creators API). */
export default function AmazonPreview({ asin }: { asin: string }) {
  const [lookup, setLookup] = useState<Lookup | null>(null);

  useEffect(() => {
    setLookup(null);
    if (!isValidAsin(asin)) return;
    let cancelled = false;
    // Wait until typing stops so each keystroke doesn't call the API.
    const timer = setTimeout(() => {
      fetch(`/api/amazon/lookup?asins=${asin}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { configured: boolean; items: Record<string, AmazonItemStatus> } | null) => {
          if (!cancelled && data) setLookup({ configured: data.configured, item: data.items[asin] });
        })
        .catch(() => {});
    }, 600);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [asin]);

  // Without API credentials there's nothing to check against.
  if (!lookup?.configured || !lookup.item) return null;
  const { item } = lookup;

  if (item.status === "not_found") {
    return <p className="mt-1 text-xs text-red-500">Not found on Amazon — check the ASIN.</p>;
  }
  if (item.status === "unavailable") {
    return <p className="mt-1 text-xs text-slate-400">Amazon check unavailable right now (the product will show without an image).</p>;
  }
  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image.url} alt="" className="h-10 w-10 rounded border border-slate-200 bg-white object-contain" referrerPolicy="no-referrer" />
      )}
      Found on Amazon{item.image ? "" : " (no image)"}
    </div>
  );
}
