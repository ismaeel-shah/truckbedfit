"use client";

import { useEffect, useRef, useState } from "react";

interface H3Item { id: string; text: string; }
interface H2Item { id: string; text: string; children: H3Item[]; }

function slugify(text: string) {
  return (
    text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "heading"
  );
}

export default function TableOfContents() {
  const [tree, setTree]     = useState<H2Item[]>([]);
  const [active, setActive] = useState<string>("");
  const rafRef              = useRef<number>(0);

  /* ── Build tree ─────────────────────────────────────── */
  useEffect(() => {
    const build = () => {
      const els = Array.from(
        document.querySelectorAll<HTMLElement>(".prose h2, .prose h3")
      );
      if (!els.length) return false;

      const usedIds = new Map<string, number>();
      els.forEach((el) => {
        const base  = slugify(el.textContent ?? "");
        const count = usedIds.get(base) ?? 0;
        usedIds.set(base, count + 1);
        el.id = count === 0 ? base : `${base}-${count}`;
      });

      const result: H2Item[] = [];
      els.forEach((el) => {
        if (el.tagName === "H2") {
          result.push({ id: el.id, text: el.textContent?.trim() ?? "", children: [] });
        } else if (el.tagName === "H3" && result.length > 0) {
          result[result.length - 1].children.push({
            id: el.id,
            text: el.textContent?.trim() ?? "",
          });
        }
      });

      setTree(result);
      return true;
    };

    if (!build()) {
      const mo = new MutationObserver(() => { if (build()) mo.disconnect(); });
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }
  }, []);

  /* ── Scroll-spy ─────────────────────────────────────── */
  useEffect(() => {
    if (!tree.length) return;

    const tick = () => {
      const els = Array.from(
        document.querySelectorAll<HTMLElement>(".prose h2, .prose h3")
      );
      let found = "";
      for (const el of els) {
        if (el.getBoundingClientRect().top < 130) found = el.id;
      }
      setActive(found || (els[0]?.id ?? ""));
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [tree]);

  /* ── Smooth scroll on click ─────────────────────────── */
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
    window.history.pushState(null, "", `#${id}`);
    setActive(id);
  };

  if (!tree.length) return null;

  return (
    <nav className="sticky top-24">
      <div className="card p-5">

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="w-0.5 h-4 rounded-full bg-accent shrink-0" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            On this page
          </p>
        </div>

        <ul className="space-y-0.5">
          {tree.map((h2) => (
            <li key={h2.id}>

              {/* H2 */}
              <a
                href={`#${h2.id}`}
                onClick={(e) => scrollTo(e, h2.id)}
                className={[
                  "flex items-start gap-2 px-2 py-1.5 rounded-lg text-sm leading-snug transition-all duration-150",
                  active === h2.id
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-800/60",
                ].join(" ")}
              >
                <span className={[
                  "mt-2 w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                  active === h2.id ? "bg-accent" : "bg-slate-300 dark:bg-slate-600",
                ].join(" ")} />
                <span>{h2.text}</span>
              </a>

              {/* H3 children */}
              {h2.children.length > 0 && (
                <ul className="mt-0.5 ml-4 pl-3 border-l-2 border-slate-100 dark:border-slate-700 space-y-0.5 mb-1">
                  {h2.children.map((h3) => (
                    <li key={h3.id}>
                      <a
                        href={`#${h3.id}`}
                        onClick={(e) => scrollTo(e, h3.id)}
                        className={[
                          "block px-2 py-1 rounded text-xs leading-snug transition-colors",
                          active === h3.id
                            ? "text-accent font-medium"
                            : "text-slate-400 dark:text-slate-500 hover:text-accent",
                        ].join(" ")}
                      >
                        {h3.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

            </li>
          ))}
        </ul>

      </div>
    </nav>
  );
}
