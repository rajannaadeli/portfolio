# GAD Builder

A drawing-customization tool built for LHP Motors in Solapur, so their engineers could assemble a general arrangement drawing by picking components instead of redrawing one by one.

`Role: Sole developer · Timeline: 2023–2024 (~1 year) · Stack: React 19, Express, MongoDB, SVGO, Electron · Status: In production · [Repo](https://github.com/rajannaadeli/GAD-Builder-Up)`

- **In production at LHP Motors Solapur, used by 200+ engineers in daily work**
- **Cut drawing-customization time by roughly 60–70%**
- **SHA-256 fingerprinting blocks duplicate designs · SVGO compresses drawing files on upload**

---

## Where this came from

A general arrangement drawing is the master layout of a machine — a motor, a crane, the big things LHP builds. Every order is a little different, so every drawing gets customized. The old way was manual. An engineer opened the base drawing and swapped components by hand, one at a time, checking each change against the ones before it.

The catch is the number of components. There are more than a thousand of them, with options stacked on options, and a real drawing pulls together dozens. Customizing one drawing meant hours of careful, repetitive edits. Get one component wrong and the ones depending on it are wrong too.

LHP asked for something better. The pitch I made was simple to say and hard to build: put every component into a library, let a designer pick from it, and let the drawing assemble itself. Choose, test, validate, finalize — in a handful of clicks instead of an afternoon. From a fixed set of parts, an engineer could then produce an enormous number of valid combinations without drawing anything from scratch.

## The three things that made it hard

**Components depend on each other.** Change one and a chain of others has to change with it. Mapping those relationships — and then showing them in a UI a busy engineer could actually follow — was the core problem, not a side quest.

**No two designs should ever be the same.** With that many combinations, redundant duplicates were a real risk, and a duplicate drawing in a production catalog is worse than useless.

**It had to stay fast.** One design isn't one file. It's a base drawing plus every selected component's SVG, and those add up quickly. Slow rendering would have killed the whole point of doing this on the fly.

> [SCREENSHOT: the editor with the component side-menu open next to a live drawing — establishes what "customize on the go" actually looks like]

## The build

### Modeling dependencies as parent-child levels

The situation: a flat list of a thousand components with hidden relationships between them. If I stored them flat, every dependency check becomes a search across everything.

The decision: separate components into levels and give them an explicit parent-child structure. A selection isn't a single value — it's a path, like `component.selectedOption.nestedOption`, walked recursively. The [ComponentTracker](server/src/utils/ComponentTracker.ts) extracts every selected path from a design and knows which ones are nested inside which.

Why this way: I rejected the flat approach because dependency logic would have been scattered everywhere. With a tree, "what depends on this" is just "what sits under this path" — a `startsWith` check on the path string, nothing more.

