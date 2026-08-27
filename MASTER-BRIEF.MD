# RAJANNA.DEV — MASTER PORTFOLIO BRIEF
*Source of truth for content, positioning, structure, and voice. **All visual and motion decisions live in `portfolio-design-direction.md` — that file governs design; this one governs substance.** Not a build prompt; attach both to every build prompt. Items marked `[TBD]` are still open — never invent them.*

*Revision 2 — all previously open decisions resolved.*

---

## 1. What this site is for

**One job:** convert a skeptical visitor into a click on RosterBay or a message within 60 seconds — while surviving a five-minute deep read from a technical evaluator.

**Who visits, in priority order:**
1. **Upwork prospects** (AU/US/UK agency and SMB owners, mostly non-technical) arriving from a proposal. Asking: *is this person real, does he understand my kind of business, can I trust him with $3–15k?*
2. **Recruiters / hiring managers** arriving from the resume. Asking: *is the skill real, is the story coherent?*
3. **Technical evaluators** (a client's developer friend, an interview panel). Asking: *are the decisions sound?*

**Conversion hierarchy (strict):** ① Open the RosterBay live demo → ② Message via Upwork → ③ Email → ④ Read another case study. Every section resolves to one of these. No newsletter, no calendar embed, no chatbot.

**The strategic bet:** with no enterprise logos or usage stats, *the site itself is the proof*. Presentation quality and case-study depth do the job testimonial walls do for agencies — while staying radically performant, because a janky "creative" portfolio from a developer claiming performance expertise refutes itself.

---

## 2. The person

- **Name:** Rajanna Adeli — used everywhere professionally (GitHub, Upwork, LinkedIn, resume)
- **Location:** Pune, India · works with AU/US/UK clients · AEST + US-morning overlap
- **Identity mark:** **monogram** (no photograph) — the "RA" lockup, used in nav, About, and OG images
- **Contact:** hello@rajanna.dev · phone never published
- **Links:**
  - Upwork — `https://www.upwork.com/freelancers/~01e368e57669434d77`
  - LinkedIn — `https://www.linkedin.com/in/rajannaadeli/`
  - GitHub — `https://github.com/rajannaadeli`
  - Resume PDF — `/rajanna-adeli-resume.pdf` (downloadable from the site)

**Professional arc (public version — all verifiable):**
- **Software Developer — Tata Consultancy Services** (Dec 2025 – present): enterprise platform engineering (ServiceNow / JavaScript) for a global energy client — HR service delivery, service catalog, integrations.
- **Full-Stack Developer, core engineer — Bithook, Pune** (Mar – Dec 2025): early-stage startup; core engineer on two production SaaS products (lemonsoft.in, upipe.tech); owned architecture, low-level design, UI/UX, and deployment.
- **Independent full-stack developer** (2023 – present): international freelance — a 5-month product engagement for an overseas client (OMAC), a multi-tenant workforce platform for an Australian labour-hire company, a production retail POS, a ride-booking product for an Indian transport client.
- **Education:** B.Tech Computer Science & Engineering, SVERI's College of Engineering, Pandharpur — **2025**, CGPA 9.0/10

**Human details for About (exactly these two, kept light):** an interest in space; an interest in anime.

**Positioning line (hero headline material):**
> I build workforce and operations software for businesses that run on deskless teams — rostering, GPS time-tracking, compliance, and the field apps that drive them.

**Stat row (confirmed — every number defensible):**
`3+ years building software` · `8 products shipped to production` · `Clients in 3 countries` · `1 live product you can open right now`
The fourth is the signature stat: visually largest, clickable, opens RosterBay.

---

## 3. What he sells

**Service menu (narrow on purpose):** Rostering & shift-scheduling systems · GPS time & attendance · Certification and compliance tracking · Multi-tenant SaaS platforms · React Native field apps · Realtime operations dashboards.

**Engagement models:** Fixed-price project with milestones (primary) · Ongoing retainer · Paid discovery session.
**Pricing: not shown publicly.** No figures, no ranges, no "from $X" anywhere on the site.

**Working-style claims (all true, all usable in copy):** fixed-price so cost is known upfront · AI-accelerated delivery with quality guardrails (typed code, tests on core logic, review discipline) · AEST/US-friendly overlap · written communication, no surprises.

**FAQ — 6–8 items, answers polished during build:** how projects are priced (approach, not numbers) · timezone overlap · *do you use AI?* (yes — confidently, with the guardrails; it's the speed advantage) · maintenance after delivery · working inside an existing codebase · typical timeline (RosterBay-scale ≈ 6 weeks part-time — full-time is faster) · how to start.

---

## 4. Content inventory — the six cases

Source of truth per case: `cases/<slug>/<slug>.md`, `cases/<slug>/images.json`, `cases/<slug>/ui/` (AVIF + WebP; 5–8 shortlisted for display, remainder an extras bucket).

| Slug | Public name | What it is | Role on site |
|---|---|---|---|
| `rosterbay` | **RosterBay** | Live workforce-operations platform (rosterbay.com) | **Hero case** — featured full-width, first position, links to the live demo |
| `whitefleet` | **WhiteFleet** | Multi-tenant workforce platform built for an Australian labour-hire company | Second — proves paid client work in the same vertical |
| `gad-builder` | **GAD Builder** | Parametric engineering-drawing customization platform | Complex-systems credibility |
| `docfort` | **DocFort** | Engineering document control — versioning, approval workflows, bulk import | Compliance/workflow credibility |
| `planit` | **PlanIt** | Constraint-based scheduling engine (weekly timetables) | Algorithmic credibility — rostering's cousin |
| `dilpos` | **DilPOS** | Production retail POS & inventory system | Business-operations credibility |

**Case page composition:** facts strip (role · timeline · stack · status · links) → proof chips → rendered markdown body → shortlisted screenshots placed per `images.json` → prev/next navigation → persistent CTA.

**Anonymity and honesty rules (binding):** WhiteFleet and DilPOS never name the client — "an Australian labour-hire company", "a retail business". No case claims users, revenue, or traction that doesn't exist. RosterBay is always presented as a demonstration platform, proudly and plainly.

**Testimonial — one, real, confirmed.** Presented as a full-width pull-quote moment, not a card in a grid, and not labelled "Testimonials" (a single card under that heading reads as a gap):

> "Working with him was a great experience. He handled both the front-end and back-end of our project really well and quickly got familiar with our tech stack. His code was clean and well-structured, and he was easy to communicate with throughout the project. He was reliable, met deadlines, and understood what we needed without much back and forth. I'd definitely be happy to work with him again."

Attribution: `Client · OMAC engagement` `[TBD — confirm country/label Rajanna is comfortable publishing]`. No second testimonial is being pursued.

---

## 5. Voice

First person singular — the site says "I", never "we". Plain, confident, specific. Numbers over adjectives; concrete nouns over abstractions. **Banned:** leverage, seamless, robust, cutting-edge, empower, journey, delve, "isn't just X — it's Y", exclamation marks. Scale honesty everywhere: a project used by one business, described precisely, reads as craft; the same project wrapped in growth language reads as a lie.

---

## 6. Design & motion

**All visual, typographic, and motion decisions are governed by `portfolio-design-direction.md`.** That document is authoritative for palette, type system, scale, spacing, radii, signature components, motion vocabulary, the image-manifest schema, and the anti-goals list. Nothing about design is duplicated here — where the two documents appear to conflict on a visual matter, the design direction wins.

Two design-adjacent decisions recorded here because they are content decisions:
- **Hero animation: kept**, built as DOM/SVG + GSAP (a roster assembling on a time axis). Never video.
- **Custom cursor: cut. 3D / React Three Fiber: cut.**

---

## 7. Site architecture

**Home (single scroll):**
1. **Hero** — positioning headline, availability badge, stat row (count-up), CTA pair (*Open the live demo* / *Hire me on Upwork*), the roster hero animation
2. **Featured case** — RosterBay, full-width
3. **Selected work** — the remaining five as stacking/reveal cards → case pages
4. **What I build** — the service menu
5. **How I work** — engagement models + working-style claims (no pricing)
6. **Testimonial** — the OMAC pull-quote, full-width
7. **About** — monogram, four-sentence arc, the two human details
8. **FAQ** — accordion, 6–8 items
9. **Contact** — contact form + email, plus Upwork / LinkedIn / GitHub

**Footer:** email, Upwork, LinkedIn, GitHub, resume PDF, copyright. "Built with Next.js — Lighthouse 100" ships *only if the score is genuinely 100 at launch*.

**Case pages:** `/work/<slug>` — one template, per-case accent per the design direction. `/work` — index grid.

**Also ships:** OG images (site + per-case), sitemap, robots, Person + CreativeWork schema, 404 with personality, resume PDF at `/rajanna-adeli-resume.pdf`.

---

## 8. Technical foundation

**Stack (locked):** Next.js (App Router, **every route statically generated**) · TypeScript strict · Tailwind · Framer Motion (component-level) · GSAP + ScrollTrigger (scroll choreography) · Lenis (smooth scroll) · Vercel.
**Content pipeline:** `cases/*.md` parsed at build with gray-matter; images driven by `images.json` per case; screenshots served through `next/image` (AVIF, WebP fallback).
**Contact form:** serverless route + Resend (free tier) — **no database**, no CMS, no auth.

**Performance budget (hard — the strategic bet depends on it):**
- LCP < 2.5s simulated 4G · CLS ≈ 0 · initial JS ≤ 250KB gzipped
- 60fps scroll on a mid-range Windows laptop; animate `transform` and `opacity` only
- Images: exact `sizes`, blur placeholders, lazy below the fold, `priority` on the hero image only — the single biggest lever on a screenshot-driven site
- Fonts self-hosted and subset via `next/font/local`
- GSAP and Lenis code-split, client-only, initialized after first paint
- Lighthouse ≥ 95 across all categories before ship

---

## 9. Remaining open items

- [ ] Testimonial attribution label — how the OMAC client may be identified
- [ ] Final FAQ answers (drafted during build, approved by Rajanna)
- [ ] Availability badge wording at launch (e.g. "Available for projects")
- [ ] Confirm `images.json` manifests complete for all six cases (`alt`, `caption`, `proves`, `bestUsedFor` are human-written — never generated)

*Everything else previously open is now decided and reflected above.*