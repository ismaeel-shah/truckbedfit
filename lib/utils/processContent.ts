/**
 * Post-processes blog HTML content for proper mobile responsiveness.
 * Wraps iframes (YouTube, etc.) in 16:9 aspect-ratio containers.
 */
export function processContent(html: string): string {
  if (!html) return html;

  return html.replace(
    /<iframe([^>]*)>[\s\S]*?<\/iframe>/gi,
    (_, attrs) =>
      `<div class="iframe-wrapper"><iframe${attrs}></iframe></div>`
  );
}
