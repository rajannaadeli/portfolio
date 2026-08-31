#!/usr/bin/env node
/*
  SEO regression check.

  Crawls every URL in the sitemap of a running build and asserts the things that
  silently rot: title length, description length, a self-referencing canonical,
  exactly one h1, an og:image, parseable JSON-LD, and alt text on every image.

  Usage:
    pnpm build && pnpm start -p 3111 &
    node scripts/seo-check.mjs http://localhost:3111

  Exits non-zero on any FAIL, so it can gate a deploy.
*/

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const PROD = "https://rajanna.dev";

// Google renders roughly 580px of title and 920px of description. These
// character counts are the usual proxies; over them, the tail is truncated.
const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_MAX = 165;

let fails = 0;
let warns = 0;

const ok = (m) => console.log(`  \x1b[32mPASS\x1b[0m ${m}`);
const bad = (m) => {
  fails++;
  console.log(`  \x1b[31mFAIL\x1b[0m ${m}`);
};
const warn = (m) => {
  warns++;
  console.log(`  \x1b[33mWARN\x1b[0m ${m}`);
};

async function get(path) {
  const res = await fetch(base + path);
  return { status: res.status, body: await res.text() };
}

const attr = (html, re) => (html.match(re) || [])[1];
const decode = (s = "") =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");

async function checkPage(path) {
  console.log(`\n\x1b[1m${path || "/"}\x1b[0m`);
  const { status, body } = await get(path || "/");
  if (status !== 200) return bad(`HTTP ${status}`);

  const title = decode(attr(body, /<title>([^<]*)<\/title>/));
  if (!title) bad("no <title>");
  else if (title.length > TITLE_MAX) warn(`title ${title.length} chars (>${TITLE_MAX}): ${title}`);
  else ok(`title ${title.length} chars — ${title}`);

  const desc = decode(attr(body, /<meta name="description" content="([^"]*)"/));
  if (!desc) bad("no meta description");
  else if (desc.length < DESC_MIN || desc.length > DESC_MAX)
    warn(`description ${desc.length} chars (want ${DESC_MIN}–${DESC_MAX})`);
  else ok(`description ${desc.length} chars`);

  const canonical = attr(body, /<link rel="canonical" href="([^"]*)"/);
  const expected = `${PROD}${path}` || PROD;
  if (!canonical) bad("no canonical");
  else if (canonical.replace(/\/$/, "") !== expected.replace(/\/$/, ""))
    bad(`canonical ${canonical} != ${expected}`);
  else ok(`canonical ${canonical}`);

  const h1s = (body.match(/<h1[\s>]/g) || []).length;
  if (h1s === 1) ok("exactly one <h1>");
  else bad(`${h1s} <h1> elements (want 1)`);

  const og = attr(body, /<meta property="og:image" content="([^"]*)"/);
  if (og) ok(`og:image present`);
  else bad("no og:image");

  const imgs = body.match(/<img\b[^>]*>/g) || [];
  const noAlt = imgs.filter((t) => !/\salt=/.test(t));
  if (noAlt.length) bad(`${noAlt.length}/${imgs.length} <img> without alt`);
  else ok(`${imgs.length} images, all with alt`);

  const blocks = [...body.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  if (!blocks.length) bad("no JSON-LD");
  const types = [];
  for (const [, raw] of blocks) {
    try {
      const data = JSON.parse(raw.replace(/\\u003c/g, "<"));
      for (const e of data["@graph"] ?? [data]) {
        types.push(Array.isArray(e["@type"]) ? e["@type"].join("+") : e["@type"]);
      }
    } catch (e) {
      bad(`JSON-LD does not parse: ${e.message}`);
    }
  }
  if (types.length) ok(`JSON-LD: ${types.join(", ")}`);
}

async function main() {
  console.log(`\x1b[1mSEO check — ${base}\x1b[0m`);

  console.log(`\n\x1b[1mSite files\x1b[0m`);
  for (const [file, must] of [
    ["/robots.txt", "Sitemap:"],
    ["/sitemap.xml", "<urlset"],
    ["/llms.txt", "# Rajanna Adeli"],
    ["/manifest.webmanifest", "short_name"],
  ]) {
    const { status, body } = await get(file);
    if (status === 200 && body.includes(must)) ok(`${file} (${body.length} bytes)`);
    else bad(`${file} — status ${status}${status === 200 ? `, missing "${must}"` : ""}`);
  }

  const { body: xml } = await get("/sitemap.xml");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = urls.map((u) => u.replace(PROD, ""));
  console.log(`\n${paths.length} URLs in sitemap`);
  for (const p of paths) await checkPage(p);

  console.log(
    `\n\x1b[1mResult:\x1b[0m ${fails} failures, ${warns} warnings across ${paths.length} pages`,
  );
  process.exit(fails ? 1 : 0);
}

main();
