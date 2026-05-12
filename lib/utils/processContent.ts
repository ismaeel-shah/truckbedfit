export function processContent(html: string): string {
  if (!html) return html;

  // Wrap iframes (YouTube etc.) in 16:9 responsive containers
  html = html.replace(
    /<iframe([^>]*)>[\s\S]*?<\/iframe>/gi,
    (_, attrs) => `<div class="iframe-wrapper"><iframe${attrs}></iframe></div>`
  );

  // Wrap tables in scrollable, styled containers
  html = html.replace(
    /<table([^>]*)>([\s\S]*?)<\/table>/gi,
    (_, attrs, inner) =>
      `<div class="table-wrapper"><table${attrs}>${inner}</table></div>`
  );

  return html;
}
