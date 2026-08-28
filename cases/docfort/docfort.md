# DocFort — a drawing vault for LHP Motors

A revision-controlled vault for engineering drawings, built so one motor manufacturer stops sending outdated PDFs to the shop floor.

**Role:** Sole developer (backend, frontend, desktop, deployment) · **Timeline:** 2024, ~6 months · **Stack:** Node/Express · MongoDB · Socket.IO + Redis/Bull · React 19 · Electron · **Status:** In production at LHP Motors, Solapur · **Links:** [Repo](https://github.com/rajannaadeli/component-store)

`In production since 2024` · `3 app surfaces from one API — web PWA, Electron desktop, Express backend` · `3-channel notifications (in-app, email, push) on a Redis-backed retry queue`

---

## The world before this

LHP Motors makes motors. Making a motor means hundreds of component drawings, and every drawing gets revised — a tolerance changes, a supplier changes, a mistake gets caught. Before DocFort there was no system holding any of it. Drawings lived in folders and inboxes, and the question that mattered — *is this the current revision?* — had no reliable answer.

I built this alongside a GAD builder tool I was already delivering to them. They asked for a place to keep component drawings that would guarantee the version on an engineer's screen was the version the company had actually approved. Not a file server. A store that knew what a revision *was*.

I was the only person on it. Six months, every layer.

> [SCREENSHOT: the main component library grid with search and category filters — establishes the product at a glance]

## What made it hard

Three things fought me the whole way, and none of them were "build a CRUD app."

The first was that a revision isn't a file. It's a file plus a story: why it changed, whether it's minor or major, what happens to the stock that was made against the old one. The second was reach — a notification that a drawing changed is useless if it doesn't arrive, and "arrive" had to mean an engineer at their desk *and* an engineer who'd closed the app. The third was getting the current file onto machines across the plant without asking people to go hunting for it.

## Modeling a revision as more than a file

**The situation.** Engineers don't just want the latest PDF. When a drawing changes, downstream people need to know *why* — is this a standardization tweak or a "we specified it wrong" correction — and what to do with parts already in the pipeline.

**The decision.** I modeled the revision as a first-class domain object, not a file attachment. Each revision carries a `revisionType` (minor or major), a `reasonForChange` drawn from a fixed vocabulary the engineers actually use — standardization, quality improvement, product development, wrongly specified, customer requirement — and a `disposalAction` describing what happens to pipeline, finished goods, and stock. When someone picks "wrongly specified," the form forces a corrective action before it'll save.

**Why, and what I rejected.** I could have stored a version number and a comment box and called it done. That's what a file server gives you. But a free-text comment is unsearchable and unaccountable, and the whole point was accountability. Conditional validation lives in Mongoose pre-validate hooks so the rules hold no matter which surface the data comes in from. The creation date is immutable — you can't backdate a revision.

**What it produced.** Every change to every drawing has a structured, queryable record of who, when, and why. The revision references its author polymorphically — a `createdByModel` of either User or Admin — so admin-made corrections and engineer submissions live in the same history without a fake user account.

> [SCREENSHOT: the revision history panel for a single component, showing revision type, reason for change, and disposal action — proves the domain model isn't just a version number]

## Getting the notification to actually land

**The situation.** A drawing revision that nobody sees is worse than useless — someone keeps building against the old one, believing they're current.

**The decision.** I sent every important event down three channels: in-app (Socket.IO), email (Nodemailer), and browser/desktop push (web-push, with Firebase on the mobile side). All of it runs through a Redis-backed Bull queue with retry attempts and a fallback-to-email path, so a transient failure on one channel doesn't silently drop the message.

**Why, and what I rejected.** A single Socket.IO broadcast would've been simpler and I'd have shipped it in a day. It also would've reached exactly the people who happened to have the tab open. The queue was the harder call — more moving parts, Redis to run — but reliability was the actual requirement, not realtime alone. The `NotificationManager` takes per-send options for which channels to use and what priority, so not every event screams at everyone.

**What it produced.** When a revision goes up, the people who need it get told, on whatever channel reaches them, and the send survives a hiccup instead of vanishing.

> [SCREENSHOT: an in-app notification arriving in real time next to the email version of the same alert — shows the multi-channel reach]

## Onboarding through an approval gate, not a signup form

**The situation.** This is internal engineering data. You can't let anyone who finds the URL make an account.

**The decision.** Registration is a request, not a signup. A new user submits their details — employee ID, department, designation, who they report to — and the account sits in a pending state until it's approved. The user model tracks approval status and keeps a status log of every state change with a timestamp and who made it. Access is role-based from there.

**Why, and what I rejected.** Open self-serve signup was off the table for obvious reasons. I could've handled approvals over email and created accounts by hand, but that doesn't scale past the first week. Putting the workflow in the data — with the reporting hierarchy captured on the user record — meant approvals had context instead of being a yes/no in someone's inbox. The tricky part was keeping this simple on screen while the backend carried a real state machine underneath.

**What it produced.** A join is a two-step, auditable process, and every account has a department, a role, and a paper trail of how it got approved.

> [SCREENSHOT: the admin approval queue with a pending registration and its status log — shows the gate and the audit trail]

## Pushing the current file to the plant

The drawings arrive as PDFs, but a PDF is a clumsy thing to browse in a library view. So uploads run through a middleware pipeline that converts them to SVG and optimizes with SVGO before storage, which makes the web viewer fast and lets me export back to PDF client-side when someone needs the file. The desktop side is an Electron app with `electron-updater` and a file watcher, so the machine on the shop floor stays current without anyone manually downloading anything.

> [SCREENSHOT: a drawing rendered in the in-app SVG viewer — proves the PDF-to-SVG pipeline]

## Under the hood

One Express/TypeScript API backs three surfaces: a React 19 PWA (Vite, Tailwind, Radix, Zustand), an Electron desktop client, and the mobile-facing push layer. Data is MongoDB through Mongoose, across six models — user, admin, component, revision, notification, push subscription. Auth is JWT with bcrypt over HTTP-only cookies, and access is role-based with a department/reporting hierarchy on the user record. Realtime is Socket.IO; reliable delivery is Bull on Redis. Uploads go through Multer and the PDF-to-SVG/SVGO pipeline. It's deployed with Docker and a GitHub Actions pipeline to EC2.

> [DIAGRAM: one API → three clients (web PWA, Electron desktop, push), with the Bull/Redis notification queue fanning out to in-app / email / push — one picture of the whole system]

## What shipped

It's live at LHP Motors in Solapur and is, per the team there, used daily by their engineering staff — the notes I'm working from put that number above 500 people relying on it for current drawings. I can vouch for the system being in production; the exact daily-active count is theirs to confirm, and I've flagged it below rather than dress it up. What the code demonstrates on its own: a real domain model for revisions, a delivery pipeline built for reliability over cleverness, and three client surfaces served from a single API by one developer.

## What I'd do differently

I'd tighten the data model before I tightened the UI. A couple of the revision fields are typed as `Mixed` with the real rules enforced in pre-validate hooks — it works, but the schema doesn't tell you the truth about itself, and a stricter typed shape would've caught edge cases at the boundary instead of in a hook. I also leaned on `Schema.Types.Mixed` for user preferences early to move fast; I'd formalize that now. It shipped and it holds. I just know where the seams are.

---

## GAPS

- [ ] **"Multi-tenant" claim vs. code.** The notes describe multi-tenancy, but the codebase shows a *single-organization* system with role-based access, a department/reporting hierarchy, and an approval workflow — there's no tenant/org isolation field on the models. I wrote it as RBAC + approval workflow, not multi-tenancy. Confirm which you mean; if there really are multiple isolated tenants, point me at where that separation lives.
- [ ] **500+ daily users.** This is from your notes, not verifiable in code. I attributed it honestly rather than stating it as fact. Confirm the real number (daily active vs. total registered) so we can state it cleanly, or provide a screenshot of an admin user count.
- [ ] **REAL IMPACT field was blank.** Any concrete before/after? (e.g., "wrong-revision incidents dropped to zero," "replaced X shared folders," time saved.) One real number here would strengthen the "What shipped" section a lot.
- [ ] **Product name.** I proposed **DocFort** (it's your database name and fits "a vault for drawings"). Approve, or give me the name you want on the portfolio.
- [ ] **Firebase vs. web-push.** Both are in the backend deps. Confirm the split — web-push for browser/desktop, Firebase (FCM) for mobile? I described it that way.
- [ ] **Deployment target.** Git history shows Docker + GitHub Actions to EC2, but the server also has Vercel build hints. Which is the live one? I said EC2.
- [ ] **Desktop auto-update in production.** `electron-updater` and a chokidar watcher are present. Confirm the desktop app is actually the distribution channel on the plant floor (vs. everyone using the web PWA), since the case leans on that.
- [ ] **No demo/video/live URL.** Noted. The screenshots below are the only visual proof — worth capturing all of them.

## CAPTURE LIST

1. The main component library grid with search and category filters.
2. The revision history panel for a single component (revision type, reason for change, disposal action).
3. An in-app notification arriving in real time, next to the email version of the same alert.
4. The admin approval queue with a pending registration and its status log.
5. A drawing rendered in the in-app SVG viewer.
6. Architecture diagram: one API → three clients, with the Bull/Redis queue fanning out to in-app / email / push.
