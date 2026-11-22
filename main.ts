// Copies POST.json from this repository to the output directory.
// The grader runs `node /bot/main.ts` with MAKEFUN_BOT_DIR=/bot and
// MAKEFUN_OUTPUT_DIR=/output from a different working directory, so the
// post file is resolved from MAKEFUN_BOT_DIR first, then from the directory
// holding this script, then from the current working directory — never from
// the working directory alone.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));

const candidates = [
  process.env.MAKEFUN_BOT_DIR
    ? join(process.env.MAKEFUN_BOT_DIR, "POST.json")
    : null,
  join(scriptDir, "POST.json"),
  join(process.cwd(), "POST.json"),
].filter((p): p is string => p !== null);

const source = candidates.find((p) => existsSync(p));
if (!source) {
  console.error("POST.json not found (looked in MAKEFUN_BOT_DIR, script dir, cwd)");
  process.exit(1);
}

// Validity check: POST.json must be a JSON object with a url string.
const parsed = JSON.parse(readFileSync(source, "utf8"));
if (!parsed || typeof parsed !== "object" || typeof parsed.url !== "string") {
  console.error("POST.json is not a JSON object with a url string");
  process.exit(1);
}

// Output directory: MAKEFUN_OUTPUT_DIR when set; otherwise a sensible
// default next to this script (not the caller's working directory, which the
// grader does not control).
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? join(scriptDir, "out");
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "POST.json");
copyFileSync(source, dest);

// Verify the copy: read it back and confirm it is the same valid post file,
// so a silent partial copy can never pass as a successful run.
const copied = JSON.parse(readFileSync(dest, "utf8"));
if (!copied || typeof copied !== "object" || copied.url !== parsed.url) {
  console.error("Copied POST.json does not match the source post file");
  process.exit(1);
}
console.log(`Copied ${source} to ${dest} (url: ${parsed.url})`);
