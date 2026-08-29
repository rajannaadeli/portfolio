import { Section } from "@/components/ui/layout";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WorkRow } from "@/components/sections/WorkRow";
import { getAllCases } from "@/lib/content";

/*
  2.4 Selected work (light band) — five alternating full-width rows. Replaces the
  2-column grid, so there is no orphaned fifth card.
*/

export function SelectedWork() {
  const cases = getAllCases().filter((c) => c.slug !== "rosterbay");

  return (
    <Section>
      <SectionHeader eyebrow="Selected work" lines={["Five more, shipped."]} accentEyebrow />

      <div className="mt-16 flex flex-col gap-20 md:gap-28">
        {cases.map((c, i) => (
          <WorkRow key={c.slug} c={c} flip={i % 2 === 1} />
        ))}
      </div>
    </Section>
  );
}
