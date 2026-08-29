# DECISIONS.md

## Phase 3 — Home page final pass

- **Mega numerals use the display face** (amends design-direction §3). At mega scale the display grotesque reads better and matches the reference; mono is retained for meta labels, tech strips, and eyebrows. The `--text-mega` token weight/tracking are unchanged.
- **Parallax translates the whole frame, not the image inside it.** Image-inside-frame parallax necessarily overscans and cropped RosterBay's left sidebar. The featured screenshot now renders as a whole frame (media box aspect-ratio = source ratio → no crop) and the entire frame drifts ≤8% within the section's padding, so nothing is ever cut through UI chrome or clipped at an edge (§1.2/§5).
- **Work rows use a fixed 16:10 slot.** Ratios vary wildly (whitefleet phone 0.45, planit portrait 0.65, others ~1.9). A landscape shot fills the slot; a phone/portrait shot is composed centred on a soft accent-tinted panel. Representative-image rule: keep a rank-1 phone shot (composed), but swap a rank-1 *portrait web* capture (PlanIt) for its best landscape shortlisted image, since a shrunk full-page capture reads poorly. All five rows are now the same height (≤1× variance, well under the 1.4× ceiling).
- **Scroll spine sits above band backgrounds, not behind them.** The spec says "behind content," but the light bands are full-bleed opaque paper that would occlude a gutter element beneath them. The spine is `z-30` (above bands, below nav/CTA), `pointer-events-none`, confined to the left gutter, and band-aware via the shared `useActiveBand()` — so it's always visible and never occludes interactive content.
- **Spine section-name label is gated to ≥1536px (2xl).** At 1280–1440 the centred 1320px column leaves a thin gutter; the horizontal label overlapped left-aligned work-row text. The spine line, nodes, and now-marker still render at ≥1280; only the text label waits for a genuinely wide gutter. Below 1280 the spine is replaced by a top 2px progress line.
- **`useActiveBand()` extracted** as the single band-detection source of truth, consumed by both the nav and the spine.

## RosterBay dark-theme wiring

- **`dark-ui/case-images.json` kept as a separate manifest** (per instruction) — not merged into the main manifest. The content pipeline reads it in place via `readDarkImages(slug)` when `cases/<slug>/dark-ui/case-images.json` exists, using that file's own metadata (width/height inline, altText, description, suggestedUse). Only RosterBay has one today; every other case cleanly falls back to its light set.
- **Dark images are a parallel set on `CaseStudy.darkImages`**, served from `public/cases/<slug>/dark/` (prebuild copies `dark-ui/*` there). `getShortlisted(slug, theme)` and `getImageByUse(slug, use, theme)` gained a `theme` param (default `light`).
- **Dark UI is used wherever RosterBay sits on the dark band:** the home featured case (dark hero screenshot) and the RosterBay case page (all 7 dark shortlisted). This resolves the Phase 2 flag — the light screenshots no longer sit as bright rectangles on black. Existing AVIF/WebP binaries were reused as-is (verified, not regenerated); dark LQIP placeholders were generated into `blur.json` under the `rosterbay/dark/` namespace. `suggestedUse` map extended for the dark vocabulary (`before-after`→comparison, `mobile-showcase`→mobile-pair).

## Phase 2 — Composition, theme bands & motion

