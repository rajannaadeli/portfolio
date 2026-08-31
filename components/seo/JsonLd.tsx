/*
  JsonLd — renders a schema.org graph into the document.

  Server-rendered into the static HTML so crawlers that do not execute JS still
  see it. `<` is escaped to `<` so no value in the graph can close the
  script tag early; this is the standard JSON-LD injection guard.
*/
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
