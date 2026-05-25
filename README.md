# 🏠 WorkNest — Home Office Amazon Affiliate Blog

A production-grade Amazon affiliate blogging website **exclusively focused on the Home Office niche** — covering desks, ergonomic chairs, monitors, lighting, keyboards, and everything remote workers need. Built with **Next.js 14**, **Node.js**, **MongoDB**, and deployed on **Vercel**.

> **Niche Strategy:** Single-niche focus for maximum topical authority and faster Google rankings.

---

## 🎯 Niche Focus — Home Office

### Sub-categories covered:

| Sub-Category | Example Topics |
|---|---|
| 🪑 Ergonomic Chairs | Best chairs under $300, lumbar support reviews |
| 🖥️ Monitors & Displays | Ultrawide monitors, 4K for home office |
| 🗂️ Desks & Workstations | Standing desks, L-shaped desks, small space desks |
| ⌨️ Keyboards & Mice | Mechanical keyboards, wireless mice, ergonomic combos |
| 💡 Lighting & Webcams | Ring lights, key lights, best webcams for meetings |
| 🔌 Cables & Accessories | Desk organizers, cable management, monitor arms |
| 🎧 Headphones & Audio | Noise-cancelling headphones, desk speakers |
| 🌐 Networking | Wi-Fi routers, mesh networks for home office |

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | Node.js via Next.js API Routes |
| Database | Cloudflare D1 (SQLite) |
| Auth | NextAuth.js (Credentials) |
| Styling | Tailwind CSS |
| Rich Text Editor | Tiptap |
| Image Uploads | Cloudflare R2 |
| Deployment | Cloudflare Workers |

---

## ✨ Features

### Public Website
- 🏠 Homepage with hero, featured posts grid, sub-category filter
- 📝 Blog listing with search and pagination
- 📖 Single post page — sticky Table of Contents, reading progress bar, breadcrumbs
- 🏷️ Sub-category pages (Chairs, Desks, Monitors, etc.)
- 🛒 Amazon affiliate product comparison boxes inside posts
- 🌙 Full dark mode support
- 📱 Fully responsive — mobile, tablet, desktop

### Dashboard (Admin)
- 📊 Stats — Total Posts, Published, Drafts, Total Views
- ✍️ Rich text post editor (Tiptap) with full toolbar
- 🔍 Complete SEO panel — meta title, description, OG tags, Twitter cards, JSON-LD
- 👁️ Live Google SERP preview inside the editor
- ✅ Real-time SEO checklist
- 🔗 Auto slug generation from title (manually editable)
- 📅 Post scheduling (publish later)
- 🖼️ Drag & drop image uploader via Cloudflare R2
- 🛍️ Amazon affiliate product manager per post
- 📂 Sub-category management

### SEO (Built-in)
- `generateMetadata` on every page (Next.js 14 Metadata API)
- Dynamic `sitemap.xml` — auto-updates on new posts
- `robots.txt`
- JSON-LD structured data — BlogPosting, BreadcrumbList, Product
- Canonical URLs
- Open Graph + Twitter Card tags
- ISR — Incremental Static Regeneration (revalidate every hour)
- Optimized images via `next/image`
- Zero layout shift fonts via `next/font`

---

## 📁 Project Structure

```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                        # Homepage
│   │   ├── blog/
│   │   │   ├── page.tsx                    # All posts listing
│   │   │   └── [slug]/page.tsx             # Single blog post
│   │   ├── category/
│   │   │   └── [category]/page.tsx         # Sub-category page
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx                    # Dashboard home
│   │       ├── posts/
│   │       │   ├── page.tsx                # All posts table
│   │       │   ├── new/page.tsx            # Create new post
│   │       │   └── edit/[id]/page.tsx      # Edit post
│   │       ├── categories/page.tsx
│   │       ├── media/page.tsx
│   │       └── settings/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── posts/route.ts
│   │   ├── posts/[id]/route.ts
│   │   ├── categories/route.ts
│   │   └── upload/route.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   └── layout.tsx
├── components/
│   ├── public/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── BlogCard.tsx
│   │   ├── BlogGrid.tsx
│   │   ├── HeroSection.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── AmazonProductBox.tsx
│   │   ├── TableOfContents.tsx
│   │   ├── RelatedPosts.tsx
│   │   └── NewsletterSignup.tsx
│   └── dashboard/
│       ├── DashboardLayout.tsx
│       ├── Sidebar.tsx
│       ├── PostEditor.tsx
│       ├── SEOPanel.tsx
│       ├── MediaUploader.tsx
│       ├── StatsCard.tsx
│       └── PostsTable.tsx
├── lib/
│   ├── db/
│   │   ├── d1.ts
│   │   └── content.ts
│   └── utils/
│       ├── slugify.ts
│       ├── seo.ts
│       └── readingTime.ts
├── middleware.ts                            # Protects /dashboard routes
├── .env.local.example
├── next.config.js
└── tailwind.config.js
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 22+
- Cloudflare account (Workers + D1 + R2)
- Amazon Associates account

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/worknest.git
cd worknest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in all values:

```env
# NextAuth
NEXTAUTH_SECRET=your-long-random-secret-key
NEXTAUTH_URL=http://localhost:3000