- **Light band is a token scope, not a second Tailwind theme.** `.band-light` redeclares the semantic `--color-*` variables (paper `#F7F6F3`, ink `#101014`, ink-muted `#5A5A63`, white cards, hairline `#E4E2DD`). Because Phase 1 utilities compile to `var(--color-*)`, every primitive (Button, Card, Chip, MetaLabel, Prose, DeviceFrame) adapts automatically inside the scope with no per-component work.
- **Accents fail AA as text on paper, so `--accent-text` was introduced.** On `#F7F6F3` the vivid accents are all < 4.5:1 as text (orange 3.11, violet 3.64, pink 3.09, lime 1.06). New semantic var `--accent-text` = the vivid accent on the dark band, and an AA-safe darkened variant on paper: orange `#C23A15`, violet `#5B3FD6`, pink `#C71E63`, lime→olive `#5F6B00` (all ≥4.9:1 on paper). `MetaLabel accent` and all light-band eyebrows/links use `--accent-text`; the vivid accent stays for decoration (dots, halos, borders). Light-band dim is `#6B6B73` (4.9:1). This keeps the design's "accent on eyebrow and link" intent while passing AA. Vivid accents are unchanged as decoration.
- **Case ledes rewritten in the source markdown** (one plain voice, ≤1 em-dash), which is the single source, so it also updates each case page's subtitle and its `<meta description>`. No new claims introduced.
- **RosterBay imagery is still light-UI.** The `[RAJANNA ACTION]` dark-theme recapture has not landed, so the featured case uses the current light screenshot inside the dark band (violet halo + bezel mediate it, no brightness filter). Flagged in the report; swap when dark captures arrive.
- **Contact endpoint calls the Resend REST API via `fetch`, no SDK dependency.** Honeypot (`company`) + validation. With `RESEND_API_KEY` unset it returns an honest 503 ("email isn't configured yet, email me directly") rather than pretending to send. Needs env: `RESEND_API_KEY`, optional `CONTACT_TO` / `CONTACT_FROM` (verified sender).
- **Reveals use `gsap.from` (content visible at rest).** Before GSAP's lazy chunk loads, and under reduced-motion / no-JS, everything is in final visible state; the hidden "from" state is applied only once GSAP runs, then animates back. Accepted tradeoff: a brief first-load settle in exchange for content that never depends on JS to be visible (protects LCP, reduced-motion, and no-JS). GSAP library stays code-split (68KB lazy chunk, absent from initial JS).
- **Display font swap left in place.** `app/fonts.ts` now points the display face at a user-supplied `public/fonts/out-sans.ttf`; kept per instruction (build passes, same `--font-general-sans` variable downstream).

# DECISIONS.md — Phase 1

Ambiguity resolutions, logged as required by the build prompt. Newest at top.

## Accessibility vs. design tokens

