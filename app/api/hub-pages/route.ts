import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getD1, nowIso } from "@/lib/db/d1";
import { emptyHubPage, getHubPage, isHubPath } from "@/lib/db/hubPages";
import { cleanFaqs, firstIssue, todayIsoDate } from "@/lib/validation/post";

const hubPageSchema = z.object({
  path: z.string().refine(isHubPath, { message: "Unknown hub page" }),
  title: z.string().trim().max(200, "H1 is too long (max 200 characters)"),
  metaTitle: z.string().trim().max(120, "SEO title is too long"),
  metaDescription: z.string().trim().max(320, "Description is too long"),
  focusKeyword: z.string().trim().max(120, "Primary keyword is too long"),
  content: z.string(),
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .max(30, "Too many FAQs (max 30)")
    .refine((faqs) => faqs.every((faq) => faq.question.trim() && faq.answer.trim()), {
      message: "Every FAQ needs both a question and an answer",
    }),
});

export async function GET(req: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;
  const path = req.nextUrl.searchParams.get("path") ?? "";
  if (!isHubPath(path)) return NextResponse.json({ error: "Unknown hub page" }, { status: 404 });
  return NextResponse.json((await getHubPage(path)) ?? emptyHubPage(path));
}

/** Saves a hub's written content. The "updated" date moves to today unless it's marked a minor edit. */
export async function PUT(req: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const body = (await req.json()) as Record<string, unknown>;
  const parsed = hubPageSchema.safeParse({ ...body, faqs: cleanFaqs(body.faqs) });
  if (!parsed.success) return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  const hub = parsed.data;

  const existing = await getHubPage(hub.path);
  const updatedOn = body.markUpdated === false && existing?.updatedOn ? existing.updatedOn : todayIsoDate();
  const now = nowIso();

  await getD1().prepare(`
    INSERT INTO hub_pages (path, title, meta_title, meta_description, focus_keyword, content, faqs_json, updated_on, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(path) DO UPDATE SET
      title = excluded.title, meta_title = excluded.meta_title, meta_description = excluded.meta_description,
      focus_keyword = excluded.focus_keyword, content = excluded.content, faqs_json = excluded.faqs_json,
      updated_on = excluded.updated_on, updated_at = excluded.updated_at
  `).bind(
    hub.path, hub.title, hub.metaTitle, hub.metaDescription, hub.focusKeyword, hub.content,
    JSON.stringify(hub.faqs), updatedOn, now, now
  ).run();

  return NextResponse.json(await getHubPage(hub.path));
}
