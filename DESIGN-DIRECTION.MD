# RAJANNA.DEV — DESIGN DIRECTION
*Replaces §6 of the Master Brief. Derived from analysis of the reference screenshots — design philosophy and system, not replication. Every value here is a decision, not a suggestion.*

---

## 1. What the reference actually does (extracted principles)

1. **True black canvas, not dark grey.** Cards float on black as barely-lighter planes. Depth comes from surface lift + huge radii, not shadows.
2. **Display type is the hero element.** Numbers and headings run 120–220px. Type *is* the layout; images support it.
3. **Multi-accent punctuation.** Not one brand color — a small set (orange, violet, pink, lime) used as isolated hits on an otherwise monochrome page. Each accent appears once or twice per viewport, never as a wash.
4. **Generous voids.** Sections breathe hard. Empty space is the primary luxury signal.
5. **Persistent floating chrome.** A pill nav floating at top-center; a persistent CTA pill bottom-right. Both detached from the page, always reachable.
6. **Screenshots live inside device chrome**, angled or bled off-canvas, never floating raw.
7. **Bento-varied card grid** — cards of different sizes in one section, large radii, thin borders, content-driven heights.

---

## 2. Color system

```css
/* Canvas & surfaces */
--black:        #000000;   /* page canvas — true black */
--surface-1:    #0C0C0E;   /* cards */
--surface-2:    #141418;   /* raised / hover */
--surface-3:    #1C1C21;   /* popovers, nav pill, inputs */
--border:       rgba(255,255,255,0.07);
--border-hover: rgba(255,255,255,0.14);

/* Text */
--text:         #FFFFFF;
--text-muted:   #8A8A93;   /* body copy on black */
--text-dim:     #55555E;   /* labels, meta */

/* Accents — punctuation only, never backgrounds for large areas */
--accent-orange: #FF4A1C;  /* primary CTA, links */
--accent-violet: #7B5CFF;  /* floating CTA, secondary emphasis */
--accent-pink:   #FF3D8B;  /* tertiary */
--accent-lime:   #D8FF4A;  /* tertiary */
```

**Accent discipline (binding):** orange = primary action (nav Contact, main CTAs). Violet = the persistent floating CTA and one emphasis moment per page. Pink and lime are *case-identity* colors only. **Max two accent colors visible in any one viewport.**

**Per-case accent** — each case study page gets one accent used for its chips, links, and hover states:
`rosterbay: violet · whitefleet: orange · gad-builder: lime · docfort: pink · planit: violet · dilpos: orange`

---

## 3. Typography

**Families (all free, self-hosted via `next/font/local`):**
- **Display — General Sans** (Fontshare) — geometric grotesque, wide apertures; the closest free match to the reference's character. *Alternate if it feels off: Satoshi.*
- **Body — Inter** — everything under 24px.
- **Numerals/labels — JetBrains Mono** — stat figures, meta chips, micro-labels, tech-stack lists.

**Scale (fluid, `clamp()`):**
```
--fs-mega:    clamp(72px, 13vw, 220px);  /* stat numbers only */
--fs-display: clamp(48px, 7.5vw, 128px); /* hero + section headings */
--fs-h2:      clamp(32px, 4vw, 64px);
--fs-h3:      clamp(22px, 2.2vw, 32px);
--fs-body-lg: clamp(17px, 1.3vw, 21px);  /* intro paragraphs */
--fs-body:    16px;
--fs-meta:    13px;   /* mono, uppercase, tracking 0.08em */
```
**Rules:** display tracking `-0.03em`, weight 500–600 (never 800 — the reference reads light-but-huge). Body line-height 1.6 in `--text-muted`. Mono meta always uppercase with wide tracking. Measure capped at 62ch.

---

## 4. Space, shape, motion

- **Radii:** cards `28px` · media frames `20px` · small elements `12px` · all buttons and pills `999px`.
- **Section rhythm:** vertical padding `clamp(96px, 14vh, 220px)`. Content max-width `1320px`; full-bleed allowed for media.
- **Grid:** 12-col desktop / 6 tablet / 4 mobile, gutter 24px. Bento sections use deliberate asymmetry (7/5, 8/4) — never a uniform 3×2.
- **Borders over shadows.** One hairline border; shadows only under floating chrome.

