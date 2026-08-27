# DilPos — a multi-tenant POS for Australian corner shops

A point-of-sale and inventory system built for small AU retailers — newsagents first — where the till has to keep selling even when the internet drops.

`Role: Full-stack (1 of 3) · Timeline: 2025, ~4 months · Stack: NestJS · Prisma/PostgreSQL · React 19 · Tauri · Dexie · Status: In production with early retailers · [Repo](https://github.com/rajannaadeli/pos-system)`

**50-table multi-tenant Postgres schema** · **6 app surfaces in one monorepo** · **Offline-first till that queues sales and syncs on reconnect**

> [SCREENSHOT: The terminal till screen mid-sale, cart on one side, product grid on the other — the anchor image for the whole study.]

## Where this came from

DilPos was the MVP for an Australian startup of the same name. The pitch was narrow on purpose: sell a POS to small retailers who were tired of paying legacy vendors for barcode-list subscriptions and clunky terminals. Newsagents were the wedge — shops that deal with Lotto, newspapers, magazines, smokes, and drinks, all with their own quirks.

I came on as one of three developers and worked across the whole thing. Backend, frontend, deployment, hardware. The scope was wide for a four-month build: a desktop till app, an owner dashboard, a platform-admin console for the DilPos staff who curate product catalogs, a marketing site, an API, and a bridge to physical hardware.

By the end, around 20 shops were running it day to day. They stuck around because it was cheap, it was clean, and it didn't get in the way of a busy counter.

## The three things that made this hard

**A till screen has no room.** The terminal UI had to hold a lot — product search, a live cart, categories, payments, Lotto handling, refunds — on a small screen a cashier taps while a queue builds behind a customer. Every element had to be big enough to hit without looking and reachable without hunting.

**Hardware doesn't hold still.** Receipt printers, cash drawers, and card terminals change by brand and by firmware version. "Supports printers" is easy to say and painful to deliver.

**The internet is not a given.** A corner shop's connection drops. When it does, the till cannot stop taking money.

> [SCREENSHOT: The compact till layout on the actual screen size it targets — shows the density problem the UI had to solve.]

## The build

### Deciding the till isn't a webpage — it's an appliance

The till runs as a React app, but it ships as a Windows desktop program wrapped in Tauri, with an MSI installer and an auto-updater. I went with Tauri over Electron because the bundle is smaller and it leans on the OS webview instead of shipping a whole Chromium. For a shop machine that isn't a developer's laptop, a lighter install and a quiet self-update matter more than they sound.

The payoff: the desktop app is a thin shell over the same terminal build that runs in the browser. Most of the "desktop vs web" differences are runtime behavior, not two separate UIs to maintain.

