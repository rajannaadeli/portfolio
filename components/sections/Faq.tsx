"use client";

import { useState } from "react";
import { Section } from "@/components/ui/layout";
import { Heading, MetaLabel } from "@/components/ui/typography";

/*
  2.9 FAQ (light) — narrow ~62ch centered column, accordion, one open by default,
  smooth height animation (grid-template-rows 0fr→1fr, no JS measuring). Answers
  are drafted, pending Rajanna's approval (brief §9).
*/

const FAQ = [
  {
    q: "How do you price projects?",
    a: "Fixed-price against milestones, so you know the cost before we start. I scope the work, break it into milestones, and quote the whole thing. No hourly surprises. Figures are discussed directly, not posted publicly.",
  },
  {
    q: "What timezone do you work in?",
    a: "I'm in Pune, India, and keep an overlap with AEST and US mornings. Most of my clients are in Australia, the US, and the UK, so written updates carry the day and calls happen in the shared window.",
  },
  {
    q: "Do you use AI?",
    a: "Yes, confidently. AI is the speed advantage behind fixed-price delivery, and it runs inside guardrails: typed code, tests on the logic that matters, and review discipline. The output is code I'd defend line by line.",
  },
  {
    q: "What about maintenance after delivery?",
    a: "I offer a retainer for ongoing work: fixes, changes, and new features after launch. If you'd rather take it in-house, the codebase is typed and documented enough to hand off.",
  },
  {
    q: "Can you work inside an existing codebase?",
    a: "Yes. A good share of my work has been joining a running product and shipping into it. I get familiar with the stack quickly and match the conventions already there.",
  },
  {
    q: "What's a typical timeline?",
    a: "A RosterBay-scale product is roughly six weeks part-time. Full-time is faster, and smaller scopes land sooner. I'll give you a milestone timeline with the quote.",
  },
  {
    q: "How do we start?",
    a: "Message me on Upwork or email hello@rajanna.dev with a sketch of the problem. I'll come back with questions, a scope, and a fixed price, or a paid discovery session if the shape isn't clear yet.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <Section id="faq">
      <div className="mx-auto max-w-[62ch]">
        <div className="flex items-baseline gap-3">
          <MetaLabel>FAQ</MetaLabel>
          <MetaLabel className="text-dim">[Draft — pending approval]</MetaLabel>
        </div>
        <Heading variant="h2" as="h2" className="mt-4">
          Questions, answered.
        </Heading>

        <div className="mt-10 border-t border-border">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-border">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-h3 text-text">{item.q}</span>
                  <span
                    aria-hidden
                    className={`font-mono text-body text-dim transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 font-body text-body-lg text-muted">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
