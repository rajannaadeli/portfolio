import { Section } from "@/components/ui/layout";
import { Heading, Text, MetaLabel } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Section className="pt-40 sm:pt-48">
      <MetaLabel accent>404 — off the roster</MetaLabel>
      <Heading variant="mega" as="h1" className="mt-6">
        404
      </Heading>
      <Text size="lg" className="mt-6" measure>
        This shift isn&rsquo;t on the schedule. The page you&rsquo;re after doesn&rsquo;t exist —
        maybe it clocked out. Everything that does exist is one click away.
      </Text>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/">Back home</Button>
        <Button href="/work" variant="secondary">
          See the work
        </Button>
      </div>
    </Section>
  );
}
