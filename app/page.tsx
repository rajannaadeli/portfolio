import { Section, Grid } from "@/components/ui/layout";
import { Heading, Text, MetaLabel } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { StatBlock } from "@/components/ui/stat-block";
import { DeviceFrame } from "@/components/ui/device-frame";
import { getAllCases, getImageByUse, getCase } from "@/lib/content";
import { SITE } from "@/lib/site";

/*
  Home — a plain, ordered, content-complete stub of every home section (brief
  §7). Real final copy where the brief provides it; [TBD] where an item is still
  open (brief §9). Structurally correct, token-styled, unanimated. Phase 2 makes
  it beautiful and adds motion.
*/

const STATS = [
  { value: "3+", label: "years building software" },
  { value: "8", label: "products shipped to production" },
  { value: "3", label: "countries with clients" },
];

const SERVICES = [
  "Rostering & shift-scheduling systems",
  "GPS time & attendance",
  "Certification & compliance tracking",
  "Multi-tenant SaaS platforms",
  "React Native field apps",
  "Realtime operations dashboards",
];

const ENGAGEMENT = [
  { title: "Fixed-price project", body: "Milestone-based, so the cost is known upfront. My primary model." },
  { title: "Ongoing retainer", body: "Continued build and maintenance after launch." },
  { title: "Paid discovery", body: "A scoped session to map the problem before committing to a build." },
];

const WORKING_STYLE = [
  "Fixed-price — cost is known upfront",
  "AI-accelerated delivery with quality guardrails: typed code, tests on core logic, review discipline",
  "AEST / US-morning overlap",
  "Written communication — no surprises",
];

// Draft answers — pending Rajanna's approval (brief §9). Phrasing is real, not
// placeholder, but the FAQ as a whole is marked [DRAFT].
const FAQ = [
  {
    q: "How do you price projects?",
    a: "Fixed-price against milestones, so you know the cost before we start. I scope the work, break it into milestones, and quote the whole thing. No hourly surprises. Figures are discussed directly, not posted publicly.",
  },
  {
    q: "What timezone do you work in?",
    a: "I'm in Pune, India, and keep an overlap with AEST and US mornings. Most of my clients are in Australia, the US, and the UK, so async written updates carry the day and calls happen in the shared window.",
  },
  {
    q: "Do you use AI?",
    a: "Yes, confidently. AI is the speed advantage behind fixed-price delivery — but it runs inside guardrails: typed code, tests on the logic that matters, and review discipline. The output is code I'd defend line by line.",
  },
  {
    q: "What about maintenance after delivery?",
    a: "I offer a retainer for ongoing work — fixes, changes, and new features after launch. If you'd rather take it in-house, the codebase is typed and documented enough to hand off.",
  },
  {
    q: "Can you work inside an existing codebase?",
    a: "Yes. A good share of my work has been joining a running product and shipping into it. I get familiar with the stack quickly and match the conventions already there.",
  },
  {
    q: "What's a typical timeline?",
    a: "A RosterBay-scale product is roughly six weeks part-time; full-time is faster. Smaller scopes land sooner. I'll give you a milestone timeline with the quote.",
  },
  {
    q: "How do we start?",
    a: "Message me on Upwork or email hello@rajanna.dev with a sketch of the problem. I'll come back with questions, a scope, and a fixed price — or a paid discovery session if the shape isn't clear yet.",
  },
];

