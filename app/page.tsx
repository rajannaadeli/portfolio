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
import { RouteThread } from "@/components/motion/RouteThread";

const TECH = [
  "TypeScript", "React 19", "Next.js", "React Native", "Expo", "Node", "NestJS",
  "Express", "PostgreSQL", "Prisma", "Supabase", "MongoDB", "Tauri", "Tailwind", "GSAP",
];

/*
  Home — alternating theme bands (Phase 2 §1) stitched by the RouteThread ribbon.
  Each band's background sits below the ribbon (`z-0`); each band's content is
  raised to `z-10` so the ribbon weaves behind text and cards, then surfaces in
  front (`z-20`) at the band boundaries. `data-band` drives nav + ribbon colour.
*/

export default function HomePage() {
  return (
    <div className="relative isolate">
      <RouteThread />

      {/* DARK — hero, stats, featured */}
      <div data-band="dark">
        <div className="relative z-10">
          <Hero />
          <StatRow />
          <FeaturedCase />
          {/* Tech-stack marquee — signature strip at the dark→light boundary. */}
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
      </div>

      {/* LIGHT — the five light-UI projects and the "how" sections */}
      <div data-band="light" className="band-light band-edge">
        <div className="relative z-10">
          <SelectedWork />
          <WhatIBuild />
          <HowIWork />
        </div>
      </div>

      {/* DARK — testimonial interruption */}
      <div data-band="dark" className="band-edge">
        <div className="relative z-10">
          <Testimonial />
        </div>
      </div>

      {/* LIGHT — about + FAQ */}
      <div data-band="light" className="band-light band-edge">
        <div className="relative z-10">
          <About />
          <Faq />
        </div>
      </div>

      {/* DARK — contact (footer follows in the layout) */}
      <div data-band="dark" className="band-edge">
        <div className="relative z-10">
          <Contact />
        </div>
      </div>

      <FloatingCTA />
    </div>
  );
}