**Motion vocabulary (final):**
| Effect | Where | Spec |
|---|---|---|
| Lenis smooth scroll | global | `lerp 0.09`, duration 1.1, no infinite scroll |
| Section reveal | every section | GSAP ScrollTrigger, `y: 40 → 0`, opacity, 0.7s `power3.out`, stagger 0.06 |
| Text mask reveal | section headings + hero | line-by-line clip reveal, stagger 0.08 |
| Count-up | stat row | 1.2s ease-out, triggered once at 60% viewport |
| Sticky stacking | Selected Work cards | cards pin and stack with scale-down on the outgoing card |
| Magnetic buttons | desktop CTAs only | translate ≤6px toward cursor, spring back |
| Marquee | tech stack strip | continuous, pauses on hover |
| Page transition | home ↔ case | overlay wipe ≤450ms, scroll restored to top |
| Image parallax | case media | ≤8% translate inside frame on scroll |
| Hero roster animation | hero only | **DOM/SVG + GSAP timeline** — bars drawing on a time axis, now-line ticking, avatar chip landing. Never video. ≤12KB |

**Reduced-motion:** everything above collapses to static; Lenis disabled; content fully visible at rest.

---

## 5. Signature components

1. **Floating pill nav** — top-center, `--surface-3` at 80% + `backdrop-blur(16px)`, radius 999. Items: Work · About · FAQ · **Contact** (orange pill inside the pill). Hides on scroll-down, returns on scroll-up.
2. **Persistent floating CTA** — bottom-right violet pill: *"Open the live demo ↗"* on home; on case pages it becomes *"View live"* where a live link exists, else *"Hire me ↗"*. Never overlaps the footer (fades out at footer intersection).
3. **Stat block** — `--fs-mega` mono numeral, one-line muted descriptor beneath, on `--surface-1` cards in a bento arrangement. The "1 live product you can open right now" card is the largest and carries the violet accent + a link.
4. **Device frame** — a single reusable component rendering a screenshot inside minimal browser chrome (three dots + URL bar showing the real domain) or phone chrome. Optional `angle` prop (≤6° rotate + perspective) and `bleed` prop for off-canvas overflow.
5. **Marquee strip** — mono uppercase tech list, hairline borders top and bottom.
6. **Case card (Selected Work)** — large radius, screenshot bleeding to one edge, title in display size, per-case accent on the hover state, mono meta row.

---

## 6. Image manifest schema *(one `images.json` per case folder)*

Every `cases/<slug>/` gets an `images.json` so build tooling never guesses which screenshot goes where.

```json
{
  "slug": "rosterbay",
  "displayName": "RosterBay",
  "accent": "violet",
  "images": [
    {
      "file": "01-roster-day-view",
      "formats": ["avif", "webp"],
      "width": 2400,
      "height": 1500,
      "rank": 1,
      "shortlisted": true,
      "theme": "dark",
      "frame": "browser",
      "url": "rosterbay.com/app/roster",
      "alt": "Weekly roster grid with shifts drawn proportionally on a time axis",
      "caption": "The week, drawn to scale — night shifts wrap past midnight.",
      "contains": "Roster day view: time axis, site rows, shift bars, now-line, coverage ribbon",
      "bestUsedFor": "hero",
      "proves": "Bespoke scheduling UI; time-as-space thinking",
      "placement": "auto"
    }
  ]
}
```

**Field rules:** `rank` 1 = strongest. `shortlisted: true` only for the 5–8 that display; the rest stay `false` (extras bucket). `bestUsedFor` ∈ `hero | featured | inline-proof | gallery | comparison | mobile-pair`. `frame` ∈ `browser | phone | none`. `proves` states what a viewer should conclude — it drives placement next to the matching claim. `placement` names a case-study section slug, or `auto`.

---

## 7. Anti-goals

No stock illustration. No emoji as UI. No gradient text. No glassmorphism beyond the two floating chrome elements. No carousels. No parallax exceeding 8%. No animation that delays reading. No section that exists only to hold an effect. **No claim on this site that isn't verifiable.**