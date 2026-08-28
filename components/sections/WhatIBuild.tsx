import type { ComponentType, SVGProps } from "react";
import { Section } from "@/components/ui/layout";
import { Heading, MetaLabel } from "@/components/ui/typography";
import { Reveal } from "@/components/motion/Reveal";
import {
  IconRostering,
  IconGps,
  IconCompliance,
  IconMultiTenant,
  IconFieldApps,
  IconRealtime,
} from "@/components/ui/service-icons";

/*
  2.5 What I build (light) — six services, each a drawn line icon in the accent,
  label at --fs-h3, one-line body description, accent border-lift on hover.
*/

const SERVICES: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  body: string;
}[] = [
  { icon: IconRostering, label: "Rostering", body: "Shift scheduling that respects coverage, skills, and the clock." },
  { icon: IconGps, label: "GPS time & attendance", body: "Clock-ins tied to real locations, with the variances flagged." },
  { icon: IconCompliance, label: "Compliance tracking", body: "Certifications and documents watched before they expire." },
  { icon: IconMultiTenant, label: "Multi-tenant SaaS", body: "One platform, many companies, cleanly walled off from each other." },
  { icon: IconFieldApps, label: "Field apps", body: "React Native apps the crew actually opens on a shift." },
  { icon: IconRealtime, label: "Realtime dashboards", body: "What is happening on the ground, updating as it happens." },
];

export function WhatIBuild() {
  return (
    <Section id="services">
      <MetaLabel>What I build</MetaLabel>
      <Heading variant="h2" as="h2" className="mt-4">
        Six things, done properly.
      </Heading>

      <Reveal
        className="mt-12 grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.05}
      >
        {SERVICES.map(({ icon: Icon, label, body }) => (
          <div
            key={label}
            style={{ "--accent-text": "#c23a15" } as React.CSSProperties}
            className="rounded-card border border-border bg-surface-1 p-6 transition-colors hover:border-border-hover"
          >
            <span className="text-(--accent-text)">
              <Icon />
            </span>
            <div className="mt-5 font-display text-h3 text-text">{label}</div>
            <p className="mt-2 font-body text-body text-muted">{body}</p>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
