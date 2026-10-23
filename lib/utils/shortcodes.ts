// Shortcodes let editors place components inside article HTML from the dashboard editor:
//   [productbox name="Product name" asin="B0XXXXXXXX" bullets="Point one|Point two" retailer="Amazon"]
//   [trustbox]
//   [bedchart trucks="ford-f-150,ram-1500"]      (trucks optional — defaults to the post's trucks)
//   [toppick label="Best overall" name="Product name" asin="B0XXXXXXXX" note="Why it made the list"]
//                                                (consecutive toppicks render together as one "Quick picks" grid)
// The editor wraps them in <p>…</p> and may encode quotes; both are handled here.

export type ContentSegment =
  | { kind: "html"; html: string }
  | { kind: "productbox"; name: string; asin: string; bullets: string[]; retailer?: string }
  | { kind: "trustbox" }
  | { kind: "bedchart"; trucks: string[] | null }
  | { kind: "toppicks"; picks: TopPick[] };

export interface TopPick {
  label: string;
  name: string;
  asin: string;
  note: string;
}

/** Before grouping: each [toppick] is parsed on its own, then runs of them are merged. */
type RawSegment = ContentSegment | { kind: "toppick"; pick: TopPick };

// Attribute text is quoted values (straight, smart or &quot;-encoded quotes, which may contain "]")
// or any other character except "]".
const QUOTED = String.raw`"[^"<]*"|“[^”<]*”|&quot;(?:(?!&quot;)[^<])*&quot;`;
const SHORTCODE_RE = new RegExp(
  String.raw`(?:<p[^>]*>\s*)?\[(productbox|trustbox|bedchart|toppick)\b((?:${QUOTED}|[^\]"“&]|&(?!quot;))*)\](?:\s*<\/p>)?`,
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

function toSegment(name: string, rawAttrs: string): RawSegment {
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
    case "toppick":
      return {
        kind: "toppick",
        pick: {
          label: attrs.label ?? "",
          name: attrs.name ?? "",
          asin: (attrs.asin ?? "").toUpperCase(),
          note: attrs.note ?? "",
        },
      };
    default:
      return { kind: "bedchart", trucks: attrs.trucks ? splitList(attrs.trucks, ",") : null };
  }
}

/** Splits article HTML into plain HTML chunks and shortcode components, in order. */
export function splitShortcodes(html: string): ContentSegment[] {
  const segments: RawSegment[] = [];
  let last = 0;
  for (const match of Array.from(html.matchAll(SHORTCODE_RE))) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ kind: "html", html: html.slice(last, start) });
    segments.push(toSegment(match[1], match[2]));
    last = start + match[0].length;
  }
  if (last < html.length) segments.push({ kind: "html", html: html.slice(last) });
  return groupTopPicks(segments.filter((s) => s.kind !== "html" || !isBlankHtml(s.html)));
}

/** Whitespace or empty paragraphs (the editor adds <p></p> for blank lines). */
const isBlankHtml = (html: string) => /^(?:\s|<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>|<br\s*\/?>)*$/i.test(html);

/** Merges each run of consecutive [toppick] shortcodes into one toppicks segment. */
function groupTopPicks(segments: RawSegment[]): ContentSegment[] {
  const out: ContentSegment[] = [];
  for (const segment of segments) {
    if (segment.kind !== "toppick") {
      out.push(segment);
      continue;
    }
    const previous = out[out.length - 1];
    if (previous?.kind === "toppicks") previous.picks.push(segment.pick);
    else out.push({ kind: "toppicks", picks: [segment.pick] });
  }
  return out;
}

/** Templates the editor's "Insert" buttons drop into the article. */
export const SHORTCODE_TEMPLATES = {
  productbox: '[productbox name="Product name" asin="B0XXXXXXXX" bullets="First point|Second point|Third point"]',
  trustbox: "[trustbox]",
  bedchart: '[bedchart trucks="ford-f-150"]',
  toppicks: [
    '[toppick label="Best overall" name="Product name" asin="B0XXXXXXXX" note="One line on why it made the list"]',
    '[toppick label="Best budget" name="Product name" asin="B0XXXXXXXX" note="One line on why it made the list"]',
    '[toppick label="Best for short beds" name="Product name" asin="B0XXXXXXXX" note="One line on why it made the list"]',
  ],
} as const;