> [SCREENSHOT: The MSI installer or the desktop app running with its own window chrome — proof it's a real installed app, not a browser tab.]

### Making hardware someone else's job — on purpose

Instead of teaching the till how to talk to every printer, I split hardware off into its own small service — a hardware bridge that runs locally and speaks to ESC/POS printers and the cash drawer over the LAN. It compiles to a standalone executable and sits next to the till.

I rejected the obvious path of bundling drivers into the desktop app. If I'd done that, every new printer model would mean a new release of the whole till. With a separate bridge, the till just sends a print request to a local address and the bridge deals with the messy part. Card payments through Linkly EFTPOS plug into the same seam. This was the hardest stretch of the project — brand and version mismatches kept breaking things — and isolating hardware behind one service is what finally made it tractable.

> [SCREENSHOT: A printed receipt next to the till, or the hardware-bridge status panel — shows the peripheral integration working.]

### Keeping the till alive offline

The terminal caches its product catalog in the browser's own database with Dexie, so lookups and barcode scans work with no network at all. Sales made while offline go into a queue. When the connection comes back, a sync service pushes them up. There's a dedicated model for that queue in the schema and a modal in the UI that shows what's still waiting to sync.

The rule I held to: losing the internet can slow a shop down, but it can never lose a sale. A scanned item checks the local cache first, falls back to an online search only if it misses, and a completed transaction is written locally before anything is sent anywhere.

> [SCREENSHOT: The offline queue modal listing pending sales waiting to sync — the clearest single image of the offline story.]

### Catalog as the product, not a barcode dump

The multi-tenant model is where most of the schema's weight sits. Every shop is an Organization with its own Stores, Registers, users, and role-based permissions. On top of that, DilPos staff curate vertical catalog packs — Lotto, newsagent, smokes, drinks — in a separate platform-admin console. A shop subscribes to a pack, adopts its items, and each item is cloned into that store's own product list with its barcode, name, GST, and preferred supplier. DilPos owns the catalog data; the shop owns its stock and prices.

That split is the actual business model. Shops aren't paying for barcodes, which are table stakes. They're paying for the curated newsagent workflows on top.

> [SCREENSHOT: The platform-admin catalog pack view alongside a store's adopted products — shows the subscribe-and-adopt flow.]

## Under the hood

One npm-workspaces monorepo, six app surfaces: the Tauri desktop till, the React terminal it wraps, an owner dashboard, the platform-admin console, a Next.js marketing site, and a shared package for types and the API client. The backend is NestJS on Prisma over PostgreSQL — a 50-model schema covering multi-tenant orgs, RBAC, sales and payments, inventory, purchase orders, catalog packs, Lotto, and a sync queue. Auth is JWT with a Role/Permission model. BullMQ on Redis handles background jobs; Socket.IO carries realtime notifications; Twilio and Nodemailer cover SMS and email. The hardware bridge is a small Express service on the side.

## What actually shipped

A working, deployed system that around 20 Australian retailers use to run their counters. The offline till, the multi-tenant catalog, the desktop installer with auto-updates, and printer/drawer integration are all live. Some pieces were still in flight at MVP — EFTPOS through Linkly was being wired in, and the subscription-billing side was on the backlog rather than done. I'd rather say that plainly than pretend the whole roadmap shipped in four months.

## Looking back

If I did it again, I'd write the offline sync tests before the sync code, not after. The offline path is exactly the kind of thing that looks fine in a demo and fails at 5pm on a Friday when a real shop's connection flaps mid-sale — and that's the one place a POS can't afford to be wrong. It worked, but I was hand-testing reconnect scenarios far later than I should have been, and a queue that holds real money deserved a safety net from day one.

---

## GAPS

- [ ] **Production status vs. code signals.** Notes say ~20 retailers use DilPos daily. The production-readiness report still has all P0 release items unchecked and describes Linkly EFTPOS as WIP; `structure.md` is dated June 2026. Confirm: are 20 shops fully live, or is this a pilot/early-rollout number? I wrote "in production with early retailers" to stay honest — adjust if you have firmer numbers.
- [ ] **Payment channel claim.** Your notes call the subscription model an "extremely reliable payment channel," but I found no Stripe/billing integration in the server dependencies, and `structure.md` lists Stripe under the backlog. What actually processes subscription payments today? I softened this claim rather than assert it.
- [ ] **Card payments (EFTPOS).** Linkly integration reads as in-progress in the code. Is it live at any shop yet? Confirm before publishing.
- [ ] **Start date / "since when."** Notes say 2025, 4 months. Some earlier phrasing implied 2024. Give me the exact months so I can date the "in production" line precisely.
- [ ] **The 20 retailers — any named or quotable?** Even one shop name, suburb, or owner quote would be the strongest possible detail. Currently I have none.
- [ ] **Your specific contribution.** You were 1 of 3 devs "across everything." For a portfolio, which parts were *yours* specifically (offline sync? hardware bridge? catalog packs?) so I can sharpen the first-person ownership.
- [ ] **Impact numbers.** No hard metrics exist (transactions/day, uptime, time saved). If any are true, they'd replace the softer lines. If not, leave as is.
- [ ] **Lotto/newsagent focus** appears heavily in the code but wasn't in your notes — I inferred the vertical story from `structure.md`. Confirm it's accurate to how the product was actually sold.
- [ ] **Links.** No live demo or video. Repo link included. Is there a marketing site URL (website-DILPos) I can add to the facts strip?

## CAPTURE LIST

1. [ ] The terminal till screen mid-sale — cart on one side, product grid on the other (hero image).
2. [ ] The compact till layout at its real target screen size (the UI-density problem).
3. [ ] The MSI installer or the desktop app running with its own window chrome (real installed app).
4. [ ] A printed receipt next to the till, or the hardware-bridge status panel (peripherals working).
5. [ ] The offline queue modal listing pending sales waiting to sync (the offline story).
6. [ ] The platform-admin catalog pack view alongside a store's adopted products (subscribe-and-adopt).