What it produced: a locking system. When a design is finalized, its selection paths get snapshotted. After that, the parts that define the original design are locked — you can't quietly edit or delete a component the drawing depends on, but you can still change everything that's genuinely optional. The rules live in [getComponentLockStatus](server/src/utils/ComponentTracker.ts#L90).

> [SCREENSHOT: a locked component in the UI showing the "part of the original design" state — proves the dependency rules are enforced, not just tracked]

### A fingerprint that makes duplicates impossible

The situation: two engineers, working separately, pick the same components. Without a guard, that's two identical drawings in the catalog.

The decision: fingerprint each design by its content. I take every selected component's file path plus the base drawing's pages, sort them so order can't matter, join them into one string, and run SHA-256 over it. That gives a 64-character hash. The hash goes on the design; a second design with the same combination produces the exact same hash, and the system refuses it. The code lives in [hash.ts](client/src/features/editor/utils/hash.ts).

Why this way: I tried a few approaches before this stuck. An earlier home-grown hash function is still sitting in the tracker, commented as "in production, use a proper hash library" — that note is me, reminding me the naive version wasn't enough. Content-addressing was the thing that worked exactly how the requirement wanted: same parts in, same identity out, every time.

What it produced: duplicate designs became structurally impossible rather than something a person had to catch.

> [SCREENSHOT: the duplicate-detection message an engineer sees when a combination already exists — the payoff of content hashing]

### Squeezing the drawing files

The situation: SVG exports from CAD tools are bloated. A single component could land around 50KB, and a design stacks many of them.

The decision: run every uploaded SVG through SVGO on the server before it's ever stored, in an upload [middleware](server/src/middleware/optimizeSVG.middleware.ts) that sits in the request path. I kept `removeViewBox` and `removeDimensions` off on purpose — strip those and the drawings scale wrong, which for engineering drawings is the whole ballgame.

What it produced: files that were a fraction of their original size, so a design assembled from dozens of them still loaded quickly. On the client I paired that with the usual React discipline — memoization, careful lifecycle handling, trimming server round-trips — and added indexing on the database side.

> [SCREENSHOT: a network panel or file listing showing optimized SVG sizes — the compression claim, made concrete]

## Under the hood

Three surfaces share one codebase. The web client is React 19 with Vite, Zustand for state, and Radix primitives for the UI. The API is Express and TypeScript on MongoDB through Mongoose, with JWT-and-bcrypt auth and Multer for the drawing uploads. There's also an Electron desktop build, which quietly swaps to a `HashRouter` when it detects it's running from the file system, so the same app works offline on an engineer's machine. Data is multi-tenant, organized around five models — organization, project, design, revision, user — with designs carrying a `sourceDesign` and `derivedDesigns` so you can trace where a drawing came from. It's deployed on Railway via Docker.

> [DIAGRAM: client / Express API / MongoDB, with the Electron desktop build as a fourth surface hanging off the client — shows the shared-codebase, three-surface shape]

## What shipped

It went into production at LHP Motors and, by the counts I have, 200-plus engineers use it in their day-to-day work. The task it was built for — customizing a general arrangement drawing — got 60–70% faster. That's the honest headline: a bespoke tool, doing one hard job well, for one company that needed it.

## Looking back

The part I'm proudest of isn't a feature — it's that I built the whole thing solo, back when I couldn't lean on an AI assistant to reason through the architecture for me. Every dependency model and data structure came out of my own head, and being that specific to LHP's process sharpened me in ways a generic project wouldn't have.

If I'm honest about what I'd change: the hardest stretch wasn't any of the algorithms — it was that some engineers just couldn't use the first versions the way I intended. That stung, because the logic was right and the tool still failed the people holding it. I revised the UI over and over until it got genuinely easy. I should have watched real engineers use an early build far sooner instead of trusting that a correct system would feel usable. It doesn't. You have to go check.

---

## GAPS

- [ ] **Usage numbers unverifiable in code.** "200+ engineers" and "60–70% time reduction" are your figures — true story facts, but nothing in the repo confirms them. Keep them only if you're confident.
- [ ] **"Compressed to at most 5000 chars" claim.** The code hashes a joined string of component file paths directly with SHA-256; I don't see an explicit compression-to-5000-chars step before hashing. If there was one, it's not in the files I read — otherwise reword this in your own retelling so it matches what the code does.
- [ ] **SVG "50KB → under 1KB" ratio.** SVGO is confirmed in the upload middleware, but the exact before/after sizes aren't something I can verify. Capture a real example (see shot list) to back the number, or soften it.
- [ ] **"More than 1000 components/options" is unverified.** Plausible and it's your domain knowledge, but there's no seed data or catalog in the repo to confirm the count.
- [ ] **Stale `docker-compose.yml`.** It references `./frontend` and `./backend`, but the actual directories are `client` and `server`, and `railway.json` points at `backend/Dockerfile`. The real deploy path looks like Railway using the server Dockerfile — worth cleaning up, and worth knowing before anyone tries `docker-compose up`.
- [ ] **Duplicate `ComponentTracker` logic** exists in both `client/src/features/editor/utils/` and `server/src/utils/`. Intentional shared logic, or drift? Not a case-study issue, just flagging.
- [ ] **HARDEST STRETCH note was cut off** ("the most hardest stretch was when i was") — I inferred it continued into the UI-usability point that follows. Confirm that's the moment you meant.
- [ ] **No live demo or video.** Only the repo link. The screenshots below are the only visual evidence available — worth capturing them well.
- [ ] **"LHP Motors" full name / branding.** Confirm exact company name spelling and whether they're okay being named publicly in a portfolio piece.

## CAPTURE LIST

1. The editor with the component side-menu open next to a live drawing — establishes what "customize on the go" looks like.
2. A locked component in the UI showing the "part of the original design" state — proves dependency rules are enforced.
3. The duplicate-detection message an engineer sees when a combination already exists — the payoff of content hashing.
4. A network panel or file listing showing optimized SVG sizes (ideally a real before/after) — makes the compression claim concrete.
5. Architecture diagram: client / Express API / MongoDB, with the Electron desktop build as a fourth surface — the three-surface shape.

---

*Read budget: 6 files read in full (server & client `package.json`, `design.model.ts`, `ComponentTracker.ts`, `optimizeSVG.middleware.ts`, `hash.ts`), plus directory listings and targeted greps for orientation. Well under the 15-file cap.*
