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

  return html;
}
