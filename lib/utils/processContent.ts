export function processContent(html: string): string {
  if (!html) return html;

  // Wrap iframes (YouTube etc.) in 16:9 responsive containers
  html = html.replace(
    /<iframe([^>]*)>[\s\S]*?<\/iframe>/gi,
    (_, attrs) => `<div class="iframe-wrapper"><iframe${attrs}></iframe></div>`
  );

  // Process tables: extract header labels → add data-label to each td → wrap
  html = html.replace(
    /<table([^>]*)>([\s\S]*?)<\/table>/gi,
    (_, tableAttrs, tableInner) => {
      // Extract column header texts from <thead> <th> cells
      const headers: string[] = [];
      const theadMatch = tableInner.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
      if (theadMatch) {
        for (const m of [...theadMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)]) {
          headers.push(m[1].replace(/<[^>]+>/g, "").trim());
        }
      }

      // Stamp data-label on every <td> so CSS can show it in card view
      let inner = tableInner;
      if (headers.length > 0) {
        inner = inner.replace(
          /(<tr[^>]*>)([\s\S]*?)(<\/tr>)/gi,
          (full, openTr, cells, closeTr) => {
            if (!cells.includes("<td")) return full; // skip header rows
            let i = 0;
            const stamped = cells.replace(/<td([^>]*)>/gi, (_, attrs) => {
              const label = (headers[i++] ?? "").replace(/"/g, "&quot;");
              return `<td${attrs} data-label="${label}">`;
            });
            return `${openTr}${stamped}${closeTr}`;
          }
        );
      }

      return `<div class="table-wrapper"><table${tableAttrs}>${inner}</table></div>`;
    }
  );

  return html;
}
