"use client";

import { useState } from "react";
import { Section } from "@/components/ui/layout";
import { Heading, MetaLabel } from "@/components/ui/typography";
import { FAQ } from "@/lib/faq";

/*
  2.9 FAQ (light) — narrow ~62ch centered column, accordion, one open by default,
  smooth height animation (grid-template-rows 0fr→1fr, no JS measuring). Copy is
  shared with the FAQPage JSON-LD via lib/faq.ts so the two can never drift.
*/


export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <Section id="faq">
      <div className="mx-auto max-w-[62ch]">
        <MetaLabel>FAQ</MetaLabel>
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
