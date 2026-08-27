import type { Metadata } from "next";
import { Section } from "@/components/ui/layout";
import { Heading, Text, MetaLabel } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { DeviceFrame } from "@/components/ui/device-frame";
import { getAllCases } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description: "Six production systems — rostering, workforce, POS, document control, and scheduling.",
  alternates: { canonical: "/work" },
};

export default function WorkIndexPage() {
  const cases = getAllCases();

  return (
    <Section className="pt-40 sm:pt-48">
      <MetaLabel>Work</MetaLabel>
      <Heading variant="display" as="h1" className="mt-4 max-w-[14ch]">
        Six systems, shipped.
      </Heading>
      <Text size="lg" className="mt-6" measure>
        Rostering, workforce platforms, document control, scheduling, and point of sale — each one a
        production build, described precisely.
      </Text>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
        {cases.map((c) => {
          const thumb = c.images.find((i) => i.shortlisted);
          return (
            <Card
              key={c.slug}
              href={`/work/${c.slug}`}
              style={{ "--accent": c.accentVar } as React.CSSProperties}
            >
              {thumb ? (
                <DeviceFrame image={thumb} className="mb-6" sizes="(min-width: 768px) 640px, 100vw" />
              ) : null}
              <div className="flex items-center justify-between">
                <Heading variant="h3" as="h2">
                  {c.name}
                </Heading>
                <MetaLabel accent>0{c.order + 1}</MetaLabel>
              </div>
              <Text className="mt-3" measure>
                {c.lede}
              </Text>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
