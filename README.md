# TruckBedFit

Amazon affiliate blog for truck bed accessories — tonneau covers, liners, toolboxes, racks, and more — with a built-in admin CMS. Live at **https://truckbedfit.com**.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Hosting | Cloudflare Workers via `@opennextjs/cloudflare` |
| Database | Cloudflare D1 (`truckbedfit`), raw SQL — see `migrations/` |
| Media | Cloudflare R2 (`truckbedfit-uploads`), served from `media.truckbedfit.com` |
| Auth | NextAuth credentials (bcrypt, 8h JWT sessions) |
| Editor | Tiptap rich text + raw HTML mode |
| Email | Resend (contact form, password reset) |

## How it works

- **Branding** lives in `lib/site.ts` (`SITE_NAME`, `SITE_URL`, tagline, description). Change it there, not in components.
- **Categories** are created in the dashboard. The homepage renders one section per category that has published posts (oldest category first, layouts rotate slider → grid → magazine → magazine flipped). The navbar shows the 3 categories with the most posts; the footer lists all of them.
- **Scheduled posts** are published automatically: the first request after a post's schedule time promotes it (checked at most once a minute per Worker). Schedule times are stored in UTC.
- **Views** are counted on each post page view (bots excluded) and drive the homepage "Trending" section and the dashboard stats.
- **Redirects** are managed in the dashboard and resolved for any unknown URL.

### Roles

| Role | Can do |
|---|---|
| `admin` | Everything, including Users, Redirects, and page SEO settings |
| `editor` | Posts, categories, authors, media, own password |

Roles are re-read from the database on every API request, so demoting or deleting a user takes effect immediately. Admins cannot change their own role.

## Local development

Requires Node.js 22+.

```bash
npm install
cp .env.local.example .env.local      # then fill in values (generate a NEW NEXTAUTH_SECRET)
npm run db:migrate:local              # create tables in the local D1 (.wrangler/state)
npm run admin:create -- --email you@truckbedfit.com --name "Your Name"   # prompts for password
npm run dev                           # http://localhost:3000, dashboard at /dashboard
```

`next dev` gets the D1/R2 bindings from `wrangler.jsonc` (local simulation) via `initOpenNextCloudflareForDev()` in `next.config.mjs`.

Useful checks: `npm run typecheck`, `npm run lint`. Builds fail on type or lint errors.

## First deploy (one-time Cloudflare setup)

1. **Create the database and bucket**
   ```bash
   npx wrangler login
   npx wrangler d1 create truckbedfit --location enam
   npx wrangler r2 bucket create truckbedfit-uploads --location enam
   ```
   Paste the `database_id` printed by `d1 create` into `wrangler.jsonc` (replacing the all-zero placeholder).

2. **R2 public access** — Cloudflare dashboard → R2 → `truckbedfit-uploads` → Settings → connect custom domain `media.truckbedfit.com`. If you use a different URL, update `R2_PUBLIC_URL` in `wrangler.jsonc`.

3. **Create tables and the first admin in production**
   ```bash
   npm run db:migrate:remote
   npm run admin:create -- --email you@truckbedfit.com --name "Your Name" --remote
   ```

4. **Secrets** (never commit these)
   ```bash
   npx wrangler secret put NEXTAUTH_SECRET    # new random value, not the one from any other site
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put CONTACT_EMAIL      # where contact-form messages go
   ```
   Non-secret values (`R2_PUBLIC_URL`, `NEXTAUTH_URL`, `RESEND_FROM`) are in `wrangler.jsonc` → `vars`. In Resend, verify the `truckbedfit.com` domain so `noreply@truckbedfit.com` can send.

5. **Domain** — add `truckbedfit.com` to the same Cloudflare account. The routes in `wrangler.jsonc` bind both `truckbedfit.com` and `www.truckbedfit.com`; the middleware 301-redirects `www` to the bare domain (canonical).

6. **Deploy**
   ```bash
   npm run cf:deploy
   ```
   Or push to `master`: `.github/workflows/deploy-cloudflare.yml` type-checks, builds, and deploys. It needs repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

> OpenNext warns that Windows builds are not fully supported. If `npm run cf:build` misbehaves locally, build in WSL or let CI (Linux) do it.

## Writing posts

- Every post has a **type** (pillar, category-hub, best-list-vehicle, best-list-type, review, brand, comparison, guide, parts) and optional **trucks**. The type decides which group it appears in on the category page; trucks put it on `/trucks/[truck]`. One pillar per category; it renders at `/[category]` itself.
- URLs are `/[category]/[slug]`. A category or truck page only exists once it has at least one published post.
- Fill in the SEO tab (primary keyword, SEO title — `{year}` becomes the current year — description, updated date). Saving a published post without these is rejected.
- Shortcodes (toolbar buttons in the editor), each on its own line:
  - `[productbox name="…" asin="B0XXXXXXXX" bullets="One|Two|Three"]` — Amazon box with a "Check price" button. No prices are shown (Amazon policy). The tag from `NEXT_PUBLIC_AMAZON_TAG` is added automatically.
  - `[trustbox]` — "How we picked" note linking to `/how-we-research`.
  - `[bedchart trucks="ford-f-150,ram-1500"]` — bed-size table from `data/trucks.ts` (omit `trucks` to use the post's trucks).
- FAQs render at the end of the post and as FAQPage structured data.

**Amazon tag:** set `NEXT_PUBLIC_AMAZON_TAG` in `.env.local` for local dev and as a GitHub Actions **variable** (Settings → Secrets and variables → Actions → Variables) for CI builds. It is baked in at build time, so redeploy after changing it.

**Placeholder content (local only):** `npm run db:seed-placeholders:local` adds three `[PLACEHOLDER]` posts so menus and pages have something to show; `npm run db:remove-placeholders:local` deletes them.

## Project layout

```
app/(public)/        public site: home, [category], [category]/[slug], trucks, static pages
data/trucks.ts       the 16 trucks and their verified bed sizes
app/(dashboard)/     admin dashboard
app/api/             API routes (posts, categories, authors, users, redirects, settings, upload, auth)
components/          public/, dashboard/, Logo.tsx
lib/site.ts          branding constants
lib/utils/shortcodes.ts  [productbox]/[trustbox]/[bedchart] parser
lib/auth.ts          NextAuth config + requireUser() guard for API routes
lib/db/              D1 access (d1.ts mappers/types, content.ts shared queries)
migrations/          D1 schema
scripts/             create-admin, OpenNext asset sync, placeholder seed SQL
middleware.ts        www→bare redirect, noindex on non-canonical hosts, dashboard auth
```
