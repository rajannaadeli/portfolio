// Build-time step: copy each case's display screenshots (AVIF + WebP) out of
// cases/<slug>/ui/ into public/cases/<slug>/ so the static server serves them
// directly. The markdown and manifests are read in place (never duplicated);
// only the display binaries are copied. _originals/ (large source PNGs) are
// deliberately excluded. Idempotent — skips files already copied and unchanged.
import { readdirSync, mkdirSync, copyFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CASES = ['rosterbay', 'whitefleet', 'gad', 'docfort', 'planit', 'dilpos'];

let copied = 0;
let skipped = 0;

function copyDir(srcDir, outDir) {
  if (!existsSync(srcDir)) return false;
  mkdirSync(outDir, { recursive: true });
  for (const file of readdirSync(srcDir)) {
    if (!/\.(avif|webp)$/i.test(file)) continue;
    const src = join(srcDir, file);
    const dest = join(outDir, file);
    if (existsSync(dest) && statSync(dest).size === statSync(src).size) {
      skipped++;
      continue;
    }
    copyFileSync(src, dest);
    copied++;
  }
  return true;
}

for (const slug of CASES) {
  // Light theme: cases/<slug>/ui -> public/cases/<slug>/
  if (!copyDir(join(root, 'cases', slug, 'ui'), join(root, 'public', 'cases', slug))) {
    console.warn(`[copy-case-images] missing ui dir for ${slug}`);
  }
  // Dark theme (optional): cases/<slug>/dark-ui -> public/cases/<slug>/dark/
  copyDir(join(root, 'cases', slug, 'dark-ui'), join(root, 'public', 'cases', slug, 'dark'));
}

console.log(`[copy-case-images] copied ${copied}, up-to-date ${skipped}`);
