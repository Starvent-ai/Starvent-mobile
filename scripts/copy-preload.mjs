import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const src = path.join(root, "src/main/preload.cjs");
const destDir = path.join(root, "dist-electron/preload");
const dest = path.join(destDir, "index.cjs");

await mkdir(destDir, { recursive: true });
await copyFile(src, dest);

console.log(`[copy-preload] ${src} -> ${dest}`);
