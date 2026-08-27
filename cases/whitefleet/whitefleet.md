# WhiteFleet — a workforce platform where the worker owns the data

A multi-tenant system for Australian labour-hire companies. Three apps, one API, and a data wallet that belongs to the worker instead of the company.

`Sole developer · Jan–Jun 2026 · Expo + React 19 + Express 5 + Prisma/Postgres + Supabase Auth · Early client pilot · [Repo](https://github.com/rajannaadeli/whitefleet)`

- **4 surfaces on 1 API** — worker mobile, company admin, platform admin, one Express server, one 57-table Postgres schema.
- **Worker-owned data wallet** — documents, bank, and tax live once on the person and are shared by an append-only grant/revoke consent ledger.
- **Solo build, six months** — currently in early pilot with a handful of Australian labour-hire clients running it against real operations.

---

## Where this came from

An Australian client had a labour-hire problem and a hunch. Staffing companies juggle workers across sites, shifts, and compliance paperwork, and every company keeps its own copy of everything — the same driver licence photographed and re-verified at each new employer. The worker fills the same forms over and over. Nobody owns a clean record of who consented to what.

The pitch was a platform that both sides could use: companies to manage their workforce, workers to manage their own work and information. It started as an MVP. I took it into a version-one build after that proved the shape was right. I was the only developer on it, start to finish.

The core bet was unusual for this market. Most workforce tools treat the company as the root object and the worker as a row inside it. I inverted that. The worker is the global entity; a company is something a worker holds a membership in — one worker, many memberships, at the same time.

---

## The tensions

**A worker belongs to several companies at once.** So their identity, documents, and pay details can't live under any one company. But every shift, task, and attendance record is company-scoped and must stay walled off from the others.

**One API serves four different roles.** A company admin, a supervisor who sees only their own departments, an accountant, a WhiteFleet staffer, and a worker all hit the same Express server. The permission boundaries can't be a frontend decision — a supervisor could just call the endpoint directly.

**The same email can be three people.** Someone might be a platform staffer, a company admin, and a worker all at once. On login the server has no idea which of its three apps is asking.

> [SCREENSHOT: the company switcher on mobile, mid-switch between two companies — shows the multi-membership premise in one glance]

---

## The build

### Making the worker the root, not the company

The situation: a worker's licence, bank details, and tax file live on the person, but eight companies might each need to read them.

The decision: split the schema down the middle. Worker-owned tables — `wallet_documents`, `wallet_grants`, `users_bank_details`, `users_tax_information` — hang off the person. Company-scoped tables — `user_company_memberships`, `user_details`, attendance, tasks — hang off the membership. A company never holds the worker's data. It holds a grant that lets it read a live copy.

Why not the usual approach: copying the worker's documents into each company's record would have been faster to ship and a compliance landmine later. Eight stale copies of a licence, no single source of truth, no clean way to prove consent. I didn't want to be writing cleanup jobs a year in.

What it produced: a 57-model Prisma schema with a hard line between what the worker owns and what the company sees. The invite→accept handshake is the spine — a company sends an invite, the worker accepts it on the mobile app, and the membership activates with zero admin action on the other end.

> [SCREENSHOT: the worker wallet screen showing documents with verification badges — the "own it once" idea made concrete]

### The consent ledger that never deletes

This is the part I'm most sure about. A company reads a worker's bank details through a `wallet_grants` row. Revoke the grant and the data disappears from the company's view immediately — no cleanup, no stale copy, because the company never had a copy to begin with.

The decision: make grants append-only. Revoking doesn't delete the row; it stamps `revoked_at`. The table is simultaneously the live access-control mechanism and the audit trail. The history *is* the proof of consent.

What it produced: privacy enforced by the data model rather than by policy. When a worker pulls a grant, the code sets `revoked_at` on the active rows and the next read returns nothing. The trail of who could see what, and until when, is permanent.

> [SCREENSHOT: a document's sharing panel showing an active grant and a revoke action — the consent model from the worker's side]

### One API, four permission surfaces, server-enforced

The situation: a supervisor must see only their own departments' workers, attendance, and tasks. The same endpoint has to return everything for an admin. And it has to hold up against someone calling the API by hand.

The decision: a three-step resolution chain on the server. `resolveCompanyActor` authenticates the Supabase JWT, finds the user, and verifies an active membership or admin link for the requested company. `resolveCompanyAdmin` adds an admin gate for mutations. `resolveCompanyActorOrSupervisor` enriches the actor with their `systemrole` and the exact `supervisedGroupIds` they oversee, so every downstream query filters by those IDs.

On the client, a `useRole` hook derives boolean permission flags from the role string, and a `useDepartmentScope` hook auto-appends the correct department filter to API queries. Supervisors get narrowed everywhere without per-page wiring.

Why this way: a frontend filter would have been a lie. The scoping lives on the server, so a supervisor who curls the endpoint for another department gets nothing back — not a 403 that leaks the department exists, just an empty result.

> [SCREENSHOT: the same employee list as seen by an admin vs. a supervisor, side by side — the department scope doing its job]

