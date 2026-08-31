import Script from "next/script";

/*
  Cloudflare Web Analytics — privacy-first, cookieless, so no consent banner is
  needed and nothing is added to the critical path.

  Renders only when NEXT_PUBLIC_CF_BEACON_TOKEN is set, so local dev and
  previews stay out of the numbers. Get the token from:
  Cloudflare dashboard → Analytics & Logs → Web Analytics → Add a site.
*/
export function Analytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  if (!token) return null;
  return (
    <Script
      strategy="afterInteractive"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
