/*
  FAQ content — single source of truth.

  This lives outside the component because the same questions and answers are
  emitted twice: once as visible accordion copy, once as FAQPage JSON-LD. Google
  penalises structured data that does not match what a user can actually read on
  the page, so they must never be allowed to drift apart.
*/

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = [
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
