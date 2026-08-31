# rajanna.dev — SEO Guide

Everything the code now does automatically, and the handful of things only you
can do from a browser. Written to be followed once at launch, then skimmed twice
a year.

**The goal, stated honestly.** You will not rank for "workforce software
developer", and chasing it would be a waste of your time. The three things that
actually matter for this site are:

1. **"Rajanna Adeli" returns rajanna.dev first.** Most traffic arrives from a
   proposal, a résumé, or a profile link. The searcher already knows the name —
   they are checking you out. Owning that query is the whole game.
2. **Every shared link unfurls beautifully.** An Upwork proposal, a WhatsApp
   message, a LinkedIn post. This is where the OG images earn their keep.
3. **Pages load instantly.** Already true: Lighthouse 98–100 across the board.

A distant fourth, newly worth having: **being quotable inside an AI answer.**
ChatGPT Search, Perplexity, and Claude increasingly answer "who builds rostering
software" style questions directly, and they read structured data and
`/llms.txt`. Both now exist here.

---

## Part 1 — What is already built

Nothing in this section needs action. It is here so you know what exists and
where to change it.

### 1.1 Metadata

| Page | Title (chars) |
|---|---|
| `/` | Rajanna Adeli — Workforce & Operations Software Developer (57) |
| `/work` | Work — Workforce & Operations Systems — Rajanna Adeli (53) |
| `/work/rosterbay` | RosterBay — a live rostering & GPS time-tracking platform (57) |
| `/work/whitefleet` | WhiteFleet — a workforce platform where the worker owns the data (64) |
| `/work/gad` | GAD Builder — a general arrangement drawing builder (51) |
| `/work/docfort` | DocFort — a drawing vault for LHP Motors (40) |
| `/work/planit` | PlanIt — a timetable generator for colleges (43) |
| `/work/dilpos` | DilPOS — a multi-tenant POS for Australian corner shops (55) |

All under the ~65-character line where Google truncates.

Case titles are built by `caseTitle()` in `lib/seo.ts`. It uses the markdown deck
(the part after the em-dash in the `# ` heading) as the descriptor. RosterBay and
GAD Builder have a bare product name for a heading, so their descriptor is set
explicitly as `titleTail` in `CASE_SEO` — condensed from their own lede, not
invented. **To change a case title, edit its markdown heading**, not the code.

Case titles deliberately skip the `— Rajanna Adeli` suffix. Google now renders
the site name separately (it reads `og:site_name` and the `WebSite` entity, both
present), so repeating it would only spend characters the descriptor needs.

Also emitted site-wide: `keywords`, `robots` + `googlebot` (with
`max-image-preview:large`, which is what allows a large thumbnail beside your
result), `en_AU` locale with `en_US`/`en_GB` alternates, `formatDetection` off so
iOS stops turning numbers in case studies into phone links, and a self-referencing
canonical on every page.

### 1.2 Structured data (JSON-LD)

Two `<script type="application/ld+json">` blocks per page — one site-wide, one
page-specific — built in `lib/seo.ts` and injected by `components/seo/JsonLd.tsx`.

| Page | Entities |
|---|---|
| every page | `Person`, `ProfessionalService`, `WebSite` |
| `/` | `WebPage`+`ProfilePage`, `FAQPage`, `ItemList` |
| `/work` | `CollectionPage`, `BreadcrumbList`, `ItemList` |
| `/work/<slug>` | `SoftwareApplication`, `Article`, `BreadcrumbList` |

They cross-reference by `@id` rather than repeating themselves, so a crawler
reads one identity, not fifteen copies of your name.

Two of these do specific work worth knowing about:

- **`ProfessionalService`** carries `areaServed` (AU, US, UK, IN) and an
  `hasOfferCatalog` of your six services. This is the entity that makes the site
  eligible for service-style results and gives an AI a clean answer to "what does
  he do and who for".
- **`FAQPage`** reads from `lib/faq.ts` — the *same* module the visible accordion
  renders from. This matters: Google treats structured data that doesn't match
  visible copy as spam. They physically cannot drift now. **If you edit an FAQ
  answer, edit `lib/faq.ts` and both update.**

### 1.3 Open Graph images

Generated at build by `lib/og.tsx` using your real display font, one per page:

- `/opengraph-image` — the site card
- `/work/opengraph-image` — the index card
- `/work/<slug>/opengraph-image` — **one per case**, in that case's accent colour,
  with its name, descriptor, and short facts

Twitter/X cards re-export the same images. This is the piece that makes a
proposal link unfurl with "RosterBay — a live workforce platform…" in violet
instead of a grey rectangle.

### 1.4 Crawl files

