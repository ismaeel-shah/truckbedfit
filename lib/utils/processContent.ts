// Amazon and its short-link domain; affiliate links must be marked as paid links.
const AFFILIATE_HOST = /^https?:\/\/(?:[a-z0-9-]+\.)*(?:amazon\.[a-z.]+|amzn\.to)(?:[/:?#]|$)/i;

/** Post-processes editor HTML before it is rendered on the public post page. */
export function processContent(html: string): string {
  if (!html) return html;

  // Wrap iframes (YouTube etc.) in 16:9 responsive containers
  html = html.replace(
    /<iframe([^>]*)>[\s\S]*?<\/iframe>/gi,
    (_: string, attrs: string) => `<div class="iframe-wrapper"><iframe${attrs}></iframe></div>`
  );

  // Wrap tables in scrollable container
  html = html.replace(
    /<table([^>]*)>([\s\S]*?)<\/table>/gi,
    (_: string, tableAttrs: string, tableInner: string) =>
      `<div class="table-wrapper"><table${tableAttrs}>${tableInner}</table></div>`
  );

  // Affiliate links: Google asks for rel="sponsored" on paid links.
  html = html.replace(/<a\b([^>]*)>/gi, (tag: string, attrs: string) => {
    const href = attrs.match(/\shref\s*=\s*"([^"]*)"/i)?.[1] ?? "";
    if (!AFFILIATE_HOST.test(href)) return tag;
    const rest = attrs.replace(/\s(?:rel|target)\s*=\s*"[^"]*"/gi, "");
    return `<a${rest} rel="sponsored nofollow noopener noreferrer" target="_blank">`;
  });

  // Images in the body are below the fold: load them lazily and decode off the main thread.
  html = html.replace(/<img\b(?![^>]*\sloading=)([^>]*)>/gi, '<img loading="lazy" decoding="async"$1>');

  return html;
}
