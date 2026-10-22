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

- Fill in the SEO tab (focus keyword, meta title ≤ 60 chars, meta description 50–160 chars); the checklist shows what's missing.
- Affiliate products render as "Our Top Picks" cards above the post body. **Put your Associates tag in every Amazon URL** (`?tag=yourtag-20`) — the site does not add it automatically.
- FAQs render at the end of the post and as FAQPage structured data.

## Project layout

```
app/(public)/        public site: home, blog, post, category, about, contact
app/(dashboard)/     admin dashboard
app/api/             API routes (posts, categories, authors, users, redirects, settings, upload, auth)
components/          public/, dashboard/, Logo.tsx
lib/site.ts          branding constants
lib/auth.ts          NextAuth config + requireUser() guard for API routes
lib/db/              D1 access (d1.ts mappers/types, content.ts shared queries)
migrations/          D1 schema
scripts/             create-admin, OpenNext asset sync
middleware.ts        www redirect + dashboard auth
```
