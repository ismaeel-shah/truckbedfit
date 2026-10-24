import { getD1, parseJson } from "./d1";
import { TRUCKS, getTruck } from "@/data/trucks";
import { truckPath } from "@/lib/urls";

// Written content for the generated hub pages (/trucks and each /trucks/<truck>), edited in the
// dashboard under "Truck pages". A hub without a row simply shows its generated parts.

export const TRUCKS_INDEX_PATH = "/trucks";

export interface HubPage {
  path: string;
  /** H1; empty = the generated default */
  title: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  content: string;
  faqs: { question: string; answer: string }[];
  updatedOn: string | null;
}

type HubPageRow = {
  path: string;
  title: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  content: string;
  faqs_json: string;
  updated_on: string | null;
};

/** Every editable hub, in menu order: the trucks index, then each truck. */
export function hubPaths(): string[] {
  return [TRUCKS_INDEX_PATH, ...TRUCKS.map((truck) => truckPath(truck.slug))];
}

export const isHubPath = (path: string) => hubPaths().includes(path);

/** The generated H1 a hub shows when no custom one is set. */
export function defaultHubTitle(path: string): string {
  if (path === TRUCKS_INDEX_PATH) return "Find gear for your truck";
  const truck = getTruck(path.replace(/^\/trucks\//, ""));
  return truck ? `${truck.name} bed accessories` : "";
}

export function emptyHubPage(path: string): HubPage {
  return { path, title: "", metaTitle: "", metaDescription: "", focusKeyword: "", content: "", faqs: [], updatedOn: null };
}

function mapHubPage(row: HubPageRow): HubPage {
  return {
    path: row.path,
    title: row.title ?? "",
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    focusKeyword: row.focus_keyword ?? "",
    content: row.content ?? "",
    faqs: parseJson<{ question: string; answer: string }[]>(row.faqs_json, []),
    updatedOn: row.updated_on,
  };
}

/** The hub's written content, or null if none was saved (or the table isn't there yet). */
export async function getHubPage(path: string): Promise<HubPage | null> {
  try {
    const row = await getD1().prepare("SELECT * FROM hub_pages WHERE path = ?").bind(path).first<HubPageRow>();
    return row ? mapHubPage(row) : null;
  } catch (err) {
    console.error("hub page lookup failed:", err);
    return null;
  }
}

export async function listHubPages(): Promise<HubPage[]> {
  try {
    const { results = [] } = await getD1().prepare("SELECT * FROM hub_pages").all<HubPageRow>();
    return results.map(mapHubPage);
  } catch (err) {
    console.error("hub page list failed:", err);
    return [];
  }
}
