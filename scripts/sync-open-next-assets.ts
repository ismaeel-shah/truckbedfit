import * as fs from "fs";
import * as path from "path";

const root = process.cwd();
const sourceStatic = path.join(root, ".next", "static");
const publicDir = path.join(root, "public");
const targetAssets = path.join(root, ".open-next", "assets");
const targetNextStatic = path.join(targetAssets, "_next", "static");
const sourceDurableObjects = path.join(root, "node_modules", "@opennextjs", "cloudflare", "dist", "api", "durable-objects");
const sourceOverrides = path.join(root, "node_modules", "@opennextjs", "cloudflare", "dist", "api", "overrides");
const targetDurableObjects = path.join(root, ".open-next", "build", "durable-objects");
const targetOverrides = path.join(root, ".open-next", "build", "overrides");
const sourceCloudflareContext = path.join(root, "node_modules", "@opennextjs", "cloudflare", "dist", "api", "cloudflare-context.js");
const targetCloudflareContext = path.join(root, ".open-next", "build", "cloudflare-context.js");
const workerPath = path.join(root, ".open-next", "worker.js");

function copyDir(source: string, target: string) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true });
}

fs.mkdirSync(targetAssets, { recursive: true });
copyDir(sourceStatic, targetNextStatic);
copyDir(sourceDurableObjects, targetDurableObjects);
copyDir(sourceOverrides, targetOverrides);
if (fs.existsSync(sourceCloudflareContext)) {
  fs.copyFileSync(sourceCloudflareContext, targetCloudflareContext);
}

if (fs.existsSync(workerPath)) {
  const worker = fs
    .readFileSync(workerPath, "utf8")
    .replaceAll("./.build/durable-objects/", "./build/durable-objects/");
  fs.writeFileSync(workerPath, worker);
}

if (fs.existsSync(publicDir)) {
  for (const entry of fs.readdirSync(publicDir)) {
    copyDir(path.join(publicDir, entry), path.join(targetAssets, entry));
    const sourceFile = path.join(publicDir, entry);
    const targetFile = path.join(targetAssets, entry);
    if (fs.statSync(sourceFile).isFile()) {
      fs.copyFileSync(sourceFile, targetFile);
    }
  }
}

console.log(`Synced static assets to ${targetAssets}`);
