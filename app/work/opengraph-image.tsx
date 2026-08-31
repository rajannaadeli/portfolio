import { OG_SIZE, OG_CONTENT_TYPE, renderOgCard } from "@/lib/og";

// Rendered once at build. `force-static` is required by `output: "export"`,
// and is correct regardless: nothing here depends on the request.
export const dynamic = "force-static";

export const alt = "Work — six shipped workforce and operations systems";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    eyebrow: "Work",
    title: "Six systems, shipped.",
    subtitle:
      "Rostering, workforce platforms, document control, scheduling, and point of sale — each a production build.",
    facts: ["Workforce", "Documents", "Scheduling", "Retail"],
    accent: "violet",
  });
}
