export function processContent(html: string): string {
  if (!html) return html;

  // Wrap iframes (YouTube etc.) in 16:9 responsive containers
  html = html.replace(
    /<iframe([^>]*)>[\s\S]*?<\/iframe>/gi,
    (_: string, attrs: string) => `<div class="iframe-wrapper"><iframe${attrs}></iframe></div>`
  );

  // Process tables
  html = html.replace(
    /<table([^>]*)>([\s\S]*?)<\/table>/gi,
    (_: string, tableAttrs: string, tableInner: string) => {
      const headers: string[] = [];
      let inner = tableInner;

      // Strategy 1: extract headers from <thead> <th> cells
      const theadMatch = tableInner.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
      if (theadMatch) {
        for (const m of Array.from(theadMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi))) {
          headers.push(m[1].replace(/<[^>]+>/g, "").trim());
        }
      }

      // Strategy 2: first <tr> that contains <th> elements (no <thead> wrapper)
      if (headers.length === 0) {
        const thRowMatch = tableInner.match(/(<tr[^>]*>)([\s\S]*?<\/th>[\s\S]*?)(<\/tr>)/i);
        if (thRowMatch) {
          for (const m of Array.from(thRowMatch[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi))) {
            headers.push(m[1].replace(/<[^>]+>/g, "").trim());
          }
          // Mark that row so CSS hides it on mobile
          inner = inner.replace(
            thRowMatch[0],
            thRowMatch[0].replace(/<tr([^>]*)>/, '<tr$1 data-table-header="true">')
          );
        }
      }

      // Stamp data-label on every <td> that is NOT in a header row
      if (headers.length > 0) {
        inner = inner.replace(
          /(<tr(?![^>]*data-table-header)[^>]*>)([\s\S]*?)(<\/tr>)/gi,
          (full: string, openTr: string, cells: string, closeTr: string) => {
            if (!cells.includes("<td")) return full;
            let i = 0;
            const stamped = cells.replace(/<td([^>]*)>/gi, (_: string, attrs: string) => {
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
