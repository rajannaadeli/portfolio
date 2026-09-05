import { Section } from "@/components/ui/layout";
import { Text, MetaLabel } from "@/components/ui/typography";
import { Reveal } from "@/components/motion/Reveal";
import Image from "next/image";

/*
  2.8 About (light) — asymmetric 4/8 split. Monogram + mono meta stack on the
  left; four sentences of arc on the right, ending with the two human details in
  one closing line. First person throughout.
*/

const META = ["Pune, India", "AEST + US overlap", "B.Tech CSE, 2025"];

export function About() {
  return (
    <Section id="about">
      <Reveal className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="bg-[#000000] aspect-square w-[140px] flex items-center justify-center rounded-4xl">
            <Image src="/icon.svg" alt="Logo" width={100} height={100} />
          </div>
          <ul className="mt-6 flex flex-col gap-2">
            {META.map((m) => (
              <li key={m}>
                <MetaLabel>{m}</MetaLabel>
              </li>
            ))}
          </ul>
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
              platform engineering for a global energy client.
            </Text>
            <Text size="lg" measure>
              Before that I was a core engineer at Bithook, shipping two production SaaS products end
              to end, and I&rsquo;ve spent three years freelancing on workforce platforms, a retail
              POS, and the products in my work.
            </Text>
            <Text size="lg" measure>
              Away from the editor, I follow spaceflight closely and I watch a lot of anime.
            </Text>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