# Cloudflare R2
R2_PUBLIC_URL=https://media.yourdomain.com

# Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=Home Desk Essentials

# Amazon Associates
AMAZON_ASSOCIATE_TAG=yourtag-20

# Email (Resend)
RESEND_API_KEY=re_your_api_key
RESEND_FROM="Home Desk Essentials <noreply@yourdomain.com>"
CONTACT_EMAIL=you@yourdomain.com
```

### 4. Seed the database

```bash
npm run seed
```

This creates:
- Default admin user
- 8 Home Office sub-categories (Chairs, Desks, Monitors, Keyboards, Lighting, Audio, Networking, Accessories)

### 5. Start development server

```bash
npm run dev
```

| URL | Description |
|---|---|
| `http://localhost:3000` | Public website |
| `http://localhost:3000/dashboard` | Admin dashboard |

---

## 🌐 Deploying to Cloudflare

### Step 1 — Push to GitHub
```bash
git add .
git commit -m "initial commit"
git push origin master
```

### Step 2 — Build & Deploy
```bash
npm run cf:deploy
```

CI/CD via GitHub Actions auto-deploys on every push to `master`.

---

## 🖼️ Cloudflare R2 Setup

1. Cloudflare dashboard → R2 → `homedeskessentials-media` bucket
2. Settings → Enable public access (ya custom domain add karo)
3. Copy the public URL
4. Add to Cloudflare Workers env vars: `R2_PUBLIC_URL=https://your-r2-url`

---

## 🔐 Admin Dashboard Access

The entire `/dashboard` is protected via `middleware.ts` using NextAuth.

**Default credentials after seeding:**
```
URL:      http://localhost:3000/dashboard
Email:    admin@worknest.com
Password: admin123
```

> ⚠️ Change the password immediately after first login via the Settings page.

---

## ✍️ Writing SEO-Optimized Posts

When creating a post in the dashboard, fill in the SEO Panel on the right:

| Field | Tip |
|---|---|
| **Focus Keyword** | e.g. `best ergonomic chair under 300` |
| **Meta Title** | Include keyword, keep under 60 chars |
| **Meta Description** | Summarize post, include keyword, under 160 chars |
| **Slug** | Auto-generated, keep it short and keyword-rich |
| **OG Image** | Use featured image (1200x630px recommended) |

The live **SEO Checklist** in the editor tells you exactly what to fix before publishing.

---

## 🛒 Adding Amazon Affiliate Products

Inside the post editor → **Affiliate Products** panel:

1. Click **Add Product**
2. Fill in: Product Name, Amazon URL, Image URL, Price, Badge (e.g. "Best Overall")
3. Add Pros and Cons
4. Drag to reorder
5. Products render as styled comparison cards inside the post automatically

> Always append your Associate Tag to every Amazon link: `?tag=yourtag-20`

---

## 📦 Key Dependencies

```json
{
  "next": "14.x",
  "next-auth": "^4.x",
  "next-themes": "^0.x",
  "bcryptjs": "^2.x",
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-image": "^2.x",
  "@tiptap/extension-link": "^2.x",
  "@tiptap/extension-table": "^2.x",
  "tailwindcss": "^3.x",
  "lucide-react": "latest",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "date-fns": "^3.x",
  "react-hot-toast": "^2.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x"
}
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | `#1B2A3B` (deep slate) |
| Accent | `#2DD4BF` (teal) |
| Background | `#F9FAFB` |
| Surface | `#FFFFFF` |
| Amazon CTA | `#FF9900` |
| Heading Font | Playfair Display |
| Body Font | DM Sans |

---

## 📈 Content Strategy Tips

- **Target buyer-intent keywords** — "best", "review", "vs", "under $X", "for home office"
- **Minimum post length** — 1500 words for listicles, 2000+ for in-depth reviews
- **Internal linking** — connect related sub-categories: chairs → desks → monitors
- **Publishing frequency** — 2 to 3 posts per week consistently for the first 6 months
- **Start with long-tail** — rank for "best monitor arm for standing desk" before targeting "best monitor"

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 🙋 Support

Open a GitHub Issue for bugs or questions.

---

*Built for the Home Office niche — one niche, full authority.*
