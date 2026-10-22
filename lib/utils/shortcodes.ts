// Shortcodes let editors place components inside article HTML from the dashboard editor:
//   [productbox name="Product name" asin="B0XXXXXXXX" bullets="Point one|Point two" retailer="Amazon"]
//   [trustbox]
//   [bedchart trucks="ford-f-150,ram-1500"]      (trucks optional — defaults to the post's trucks)
// The editor wraps them in <p>…</p> and may encode quotes; both are handled here.

export type ContentSegment =
  | { kind: "html"; html: string }
  | { kind: "productbox"; name: string; asin: string; bullets: string[]; retailer?: string }
  | { kind: "trustbox" }
  | { kind: "bedchart"; trucks: string[] | null };

// Attribute text is quoted values (straight, smart or &quot;-encoded quotes, which may contain "]")
// or any other character except "]".
const QUOTED = String.raw`"[^"<]*"|“[^”<]*”|&quot;(?:(?!&quot;)[^<])*&quot;`;
const SHORTCODE_RE = new RegExp(
  String.raw`(?:<p[^>]*>\s*)?\[(productbox|trustbox|bedchart)\b((?:${QUOTED}|[^\]"“&]|&(?!quot;))*)\](?:\s*<\/p>)?`,
  "gi"
);
const ATTR_RE = /([a-z]+)\s*=\s*"([^"]*)"/gi;

/** Undo the HTML-escaping and smart quotes an editor can apply to shortcode attributes. */
function decodeAttrs(raw: string): string {
  return raw
    .replace(/&quot;|&#34;|[“”]/g, '"')
    .replace(/&#39;|&apos;|[‘’]/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const [, key, value] of Array.from(decodeAttrs(raw).matchAll(ATTR_RE))) attrs[key.toLowerCase()] = value.trim();
  return attrs;
}

const splitList = (value: string | undefined, sep: string) =>
  (value ?? "").split(sep).map((s) => s.trim()).filter(Boolean);

function toSegment(name: string, rawAttrs: string): ContentSegment {
  const attrs = parseAttrs(rawAttrs);
  switch (name.toLowerCase()) {
    case "productbox":
      return {
        kind: "productbox",
        name: attrs.name ?? "",
        asin: (attrs.asin ?? "").toUpperCase(),
        bullets: splitList(attrs.bullets, "|"),
        retailer: attrs.retailer || undefined,
      };
    case "trustbox":
      return { kind: "trustbox" };
    default:
      return { kind: "bedchart", trucks: attrs.trucks ? splitList(attrs.trucks, ",") : null };
  }
}

/** Splits article HTML into plain HTML chunks and shortcode components, in order. */
export function splitShortcodes(html: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let last = 0;
  for (const match of Array.from(html.matchAll(SHORTCODE_RE))) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ kind: "html", html: html.slice(last, start) });
    segments.push(toSegment(match[1], match[2]));
    last = start + match[0].length;
  }
  if (last < html.length) segments.push({ kind: "html", html: html.slice(last) });
  return segments.filter((s) => s.kind !== "html" || s.html.trim() !== "");
}

/** Templates the editor's "Insert" buttons drop into the article. */
export const SHORTCODE_TEMPLATES = {
  productbox: '[productbox name="Product name" asin="B0XXXXXXXX" bullets="First point|Second point|Third point"]',
  trustbox: "[trustbox]",
  bedchart: '[bedchart trucks="ford-f-150"]',
} as const;