| URL | What it does |
|---|---|
| `/robots.txt` | Allows everything except `/api/`. **AI crawlers explicitly allowed** — GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended and friends. For a portfolio, being quoted is worth more than the content is worth protecting. |
| `/sitemap.xml` | 8 URLs with `lastModified` from each case markdown's real mtime, plus **86 case screenshots as image entries** so they can rank in Google Images. |
| `/llms.txt` | Plain-text summary for AI crawlers ([llmstxt.org](https://llmstxt.org) convention). Generated from the same content source as the pages, so it can't go stale. |
| `/manifest.webmanifest` | Name, colour, icons for Android install and link parsers. |

### 1.5 On-page

- Exactly one `<h1>` per page — verified by the check script.
- **All 86 screenshots carry descriptive alt text**, ≥30 characters, drawn from
  `case-images.json`. That is unusually good and is why image indexing is worth
  turning on.
- Link text is descriptive: "Read the WhiteFleet case →", not "Read more".
- Semantic landmarks (`<main>`, `<nav>`, `<footer>`), skip link, `lang="en"`.

### 1.6 The check script

```bash
pnpm build
pnpm start -p 3111 &
pnpm seo:check http://localhost:3111
```

Crawls every sitemap URL and asserts title length, description length, a
self-referencing canonical, one `<h1>`, an `og:image`, parseable JSON-LD, and alt
text on every image. **Exits non-zero on failure**, so you can gate a deploy on
it. Current state: **0 failures, 1 warning** across 8 pages.

The one warning: RosterBay's meta description is 173 characters against a
165 target, because it is the case's own lede verbatim. Harmless — Google
truncates the tail and often rewrites descriptions anyway. If it bothers you,
shorten the second paragraph of `cases/rosterbay/rosterbay.md`.

---

## Part 2 — Deploy-time steps

### 2.1 Cloudflare Pages files

Two files now exist in `public/` and ship as-is:

**`public/_headers`** — the important one is the duplicate-content guard:

```
https://:project.pages.dev/*
  X-Robots-Tag: noindex, nofollow
```

Every Pages project also serves at `<project>.pages.dev` and at
`<commit>.<project>.pages.dev`, byte-identical to your apex domain. Google will
index those as duplicates and split the ranking signal — the exact mistake you
already fixed once on RosterBay. Also sets HSTS, `nosniff`, `Referrer-Policy`,
`Permissions-Policy`, and immutable caching for `/_next/static` and `/fonts`.

**`public/_redirects`** — `www` → apex (one canonical host, never both), plus
shortlinks worth having on a card: `/cv`, `/resume`, `/hire`, `/demo`,
`/linkedin`, `/github`.

> ⚠️ **These two files only work on Cloudflare Pages with a static export.** If
> you deploy via `@opennextjs/cloudflare` (Workers) instead, they are ignored and
> you must set the same rules in the dashboard or `wrangler.toml`.

### 2.2 The static export — already done

`output: "export"` is now set, `app/api/contact/route.ts` has become
`worker/index.ts`, and the metadata routes carry `force-static`. Full detail and
the deploy steps are in **DEPLOY-GUIDE.md**.

Two SEO-relevant notes:

- **`trailingSlash` is deliberately off**, and `html_handling` in
  `wrangler.jsonc` is set to match. Every canonical this site emits has no
  trailing slash; turning one on without the other creates the exact duplicate
  it is meant to prevent.
- **`public/_headers` sets `Content-Type: image/png` on the 14 generated OG
  images.** Next exports them to extensionless paths, and Cloudflare infers MIME
  type from the extension — without those rules every link preview silently
  breaks. Verify after any Next upgrade:
  `curl -sI https://rajanna.dev/opengraph-image | grep -i content-type`

### 2.3 Environment variables

Set these in Cloudflare Pages → Settings → Environment variables. All optional —
the code omits the tag or script when a variable is absent, so nothing breaks
locally.

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console, HTML-tag method (only if you skip DNS verification) |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Bing Webmaster Tools |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Cloudflare → Analytics & Logs → Web Analytics |
| `RESEND_API_KEY` | Resend, for the contact form — **encrypted, never committed** |

### 2.4 Post-deploy verification

```bash
# One canonical host; www must 301 to apex.
curl -sI https://www.rajanna.dev | grep -i '^location'

# The preview host must be noindex; the real host must NOT be.
curl -sI https://<project>.pages.dev | grep -i x-robots-tag   # expect: noindex
curl -sI https://rajanna.dev        | grep -i x-robots-tag   # expect: nothing

# Crawl files reachable.
curl -s https://rajanna.dev/robots.txt
curl -s https://rajanna.dev/sitemap.xml | head -20
curl -s https://rajanna.dev/llms.txt | head -20

# Full sweep against the live site.
pnpm seo:check https://rajanna.dev
```

Then paste a case URL into these:

- **Rich Results Test** — https://search.google.com/test/rich-results
- **Schema validator** — https://validator.schema.org
- **OG preview** — https://www.opengraph.xyz — and actually paste a link into
  WhatsApp, which caches aggressively and is the truest test.

---

## Part 3 — The browser steps (only you can do these)

### 3.1 Google Search Console — 15 minutes, do it first

1. https://search.google.com/search-console → **Add property** → choose
   **Domain** (not URL prefix — Domain covers www, apex, http and https in one).
2. It gives you a TXT record. Cloudflare → rajanna.dev → DNS → Add record →
   TXT, name `@`, paste the value. Verify (usually under a minute).
3. **Sitemaps** → submit `sitemap.xml`.
4. **URL Inspection** → paste each of the 8 URLs → **Request indexing**. Do this
   once, manually. It is the difference between being indexed this week and next
   month.
5. Come back in a week and check **Performance** for the query "rajanna adeli".

### 3.2 Bing Webmaster Tools — 2 minutes

https://www.bing.com/webmasters → **Import from Google Search Console** → one
click, everything carries over. Bing feeds DuckDuckGo and, more usefully now,
ChatGPT's web results.

### 3.3 Cloudflare Web Analytics — 3 minutes

Dashboard → Analytics & Logs → Web Analytics → Add a site → copy the token →
set `NEXT_PUBLIC_CF_BEACON_TOKEN` in Pages env vars → redeploy. Free, cookieless,
so **no consent banner is required**, and it doesn't touch your Lighthouse score.

### 3.4 The only link building that matters

Three backlinks, all of which you control, all of which are high-trust:

- [ ] **LinkedIn** → Profile → Contact info → Website → `https://rajanna.dev`
- [ ] **GitHub** → Profile settings → Website, and pin the repos referenced in
      the cases
- [ ] **Upwork** → Profile → Portfolio → add rajanna.dev, and link individual
      case URLs on individual portfolio items

Two more worth ten minutes each:

- [ ] **RosterBay's footer** → link back to rajanna.dev. You own both; a link
      between two real sites in the same subject area is genuinely useful signal.
- [ ] Your **email signature** and your **résumé PDF**.

Do not buy links, do not submit to directories, do not write guest posts. For a
portfolio, none of it pays back.

### 3.5 Verify email is working

The site publishes `hello@rajanna.dev` in the footer, the contact section, the
`Person` entity, and `/llms.txt`. It needs to actually receive:

- [ ] Cloudflare → Email → Email Routing → `hello@rajanna.dev` → your Gmail
- [ ] Catch-all on, so nothing to `@rajanna.dev` ever bounces
- [ ] Gmail → Settings → Accounts → **Send mail as** `hello@rajanna.dev`, set as
      default (replying from a gmail.com address undercuts the whole impression)
- [ ] Send a test from an outside address, and reply to it

---

## Part 4 — Known gaps

Two real ones, both content, both yours:

1. ~~The résumé PDF does not exist.~~ **Fixed** — `public/rajanna-adeli-resume.pdf`
   is now in place, so the footer link and the `/cv` and `/resume` shortlinks all
   resolve.
2. **No per-case `og:image` alt.** Per-case alt needs `generateImageMetadata`,
   which introduces a `[__metadata_id__]` route segment that `output: "export"`
   cannot resolve. Traded away for a working static export; only screen readers
   on social platforms ever read it.

Removed as part of this pass, because they must not ship to a live site:
the visible `[Draft — pending approval]` label beside the FAQ heading, and the
`[TBD — country label]` marker in the testimonial attribution.

---

## Part 5 — Maintenance

**When you add a case:**

1. Write `cases/<slug>/<slug>.md` with a `# Name — descriptor` heading (the
   descriptor becomes the `<title>` and the OG subtitle).
2. Add the slug to `CASE_ORDER`, `NAME`, `ACCENT`, `CATEGORY` in `lib/content.ts`.
3. Add an entry to `CASE_SEO` in `lib/seo.ts` — dates, schema type, keywords.
4. Add a tile config to `CFG` in `app/work/page.tsx`.
5. `pnpm build && pnpm seo:check` — the sitemap, OG image, JSON-LD and llms.txt
   all follow automatically.

**Quarterly, 10 minutes:**

- [ ] `pnpm seo:check https://rajanna.dev` → 0 failures
- [ ] Search Console → Coverage: no new errors; Performance: still #1 for your name
- [ ] Lighthouse against the live URL, not localhost
- [ ] Confirm the RosterBay demo is still up — a dead link from your best case
      hurts more than any meta tag helps

**Realistic timeline.** Indexed within a week of requesting it. Ranking first for
"Rajanna Adeli" within two to six weeks, faster once the three profile backlinks
are live. Everything else is a bonus.
