/**
 * Creates (or resets) an admin user in D1.
 *
 *   npm run admin:create -- --email you@truckbedfit.com --name "Your Name"            # local D1
 *   npm run admin:create -- --email you@truckbedfit.com --name "Your Name" --remote   # production D1
 *
 * The password is prompted for unless passed with --password. Re-running for an
 * existing email resets that user's password and makes them an admin.
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as readline from "readline";
import { randomUUID } from "crypto";
import { spawnSync } from "child_process";
import bcrypt from "bcryptjs";

const DATABASE_NAME = "truckbedfit";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); }));
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main() {
  const remote = process.argv.includes("--remote");
  const email = (arg("email") ?? await ask("Admin email: ")).toLowerCase();
  const name = arg("name") ?? await ask("Admin name: ");
  const password = arg("password") ?? await ask("Password (min 8 chars): ");

  if (!email.includes("@")) throw new Error("A valid --email is required");
  if (!name) throw new Error("--name is required");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const now = new Date().toISOString();
  const hash = await bcrypt.hash(password, 12);
  const sql = `
INSERT INTO users (id, name, email, password, role, created_at, updated_at)
VALUES (${sqlString(randomUUID())}, ${sqlString(name)}, ${sqlString(email)}, ${sqlString(hash)}, 'admin', ${sqlString(now)}, ${sqlString(now)})
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password = excluded.password,
  role = 'admin',
  updated_at = excluded.updated_at;
`;

  // Passing SQL via a file avoids shell-quoting problems with the bcrypt hash.
  const sqlFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "tbf-admin-")), "create-admin.sql");
  fs.writeFileSync(sqlFile, sql);

  try {
    // A single command string (shell needed for npx.cmd on Windows); sqlFile is a temp path we created.
    const command = `npx wrangler d1 execute ${DATABASE_NAME} ${remote ? "--remote" : "--local"} --file "${sqlFile}"`;
    const result = spawnSync(command, { stdio: "inherit", shell: true });
    if (result.status !== 0) throw new Error("wrangler d1 execute failed");
  } finally {
    fs.rmSync(path.dirname(sqlFile), { recursive: true, force: true });
  }

  console.log(`\nAdmin ${email} is ready on the ${remote ? "REMOTE (production)" : "local"} database.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
