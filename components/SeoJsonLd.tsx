/**
 * Renders JSON-LD into the static HTML. Server component: no client JS is
 * needed for crawlers to read it.
 */
export function SeoJsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is escaped by React; the payload is built from
      // constants in this repo, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
