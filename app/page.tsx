import { Hero } from "@/components/sections/Hero";
import { StatRow } from "@/components/sections/StatRow";
import { FeaturedCase } from "@/components/sections/FeaturedCase";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { WhatIBuild } from "@/components/sections/WhatIBuild";
import { HowIWork } from "@/components/sections/HowIWork";
import { Testimonial } from "@/components/sections/Testimonial";
import { About } from "@/components/sections/About";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { FloatingCTA } from "@/components/motion/FloatingCTA";
import { Marquee } from "@/components/motion/Marquee";
import { ScrollSpine } from "@/components/motion/ScrollSpine";

const TECH = [
  "TypeScript", "React 19", "Next.js", "React Native", "Expo", "Node", "NestJS",
  "Express", "PostgreSQL", "Prisma", "Supabase", "MongoDB", "Tauri", "Tailwind", "GSAP",
];

/*
  Home — alternating theme bands (Phase 2 §1). Each band's theme matches the
  screenshots inside it: dark where RosterBay's dark UI and the type-led moments
  live, light (paper) where the five light-UI projects and the reading sections
  live. `data-band` drives the nav's palette inversion; `.band-edge` carries the
  1px boundary hairline. No section straddles a boundary.
*/

export default function HomePage() {
  return (
    <>
      <ScrollSpine />

      {/* DARK — hero, stats, featured */}
      <div data-band="dark">
        <Hero />
        <StatRow />
        <FeaturedCase />
        {/* Tech-stack marquee — signature strip at the dark→light boundary,
            hairline top/bottom, edge-faded and legible (Phase-3 §6). */}
        <div className="mt-24 border-y border-border py-5">
          <Marquee>
            {TECH.map((t) => (
              <span
                key={t}
                className="px-7 font-mono text-meta uppercase tracking-[0.18em] text-dim"
              >
                {t}
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      {/* LIGHT — the five light-UI projects and the "how" sections */}
      <div data-band="light" className="band-light band-edge">
        <SelectedWork />
        <WhatIBuild />
        <HowIWork />
      </div>

      {/* DARK — testimonial interruption */}
      <div data-band="dark" className="band-edge">
        <Testimonial />
      </div>

      {/* LIGHT — about + FAQ */}
      <div data-band="light" className="band-light band-edge">
        <About />
        <Faq />
      </div>

      {/* DARK — contact (footer follows in the layout) */}
      <div data-band="dark" className="band-edge">
        <Contact />
      </div>

      <FloatingCTA />
    </>
  );
}