export default function HomePage() {
  const cases = getAllCases();
  const featured = getCase("rosterbay");
  const heroImage = getImageByUse("rosterbay", "hero");
  const selected = cases.filter((c) => c.slug !== "rosterbay");

  return (
    <>
      {/* 1 — HERO */}
      <Section className="pt-40 sm:pt-48">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-pill border border-border px-3 py-1.5 font-mono text-meta uppercase text-muted">
            <span className="h-2 w-2 rounded-pill bg-accent-lime" />
            Available for projects
            <MetaLabel className="text-dim">[TBD wording]</MetaLabel>
          </span>

          <Heading variant="display" className="max-w-[16ch]">
            {SITE.positioning}
          </Heading>

          <div className="mt-2 flex flex-wrap gap-3">
            <Button href={SITE.links.rosterbay} external>
              Open the live demo ↗
            </Button>
            <Button href={SITE.links.upwork} external variant="secondary">
              Hire me on Upwork
            </Button>
          </div>
        </div>

        {/* Hero visual — real RosterBay screenshot this phase; the DOM/SVG roster
            animation replaces it in Phase 2. This is the LCP image. */}
        {heroImage ? (
          <div className="mt-16">
            <DeviceFrame
              image={heroImage}
              url="rosterbay.com/app"
              priority
              sizes="(min-width: 1320px) 1320px, 100vw"
            />
          </div>
        ) : null}

        {/* Stat row — static numbers this phase; count-up is Phase 2. */}
        <Grid className="mt-16" cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <StatBlock key={s.label} value={s.value} label={s.label} />
          ))}
          <StatBlock
            value="1"
            label="live product you can open right now"
            href={SITE.links.rosterbay}
            external
            featured
          />
        </Grid>
      </Section>

      {/* 2 — FEATURED CASE (RosterBay) */}
      {featured ? (
        <Section style={{ "--accent": featured.accentVar } as React.CSSProperties}>
          <MetaLabel accent>Featured case</MetaLabel>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <Heading variant="h2" as="h2">
              {featured.name}
            </Heading>
            <Button href={`/work/${featured.slug}`} variant="secondary">
              Read the case →
            </Button>
          </div>
          <Text size="lg" className="mt-4" measure>
            {featured.lede}
          </Text>
          <div className="mt-8 flex flex-wrap gap-2">
            {featured.proofChips.map((chip) => (
              <Chip key={chip} variant="accent">
                {chip}
              </Chip>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 3 — SELECTED WORK */}
      <Section>
        <MetaLabel>Selected work</MetaLabel>
        <Heading variant="h2" as="h2" className="mt-4">
          Five more, shipped.
        </Heading>
        <Grid className="mt-12" cols="grid-cols-1 md:grid-cols-2">
          {selected.map((c) => {
            const thumb = c.images.find((i) => i.shortlisted);
            return (
              <Card
                key={c.slug}
                href={`/work/${c.slug}`}
                style={{ "--accent": c.accentVar } as React.CSSProperties}
              >
                {thumb ? (
                  <DeviceFrame
                    image={thumb}
                    className="mb-6"
                    sizes="(min-width: 768px) 640px, 100vw"
                  />
                ) : null}
                <div className="flex items-center justify-between">
                  <Heading variant="h3" as="h3">
                    {c.name}
                  </Heading>
                  <MetaLabel accent>0{c.order + 1}</MetaLabel>
                </div>
                <Text className="mt-3" measure>
                  {c.lede}
                </Text>
                <div className="mt-4 font-mono text-meta uppercase text-dim">
                  {c.facts.stack.slice(0, 4).join(" · ")}
                </div>
              </Card>
            );
          })}
        </Grid>
      </Section>

      {/* 4 — WHAT I BUILD */}
      <Section id="services">
        <MetaLabel>What I build</MetaLabel>
        <Grid className="mt-8" cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Card key={s}>
              <Text muted={false} size="lg" className="font-display">
                {s}
              </Text>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* 5 — HOW I WORK */}
      <Section id="how-i-work">
        <MetaLabel>How I work</MetaLabel>
        <Grid className="mt-8" cols="grid-cols-1 md:grid-cols-3">
          {ENGAGEMENT.map((e) => (
            <Card key={e.title}>
              <Heading variant="h3" as="h3">
                {e.title}
              </Heading>
              <Text className="mt-3">{e.body}</Text>
            </Card>
          ))}
        </Grid>
        <ul className="mt-10 flex flex-wrap gap-3">
          {WORKING_STYLE.map((w) => (
            <li key={w}>
              <Chip>{w}</Chip>
            </li>
          ))}
        </ul>
      </Section>

      {/* 6 — TESTIMONIAL */}
      <Section>
        <figure className="mx-auto max-w-4xl text-center">
          <blockquote className="font-display text-h2 text-text">
            &ldquo;Working with him was a great experience. He handled both the front-end and
            back-end of our project really well and quickly got familiar with our tech stack. His
            code was clean and well-structured, and he was easy to communicate with throughout the
            project. He was reliable, met deadlines, and understood what we needed without much back
            and forth. I&rsquo;d definitely be happy to work with him again.&rdquo;
          </blockquote>
          <figcaption className="mt-8 font-mono text-meta uppercase text-dim">
            Client · OMAC engagement <span className="text-dim">[TBD — confirm label]</span>
          </figcaption>
        </figure>
      </Section>

      {/* 7 — ABOUT */}
      <Section id="about">
        <Grid cols="grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex h-32 w-32 items-center justify-center rounded-card border border-border bg-surface-1 font-display text-mega leading-none text-text">
              RA
            </div>
          </div>
          <div className="md:col-span-8">
            <MetaLabel>About</MetaLabel>
            <div className="mt-4 space-y-4">
              <Text size="lg" muted={false} measure>
                I&rsquo;m Rajanna Adeli, a full-stack developer in Pune building workforce and
                operations software for clients in Australia, the US, and the UK.
              </Text>
              <Text size="lg" measure>
                I&rsquo;m currently a software developer at Tata Consultancy Services on enterprise
                platform engineering for a global energy client, and before that I was a core
                engineer at Bithook, shipping two production SaaS products end to end.
              </Text>
              <Text size="lg" measure>
                Alongside that I&rsquo;ve spent three years freelancing internationally — a
                multi-tenant workforce platform for an Australian labour-hire company, a production
                retail POS, and the products you&rsquo;ll find in my work.
              </Text>
              <Text size="lg" measure>
                Outside the editor, I follow spaceflight closely and I watch a lot of anime.
              </Text>
            </div>
          </div>
        </Grid>
      </Section>

      {/* 8 — FAQ */}
      <Section id="faq">
        <div className="flex items-baseline gap-3">
          <MetaLabel>FAQ</MetaLabel>
          <MetaLabel className="text-dim">[DRAFT — pending approval]</MetaLabel>
        </div>
        <div className="mt-8 max-w-3xl divide-y divide-border border-y border-border">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-h3 text-text">
                {item.q}
                <span className="ml-4 font-mono text-body text-dim transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <Text className="mt-4" measure>
                {item.a}
              </Text>
            </details>
          ))}
        </div>
      </Section>

      {/* 9 — CONTACT */}
      <Section id="contact">
        <Grid cols="grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-5">
            <MetaLabel>Contact</MetaLabel>
            <Heading variant="h2" as="h2" className="mt-4">
              Let&rsquo;s build it.
            </Heading>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-6 inline-block font-mono text-body-lg text-accent-orange"
            >
              {SITE.email}
            </a>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={SITE.links.upwork} external>
                Message on Upwork
              </Button>
              <Button href={SITE.links.linkedin} external variant="ghost">
                LinkedIn
              </Button>
              <Button href={SITE.links.github} external variant="ghost">
                GitHub
              </Button>
            </div>
          </div>

          {/* Structural form only — serverless + Resend wiring is Phase 3 (§8). */}
          <form
            className="mt-8 flex flex-col gap-4 md:col-span-7 md:mt-0"
            aria-label="Contact form"
            data-tbd="submission wiring (Resend) — Phase 3"
          >
            <label className="flex flex-col gap-2">
              <MetaLabel>Name</MetaLabel>
              <input
                name="name"
                type="text"
                autoComplete="name"
                className="rounded-sm border border-border bg-surface-1 px-4 py-3 font-body text-text outline-none focus:border-border-hover"
              />
            </label>
            <label className="flex flex-col gap-2">
              <MetaLabel>Email</MetaLabel>
              <input
                name="email"
                type="email"
                autoComplete="email"
                className="rounded-sm border border-border bg-surface-1 px-4 py-3 font-body text-text outline-none focus:border-border-hover"
              />
            </label>
            <label className="flex flex-col gap-2">
              <MetaLabel>What are you building?</MetaLabel>
              <textarea
                name="message"
                rows={5}
                className="rounded-sm border border-border bg-surface-1 px-4 py-3 font-body text-text outline-none focus:border-border-hover"
              />
            </label>
            <div className="flex items-center">
              <Button type="submit">Send</Button>
              <MetaLabel className="ml-3 text-dim">[TBD — form not yet wired]</MetaLabel>
            </div>
          </form>
        </Grid>
      </Section>
    </>
  );
}
