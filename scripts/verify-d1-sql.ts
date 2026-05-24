import * as fs from "fs";
import * as path from "path";

const sqlPath = path.resolve(process.cwd(), "migration-output", "mongo-to-d1.sql");
const reportPath = path.resolve(process.cwd(), "migration-output", "mongo-to-d1-report.json");

function countInsert(sql: string, table: string): number {
  const pattern = new RegExp(`^INSERT INTO ${table} `, "gm");
  return sql.match(pattern)?.length ?? 0;
}

function main() {
  const sql = fs.readFileSync(sqlPath, "utf8");
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

  const checks = {
    categories: countInsert(sql, "categories"),
    authors: countInsert(sql, "authors"),
    users: countInsert(sql, "users"),
    posts: countInsert(sql, "posts"),
    redirects: countInsert(sql, "redirects"),
    siteSettings: countInsert(sql, "site_settings"),
  };

  const expected = report.counts;
  const mismatches = [
    ["categories", expected.categories, checks.categories],
    ["authors", expected.authors, checks.authors],
    ["users", expected.users, checks.users],
    ["posts", expected.posts, checks.posts],
    ["redirects", expected.redirects, checks.redirects],
    ["siteSettings", expected.siteSettings, checks.siteSettings],
  ].filter(([, a, b]) => a !== b);

  if (mismatches.length > 0) {
    console.error("D1 SQL verification failed:");
    for (const [name, expectedCount, actualCount] of mismatches) {
      console.error(`${name}: expected ${expectedCount}, found ${actualCount}`);
    }
    process.exit(1);
  }

  console.log("D1 SQL verification passed:");
  console.log(JSON.stringify(checks, null, 2));
}

main();
