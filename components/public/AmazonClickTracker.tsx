"use client";

import { useEffect } from "react";

/**
 * Counts clicks on Amazon links (rel="sponsored") for the dashboard by sending a small beacon.
 * The link is left untouched and goes straight to Amazon; the beacon is fire-and-forget.
 */
export default function AmazonClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[rel~='sponsored']") as HTMLAnchorElement | null;
      if (!link || !/(^|\.)amazon\.com$/i.test(link.hostname)) return;
      const payload = JSON.stringify({ path: window.location.pathname, href: link.href });
      try {
        navigator.sendBeacon("/api/track/amazon-click", new Blob([payload], { type: "application/json" }));
      } catch {
        // Tracking must never get in the way of the click.
      }
    };
    // Capture phase, and auxclick for middle-click "open in new tab".
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  return null;
}