- **`--text-dim` darkened from the spec value.** Design direction §2 sets `--text-dim: #55555E`. On the true-black canvas that is 2.85:1 — it fails WCAG AA (4.5:1) for the 13px mono meta text it styles, which Lighthouse flags and would cap the accessibility score below the binding ≥95. Precedence (this prompt's performance/Lighthouse budget > design direction) resolves it in favor of accessibility: `--text-dim` is now `#7A7A85` (4.95:1), still clearly dimmer than `--text-muted` (#8A8A93, 6.14:1). The four accents pass ≥4.5:1 on black (orange 6.25, pink 6.29, lime 18.3). Violet was additionally nudged from the spec `#7B5CFF` to `#8267FF` because accent meta labels also sit on `--surface-1` cards (#0C0C0E), where `#7B5CFF` was 4.48:1 (fail); `#8267FF` is 4.96:1 on surface-1 / 5.33:1 on black — visually indistinguishable, AA-clean everywhere.

## Content pipeline

- **Internal production notes stripped from case bodies.** Every `<slug>.md` ends with `## GAPS` (author queries to Rajanna — e.g. "confirm the real number", "multi-tenancy claim vs code") and `## CAPTURE LIST` (screenshot shot lists). These are not publishable content and contain internal uncertainty; publishing them would also violate the "no unverifiable claim" rule. The parser truncates the rendered body at the first heading matching `GAPS|CAPTURE LIST|CAPTURE|OPEN QUESTIONS|NOTES|TODO` and flags it per case in `warnings`. (This also removed the GFM task-list checkboxes those sections produced, which were failing the Lighthouse `label` audit.)

- **No YAML frontmatter exists.** None of the six `<slug>.md` files have frontmatter. All metadata (role, timeline, stack, status, links) lives in the body as a "facts line" (line 5 in each file). The `CaseStudy` type is therefore normalized in code from parsed body content, not from frontmatter. Per-file normalization results are reported in the build report.
- **Facts line comes in two shapes**, both handled by the normalizer:
  - *Labeled* (`**Role:** … · **Timeline:** … · **Stack:** … · **Status:** … · **Links:** …`) — rosterbay, docfort; and backtick-labeled (`` `Role: … · Timeline: … · …` ``) — gad, dilpos. Parsed by accumulating `·`-segments under the last seen label.
  - *Unlabeled positional* (`` `Sole developer · Jan–Jun 2026 · <stack…> · <status> · [Repo]` ``) — whitefleet, planit. Parsed by classifying each `·`-segment (link → links, date/duration → timeline, "developer/solo/full-stack" → role, "production/pilot/live/demo" → status, remainder → stack).
- **Proof chips** are extracted from the region between the facts line and the first `## ` heading: markdown list items, or standalone `**bold**` / `` `code` `` spans split on `·`. Bold/backtick markers are stripped to plain chip text.
- **Body rendering** begins at the first `## ` heading. The H1, subtitle (lede), facts line, chips, and separator `---` are consumed by the normalizer and rendered by dedicated components, not by the markdown-to-HTML pass, to avoid duplication.
- **`> [SCREENSHOT: …]` markers** embedded in the body are placement hints authored for a human. They are stripped before rendering so they never appear as literal blockquotes. Phase 1 places shortlisted screenshots after the body per the manifest; interleaving at these markers is a Phase 3 refinement.
- **Markdown renderer:** added `marked` (build-time only, synchronous, zero-dep). No renderer was installed; `gray-matter` alone does not render. gray-matter is still used to be robust to any future frontmatter, but currently returns empty data.

## Images

- **Manifest source of truth is `case-images.json`, not `images.json`.** Each case has both. `images.json` (Aug 25) is stale — it references `ui/converted/…` paths and `fileNameBase` values that do **not** match the files actually in `ui/`. `case-images.json` (Aug 27) has `fileNameBase` values matching the real `ui/` files exactly. The pipeline reads `case-images.json` and ignores `images.json`.
- **`case-images.json` field mapping** to the design-direction §6 schema: `fileNameBase`→file, `formats{avif,webp}`→formats, `rank`, `isShortlisted`→shortlisted, `platform` (web|mobile|desktop-terminal)→frame (browser|phone|browser), `suggestedUse` (hero|feature-highlight|detail-shot|gallery)→bestUsedFor, `altText`→alt, `description`→caption/contains. Fields absent from the manifest (`url`, `proves`, `placement`, `theme`) are left empty/defaulted and listed for Rajanna. `alt`/`caption`/`proves` text is never generated.
- **Image dimensions** are not in either manifest. Captured once from the real AVIF/WebP files with macOS `sips` into a committed `lib/generated/image-dimensions.json` (77 entries, AVIF and WebP share pixel dimensions). This keeps `next build` free of any dimension-reading dependency (Vercel's Linux builder has no `sips`) and guarantees explicit width/height → zero CLS.
- **Serving strategy: `<picture>` with `<source type="image/avif">` + `<source type="image/webp">`**, not `next/image`. The screenshots are already pre-encoded as dual-format AVIF+WebP at fixed dimensions; running them back through the Image Optimization API would re-encode already-optimal assets and add a runtime service to a site whose entire thesis is "static artifact." `<picture>` gives AVIF-first + WebP fallback natively, explicit width/height, native lazy loading, and ships zero JS. This is a deliberate, documented deviation from the literal "use `next/image`" instruction in favor of its intent (AVIF-first, WebP fallback, zero CLS, blur placeholder). The hero image is marked `fetchpriority="high"` + eager; everything else lazy.
- **Image files moved into `public/`.** A prebuild step copies each `cases/<slug>/ui/*.{avif,webp}` to `public/cases/<slug>/`, so the static server serves them directly. The markdown stays where it lives (read in place); only the display binaries are copied. `_originals/` (large source PNGs) are never copied.
- **Blur placeholders:** low-quality image placeholders (LQIP) generated at author-time from the real files into `lib/generated/blur.json`, base64 inline, shortlisted images only.

## Slugs / naming

- **`gad` vs `gad-builder`.** The design direction and master brief refer to `gad-builder`; the folder, markdown, and manifest on disk use `gad` (public name "GAD Builder", manifest `case: "gad"`). The canonical route slug follows the source of truth on disk: **`gad`** (`/work/gad`). The order-fallback array and accent map are written with `gad`.
- **Per-case accents** (design direction §2): rosterbay violet · whitefleet orange · gad lime · docfort pink · planit violet · dilpos orange.
- **Case ordering:** explicit `order` field if present, else the fixed array `['rosterbay','whitefleet','gad','docfort','planit','dilpos']`.

## Fonts

- All three families self-hosted via `next/font/local`, committed under `public/fonts/` as woff2 (~23KB each): General Sans 500/600 (Fontshare), Inter 400/500, JetBrains Mono 400/500 (Fontsource CDN, latin subset). `display: swap`, exposed as `--font-display`, `--font-body`, `--font-mono`.

## Rendering / static

- No `output: 'export'`. Every route is statically prerendered via `generateStaticParams` + default static rendering; `output: export` is avoided only so nothing silently forces dynamic. No server-side data fetching at request time, no middleware.
