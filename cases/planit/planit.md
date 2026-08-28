# planIt — a timetable generator for colleges

A web app that builds a college's weekly class timetable from subject-teacher bindings, so nobody has to solve the puzzle by hand.

`Solo developer (full stack + deploy) · 2025, ~3 months · React + Vite · Node/Express · MongoDB · In production` · [Repo](https://github.com/rajannaadeli/timetable-generator)

**Adopted by 5+ regional colleges** · **6-collection MongoDB schema, 3 user roles** · **Constraint solver that packs 42 slots/week under per-day limits**

---

## Where this came from

Building a college timetable by hand is a bad afternoon. You have a dozen subjects, a set of teachers, a rule that each subject needs a fixed number of lectures a week, another rule that a teacher can only take so many of one subject per day, two-hour practicals that can't be cut in half by a break, and six days to fit it all into. Miss one constraint and a teacher is double-booked in two rooms at once. The people doing this were doing it in spreadsheets.

I'd seen the problem up close, so I took the idea to a few regional colleges and walked them through it. They were interested enough that I built it to what they actually asked for, not what I imagined they wanted. More than five colleges ended up adopting it for their scheduling.

The pitch was narrow and I kept it that way: give me the subjects, the teachers, and how many slots each pairing needs, and the app hands back a full week that breaks none of the rules. Admins set up the bindings. Teachers and students log in to see their own schedule and download it as a PDF or image.

> [SCREENSHOT: the admin setup screen where subject-teacher bindings are entered — this is the entire input the scheduler works from]

## What made it hard

**The rules fight each other.** A week has 42 teaching slots — seven a day across six days, minus two fixed breaks. Every subject has a weekly total it must hit exactly, and a per-day cap it can't exceed. Practicals eat two continuous hours and can't straddle a break or hang off the end of the day. Satisfy the weekly totals too greedily and you blow the daily caps; respect the caps too strictly and you can't fit everything in. There's no obvious order to place things in.

**A single-teacher build with real users.** I was the only person on this — the algorithm, both apps, the database, the deploy. When a college hit something wrong, there was no one else to hand it to.

> [SCREENSHOT: a generated weekly timetable in the tabular grid — the thing the whole app exists to produce]

## The build

### The scheduler is a constrained solver, not a template

The situation: I could have shipped a fixed template and let admins drag things around. That's easy to build and useless the moment a college's subject mix doesn't match my template.

The decision: I wrote a generator ([schedule.js](frontend/src/utils/schedule.js)) that treats each week as an allocation problem. It walks the day's open slots, filters the bindings that are still under their daily and weekly caps, and places one at random from what's eligible. Practicals get a specific check — `canPlacePractical` confirms two consecutive non-break slots exist before committing, so a two-hour lab never gets split by the lunch break or shoved against the end of the day.

Why random-with-constraints instead of a clean deterministic pass: a deterministic loop kept painting itself into corners — it would fill the early days and leave a subject with no legal slot left. Randomizing the placement order and wrapping the whole thing in a retry loop (`MAX_ATTEMPTS = 100`) turned "impossible to place" into "try a different arrangement." If a configuration can't satisfy every binding, it throws the week away and reshuffles rather than shipping a broken one.

What it produced: a full six-day schedule where every subject hits its weekly total, no teacher exceeds their per-day limit, and no practical is broken across a break. The 80–90% time saving colleges reported comes from here — the hour-long spreadsheet fight became a click.

> [SCREENSHOT: the generate action running / the practical block sitting as two continuous hours — proof the two-hour rule holds]

### The 42-hour invariant lives on the server

The situation: the whole model only works if the bindings add up to exactly one week of teaching. Get that wrong and the scheduler is trying to solve a problem with no solution.

The decision: the backend refuses to save a setup unless the numbers check out. In [timetable.controller.js](backend/src/controllers/timetable.controller.js), `saveWeeklySetup` sums every binding — counting each practical as two hours — and rejects anything that isn't exactly 42 with `Total allocated hours must be exactly 42`. Practicals are stored as their real slot cost, not their count, so the math is honest everywhere downstream.

Why put it on the server and not just the form: the form can lie, or a college's admin can poke the API directly. The invariant that everything else depends on shouldn't be enforceable only in the browser.

What it produced: a bad setup gets caught at save time with a clear reason, instead of surfacing as a mysteriously unsolvable timetable ten minutes later.

> [SCREENSHOT: the validation error when bindings don't total 42 hours — the guardrail in action]

### Each day is its own document, so a day can be rebuilt alone

The situation: schedules aren't static. A day needs to be regenerated without nuking the rest of the week.

The decision: the schema splits the week into pieces. A `MainTimeTable` holds the class's bindings and a `week` array; each entry points at a `DayTimeTable`, which points at individual `TimeSlot` records. Because a day is its own document, I can regenerate Tuesday without touching Monday through Saturday.

Why the extra indirection instead of one fat timetable object: cramming a week into a single document makes every small change a rewrite of the whole thing, and makes "show me just this teacher's Thursday" awkward. Splitting it kept per-day edits cheap.

What it produced: single-day regeneration, and a clean base for adjusting a day when a teacher's availability changes.

> [SCREENSHOT: a single day being regenerated while the rest of the week stays put]

### Login shows you your own timetable

The situation: an admin, a teacher, and a student want three different views of the same data.

The decision: JWT auth with a `role` field on every user (`admin`, `teacher`, `student`), enforced by middleware. Teachers carry their subjects, students carry their assigned class, and the same timetable renders down to the slice each role is allowed to see. Downloads are handled client-side with `jspdf` and `html2canvas`, so the thing you see is the thing you save.

What it produced: one dataset, three honest views, and a PDF or image anyone can pull without me building a separate export pipeline.

> [SCREENSHOT: the same timetable as a teacher sees it vs. a student — one dataset, role-scoped]

## Under the hood

Two apps. A React 18 SPA built with Vite, styled with Tailwind and Radix primitives, talking over Axios to an Express 4 API. Data sits in MongoDB through Mongoose 8, across six core collections — User, Class, Subject, TimeSlot, DayTimeTable, MainTimeTable — plus a contact form. Auth is JWT with bcrypt-hashed passwords and role middleware. The scheduling solver itself runs in the browser; the server owns the 42-hour invariant and persistence. PDF and image export are client-side via jspdf and html2canvas.

## What shipped

It's in production. More than five regional colleges use it for their weekly scheduling, and the admins who used to fight a spreadsheet now generate a compliant week in a click. I don't have instrumented numbers — no analytics dashboard, no logged solve times — so the 80–90% figure is what colleges told me, not something I measured. What I can point to in the code is the part that's provable: a constraint solver that enforces weekly totals, per-day caps, and unbroken two-hour practicals, with a validation gate that won't let a broken setup through.

## Looking back

If I rebuilt it, the scheduler would move to the backend. Running the solver in the browser was the fast path — I could iterate on it without redeploying an API — but it means the core logic ships to every client and can't be trusted the way the server-side 42-hour check can. The randomized retry loop also bothers me a little: capping at 100 attempts works in practice, but it's a probabilistic answer to a problem that has a deterministic one, and on a pathological binding set it can give up on a week that's actually solvable. I'd want a proper backtracking pass as the fallback before I'd call the algorithm finished.

---

## GAPS

- [ ] **Leave-management algorithm (PROBLEM 2) not found in code.** The notes describe a second algorithm that auto-fills a timetable when a teacher goes on leave. I found no `leave`/`absent`/`substitute` logic in the frontend or backend — only per-day regeneration via DayTimeTable and [dayTimetable.controller.js](backend/src/controllers/dayTimetable.controller.js). Either it lives somewhere I didn't read, it's planned, or the day-regeneration is the mechanism you meant. I wrote the day-as-a-document section honestly around what exists and did not claim a dedicated leave algorithm. Confirm which is true.
- [ ] **Multi-tenancy / "5+ colleges" isolation.** The schema has no college/tenant/organization collection, and `Class.name` is globally unique. How are five colleges' data kept separate — separate deployments, separate databases, or one shared DB? This affects how I should describe scale. Currently written as "adopted by 5+ colleges" without claiming multi-tenant architecture.
- [ ] **The 80–90% time saving and "hundreds of students daily"** are your reported figures, not measurable in code (no analytics). Written as college-reported, not as my measurement. Confirm you're comfortable with that framing.
- [ ] **No live demo or video** (per notes). The repo link is the only artifact — a hosted demo would help evaluators a lot.
- [ ] **Scheduling runs client-side.** Confirmed in code and stated plainly in "Looking back." Flagging in case you'd rather not surface it.
- [ ] Minor: README says "7 hours per day"; the slot definition in sheduling.txt is 9 rows with 2 breaks = 7 teaching slots. Consistent, just noting.
- [ ] `subjectTeacherBindings` deadline / the specific college request that shaped a requirement — I have the general "built to their requirements" but no single concrete anecdote (a named college, a specific complaint). One real quote or incident would strengthen the Context section.

## CAPTURE LIST

1. The admin setup screen where subject-teacher bindings are entered.
2. A generated weekly timetable in the tabular grid.
3. The generate action running / a practical block shown as two continuous hours.
4. The validation error when bindings don't total 42 hours.
5. A single day being regenerated while the rest of the week stays put.
6. The same timetable as a teacher sees it vs. as a student sees it (role-scoped views).
