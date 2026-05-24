import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Category from "../lib/models/Category";
import Author from "../lib/models/Author";
import User from "../lib/models/User";
import Post from "../lib/models/Post";
import Redirect from "../lib/models/Redirect";
import SiteSettings from "../lib/models/SiteSettings";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const outputDir = path.resolve(process.cwd(), process.env.MIGRATION_OUTPUT_DIR ?? "migration-output");
const sqlPath = path.join(outputDir, "mongo-to-d1.sql");
const remoteSqlPath = path.join(outputDir, "mongo-to-d1.remote.sql");
const reportPath = path.join(outputDir, "mongo-to-d1-report.json");

type AnyDoc = Record<string, any>;

function idOf(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value!) return String((value as { _id: unknown })._id);
  return String(value);
}

function iso(value: unknown): string {
  const date = value ? new Date(value as string | number | Date) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function sqlString(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value: unknown, fallback = 0): string {
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : String(fallback);
}

function json(value: unknown): string {
  return sqlString(JSON.stringify(value ?? []));
}

function insert(table: string, fields: string[], values: unknown[]): string {
  return `INSERT INTO ${table} (${fields.join(", ")}) VALUES (${values.join(", ")});`;
}

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return Array.from(dupes).sort();
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required in .env.local");

  await mongoose.connect(uri);

  const [categories, authors, users, posts, redirects, settings] = await Promise.all([
    Category.find().lean(),
    Author.find().lean(),
    User.find().lean(),
    Post.find().lean(),
    Redirect.find().lean(),
    SiteSettings.find().lean(),
  ]);

  const categoryIds = new Set(categories.map((category: AnyDoc) => idOf(category._id)));
  const authorIds = new Set(authors.map((author: AnyDoc) => idOf(author._id)));

  const lines: string[] = [
    "PRAGMA defer_foreign_keys = ON;",
    "BEGIN TRANSACTION;",
    "DELETE FROM posts;",
    "DELETE FROM categories;",
    "DELETE FROM authors;",
    "DELETE FROM users;",
    "DELETE FROM redirects;",
    "DELETE FROM site_settings;",
  ];

  for (const category of categories as AnyDoc[]) {
    lines.push(insert("categories", [
      "id", "name", "slug", "description", "icon", "meta_title", "meta_description", "created_at", "updated_at",
    ], [
      sqlString(idOf(category._id)),
      sqlString(category.name),
      sqlString(category.slug),
      sqlString(category.description ?? ""),
      sqlString(category.icon ?? ""),
      sqlString(category.metaTitle ?? ""),
      sqlString(category.metaDescription ?? ""),
      sqlString(iso(category.createdAt)),
      sqlString(iso(category.updatedAt)),
    ]));
  }

  for (const author of authors as AnyDoc[]) {
    lines.push(insert("authors", [
      "id", "name", "slug", "bio", "photo", "twitter", "website", "created_at", "updated_at",
    ], [
      sqlString(idOf(author._id)),
      sqlString(author.name),
      sqlString(author.slug),
      sqlString(author.bio ?? ""),
      sqlString(author.photo ?? ""),
      sqlString(author.twitter ?? ""),
      sqlString(author.website ?? ""),
      sqlString(iso(author.createdAt)),
      sqlString(iso(author.updatedAt)),
    ]));
  }

  for (const user of users as AnyDoc[]) {
    lines.push(insert("users", [
      "id", "name", "email", "password", "role", "bio", "photo", "twitter", "website", "reset_token", "reset_token_expiry", "created_at", "updated_at",
    ], [
      sqlString(idOf(user._id)),
      sqlString(user.name),
      sqlString(user.email),
      sqlString(user.password),
      sqlString(user.role ?? "admin"),
      sqlString(user.bio ?? ""),
      sqlString(user.photo ?? ""),
      sqlString(user.twitter ?? ""),
      sqlString(user.website ?? ""),
      sqlString(user.resetToken),
      sqlString(user.resetTokenExpiry ? iso(user.resetTokenExpiry) : null),
      sqlString(iso(user.createdAt)),
      sqlString(iso(user.updatedAt)),
    ]));
  }

  for (const post of posts as AnyDoc[]) {
    const categoryId = idOf(post.category);
    const authorId = idOf(post.author);

    lines.push(insert("posts", [
      "id", "title", "slug", "excerpt", "content", "featured_image", "featured_image_alt",
      "category_id", "author_id", "tags_json", "status", "published_at", "scheduled_at",
      "views", "reading_time", "meta_title", "meta_description", "focus_keyword", "og_image",
      "affiliate_products_json", "faqs_json", "created_at", "updated_at",
    ], [
      sqlString(idOf(post._id)),
      sqlString(post.title),
      sqlString(post.slug),
      sqlString(post.excerpt ?? ""),
      sqlString(post.content ?? ""),
      sqlString(post.featuredImage ?? ""),
      sqlString(post.featuredImageAlt ?? ""),
      sqlString(categoryId),
      sqlString(authorId && authorIds.has(authorId) ? authorId : null),
      json(post.tags ?? []),
      sqlString(post.status ?? "draft"),
      sqlString(post.publishedAt ? iso(post.publishedAt) : null),
      sqlString(post.scheduledAt ? iso(post.scheduledAt) : null),
      sqlNumber(post.views),
      sqlNumber(post.readingTime),
      sqlString(post.metaTitle ?? ""),
      sqlString(post.metaDescription ?? ""),
      sqlString(post.focusKeyword ?? ""),
      sqlString(post.ogImage ?? ""),
      json(post.affiliateProducts ?? []),
      json(post.faqs ?? []),
      sqlString(iso(post.createdAt)),
      sqlString(iso(post.updatedAt)),
    ]));

    if (!categoryId || !categoryIds.has(categoryId)) {
      console.warn(`Post has missing category: ${post.slug}`);
    }
  }

  for (const redirect of redirects as AnyDoc[]) {
    lines.push(insert("redirects", [
      "id", "source", "destination", "type", "active", "created_at", "updated_at",
    ], [
      sqlString(idOf(redirect._id)),
      sqlString(redirect.source),
      sqlString(redirect.destination),
      sqlNumber(redirect.type, 301),
      redirect.active === false ? "0" : "1",
      sqlString(iso(redirect.createdAt)),
      sqlString(iso(redirect.updatedAt)),
    ]));
  }

  for (const setting of settings as AnyDoc[]) {
    lines.push(insert("site_settings", [
      "key", "value_json", "created_at", "updated_at",
    ], [
      sqlString(setting.key),
      sqlString(JSON.stringify(setting.value ?? {})),
      sqlString(iso(setting.createdAt)),
      sqlString(iso(setting.updatedAt)),
    ]));
  }

  lines.push("COMMIT;");

  const report = {
    generatedAt: new Date().toISOString(),
    counts: {
      categories: categories.length,
      authors: authors.length,
      users: users.length,
      posts: posts.length,
      publishedPosts: posts.filter((post: AnyDoc) => post.status === "published").length,
      redirects: redirects.length,
      siteSettings: settings.length,
    },
    duplicateSlugs: {
      posts: duplicateValues(posts.map((post: AnyDoc) => post.slug).filter(Boolean)),
      categories: duplicateValues(categories.map((category: AnyDoc) => category.slug).filter(Boolean)),
      authors: duplicateValues(authors.map((author: AnyDoc) => author.slug).filter(Boolean)),
    },
    missingRelations: {
      postsMissingCategory: posts
        .filter((post: AnyDoc) => !idOf(post.category) || !categoryIds.has(idOf(post.category)))
        .map((post: AnyDoc) => ({ id: idOf(post._id), slug: post.slug, category: idOf(post.category) })),
      postsMissingAuthor: posts
        .filter((post: AnyDoc) => idOf(post.author) && !authorIds.has(idOf(post.author)))
        .map((post: AnyDoc) => ({ id: idOf(post._id), slug: post.slug, author: idOf(post.author) })),
    },
  };

  fs.mkdirSync(outputDir, { recursive: true });
  const sql = `${lines.join("\n")}\n`;
  const remoteSql = `${lines
    .filter((line) => !["PRAGMA defer_foreign_keys = ON;", "BEGIN TRANSACTION;", "COMMIT;"].includes(line))
    .join("\n")}\n`;

  fs.writeFileSync(sqlPath, sql);
  fs.writeFileSync(remoteSqlPath, remoteSql);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  await mongoose.disconnect();

  console.log(`Wrote ${sqlPath}`);
  console.log(`Wrote ${remoteSqlPath}`);
  console.log(`Wrote ${reportPath}`);
}

main().catch(async (error) => {
  await mongoose.disconnect().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