### Routing one identity to the right app

The situation: three frontends, one Supabase Auth instance, one server. The same email could be a platform staffer, a company admin, and a worker.

The decision: a single dashboard-gate resolver that runs on every app load. It looks the user up by Supabase ID and email in parallel, checks `platform_staff` first, then company admin links and memberships, and if none of those match but a worker membership exists, it returns an "employee → use the mobile app" signal. Company access also runs through a registration and billing state machine — `pending_review → approved → active / grace / expired / suspended / canceled` — so a lapsed company hits a locked screen, not stale data.

The result is cached in-memory for 30 seconds per user to kill redundant DB roundtrips. Registration and error states are never cached, so an approval takes effect on the next load instead of thirty seconds later.

> [SCREENSHOT: the "you're an employee — download the mobile app" redirect screen — the gate refusing the wrong surface politely]

---

## Under the hood

One Express 5 + Prisma 6 server over Postgres (Supabase), fronted by three clients: a React 19 / Vite company-admin app, a React 19 platform app for internal staff, and an Expo SDK 54 / React Native worker app. Auth is a single Supabase JWT the server validates on every request; the resolver chain turns that token into a scoped actor before any query runs. The mobile client uses TanStack Query with company ID baked into every query key, so switching companies refetches cleanly instead of showing another company's cache. No websockets — chat and task updates are request-driven, and recurring rosters run off a node-cron engine on the server. State machines, not booleans, guard both billing and document lifecycle.

> [DIAGRAM: one API in the centre, three app surfaces around it, the resolver chain as the gate between them]

---

## What shipped

A working four-surface platform on a 57-table schema, in early pilot with Australian labour-hire clients testing it against real operations. No large user base yet — I'm not going to dress that up. What it demonstrates is the quality of the decisions underneath: a consent model that makes data leaks structurally hard, server-enforced role scoping that survives a hand-crafted request, and one auth system that routes three apps without role confusion. The hard parts are the ones you can't retrofit later — the data model and the permission boundaries — and those are built.

---

## Looking back

I designed the document system around AI-first verification — Claude Haiku auto-clearing uploads for cents each, humans reviewing only the low-confidence ones. I built the badge that travels with the worker and reserved an `ai_verified` status for it. Then V1 shipped with human-only review, the AI leg still a stub. It was the right call to cut for the pilot, but I'd started the wrong end first: I wired the verification *plumbing* before I had the volume of documents that would justify automating it. If I did it again I'd ship the manual queue, watch what real uploads actually looked like, and let that shape the model — instead of building for a scale I was guessing at.

---

## GAPS

- [ ] **AI verification is not implemented (notes vs. code).** Notes claim "AI-first verification (Claude Haiku, sub-cent per document) auto-clears uploads." Code says otherwise: `wallet.service.ts` labels the flow `Platform verification (manual, V1)` and sets `verification_method: 'human'`; there is no Anthropic/Claude integration anywhere in `server/src`. `ai_verified` appears only as a reserved future enum value in a schema comment. The case study reflects the code (human-only V1) and frames the AI plan as the "looking back" admission. Confirm this is how you want it told.
- [ ] **"15 boolean permission flags" unverified.** `use-role.ts` exists and derives flags, but I did not count exactly 15. Confirm the number if you want it stated precisely (I left it vague on purpose).
- [ ] **Document duplicate-guard / fuzzy-match / Platform merge-promote tooling unverified.** PROBLEM 2 describes a search-first add flow, a fuzzy-name duplicate guard, and Platform merge/promote tooling. I confirmed `verification_status` and the global-document link exist in the schema, but did not open the client flows to verify the three-layer defence. Confirm before leaning on it publicly (I kept the case study light on this section for that reason).
- [ ] **"4 surfaces" vs "3 app surfaces."** Your one-liner says three app surfaces; the repo has three frontends plus the server (four surfaces total). I used "3 apps, one API." Fine as-is, just noting.
- [ ] **Pilot specifics.** "A handful of clients" is my honest read of your notes ("some clients are using this software for the real work"). Real numbers (how many companies, how many workers, since when) would strengthen the proof chips — replace when you have them.
- [ ] **No realtime.** Confirmed no websockets; chat (`chat_rooms`, `messages`, `message_reads`) exists but is request-driven. If chat is meant to feel live, worth noting the polling approach.
- [ ] **Live/demo link.** Only the repo URL is provided. Add a deployed URL or demo video if one exists.

## CAPTURE LIST

1. The company switcher on mobile, mid-switch between two companies — the multi-membership premise.
2. The worker wallet screen showing documents with verification badges — "own it once" made concrete.
3. A document's sharing panel with an active grant and a revoke action — the consent model, worker's side.
4. The same employee list seen by an admin vs. a supervisor, side by side — department scope working.
5. The "you're an employee — download the mobile app" redirect — the dashboard gate refusing the wrong surface.
6. [DIAGRAM] One API in the centre, three app surfaces around it, the resolver chain as the gate.
