# rajanna.dev — Deployment, Email & SEO
*Free forever, commercial-use compliant, no credit card.*

---

## 0. The hosting decision (read this first)

**Do not deploy this site to Vercel's free plan.** Vercel's Hobby tier is restricted to personal, non-commercial use, and their fair-use guidelines name a freelance portfolio meant to land paid work as commercial. Enforcement is inconsistent, but notices do get sent — and the one site you cannot afford to have paused is the one linked from every proposal you send.

**Use Cloudflare Pages.** Commercial use is permitted on the free tier, bandwidth and static requests are unlimited, 500 builds/month, no card. You already run other sites on Cloudflare, so managing all properties share one dashboard, one DNS zone, one mental model.

| | Cloudflare Pages (free) | Vercel Hobby (free) |
|---|---|---|
| Commercial use | **Allowed** | Prohibited |
| Bandwidth | Unlimited | 100 GB/mo |
| Builds | 500/mo | Unlimited |
| Over the limit | Keeps serving | Feature pauses ~30 days |

---

## 1. Make the build fully static

Every route is already statically generated. The only dynamic piece is the contact form, which becomes a Pages Function. Two config changes:

**`next.config.ts`**
```ts
const nextConfig = {
  output: 'export',            // fully static
  images: { unoptimized: true }, // you pre-converted to AVIF/WebP already
  trailingSlash: true,
  poweredByHeader: false,
};
```

Because your screenshots are already AVIF with WebP fallbacks at correct dimensions, Next's image optimizer adds nothing here — turning it off removes the only thing that would require a server. Keep using `<Image>` with explicit `width`/`height` and `sizes`; you keep lazy loading, blur placeholders, and zero CLS.

Verify locally: `npm run build` → an `out/` directory containing every route. If a route fails to export, it's using a server feature — find it and make it static.

---

## 2. Deploy

1. Push the repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → select the repo.
3. Build settings:
   - Framework preset: **Next.js (Static HTML Export)**
   - Build command: `npm run build`
   - Output directory: `out`
   - Node version: set `NODE_VERSION = 22` in environment variables
4. Deploy. You get `<project>.pages.dev` in about a minute.
5. **Custom domain:** Pages project → Custom domains → add `rajanna.dev`, then add `www.rajanna.dev`. Since the domain's nameservers are already on Cloudflare, DNS records are created automatically and SSL provisions within minutes.
6. Set the redirect direction: `www` → apex (or the reverse), one canonical host only. Never let both serve the same content — that's the duplicate-content mistake you already fixed once on RosterBay.

**The `pages.dev` duplicate problem, again.** Your Pages subdomain will serve the identical site and can be indexed. Add `public/_headers`:
```
https://:project.pages.dev/*
  X-Robots-Tag: noindex
```
Confirm after deploy by curling the pages.dev URL and checking the header is present on the subdomain and absent on rajanna.dev.

---

## 3. Email — hello@rajanna.dev

### 3.1 Receiving (free, 2 minutes)
Cloudflare dashboard → your domain → **Email** → **Email Routing** → Get started.
- Create address: `hello@rajanna.dev` → destination: your Gmail.
- Cloudflare adds the MX and SPF records automatically. Verify the destination via the confirmation email.
- Optional: enable **catch-all** → forward to the same Gmail, so `anything@rajanna.dev` reaches you and nothing bounces.

### 3.2 Sending *as* hello@rajanna.dev from Gmail
Free, and worth the ten minutes — replying from `rajannaadeli@gmail.com` after someone emails `hello@rajanna.dev` undercuts the impression.
1. Cloudflare Email Routing can't send, so use Gmail's SMTP relay: Gmail → Settings → Accounts → **Send mail as** → Add another email address.
2. Name: `Rajanna Adeli`, Email: `hello@rajanna.dev`, uncheck "Treat as alias".
3. SMTP server: `smtp.gmail.com`, port `587`, username: your Gmail address, password: a **Google App Password** (Google Account → Security → 2-Step Verification → App passwords). TLS.
4. Gmail sends a confirmation to `hello@rajanna.dev`, which routes back to you. Click the link.
5. Set it as the default "From" address.

### 3.3 The contact form
Use **Resend** (free tier: 3,000 emails/month, 100/day — vastly more than a portfolio form needs).
1. Sign up, add domain `rajanna.dev`, add the DKIM/SPF records Resend gives you to Cloudflare DNS. Verification takes minutes.
2. Create an API key.
3. Implement the form endpoint as a **Cloudflare Pages Function** at `functions/api/contact.ts` (Pages Functions run even with a static export — this is why the static path still supports the form):
```ts
export const onRequestPost: PagesFunction<{ RESEND_API_KEY: string }> = async (ctx) => {
  const { name, email, message, company } = await ctx.request.json();
  if (company) return new Response(null, { status: 204 });        // honeypot
  if (!name || !email || !message) return new Response('Bad request', { status: 400 });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ctx.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Portfolio <hello@rajanna.dev>',
      to: 'hello@rajanna.dev',
      reply_to: email,
      subject: `Portfolio enquiry — ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    }),
  });
  return new Response(null, { status: res.ok ? 200 : 500 });
};
```
4. Add `RESEND_API_KEY` in Pages → Settings → Environment variables (encrypted). **Never commit it.**
5. Add Cloudflare **Turnstile** (free) to the form if spam appears — not before.

---

## 4. SEO — what to add and exactly where

### 4.1 Root metadata — `app/layout.tsx`
```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://rajanna.dev'),
  title: {
    default: 'Rajanna Adeli — Workforce & Operations Software Developer',
    template: '%s — Rajanna Adeli',
  },
  description:
    'I build rostering, GPS time-tracking and compliance systems for staffing, cleaning, security and care companies, plus the field apps their crews use.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://rajanna.dev',
    siteName: 'Rajanna Adeli',
    title: 'Rajanna Adeli — Workforce & Operations Software Developer',
    description: 'Rostering, GPS time-tracking and compliance systems. One live product you can open right now.',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
    locale: 'en_AU',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};
```

**Title strategy:** lead with the name, follow with the specialism. Recruiters search your name; prospects search the specialism. One title serves both.

### 4.2 Per-case metadata — `app/work/[slug]/page.tsx`
`generateMetadata()` returning a case-specific title (`WhiteFleet — multi-tenant workforce platform`), the case's deck as description, a canonical `/work/<slug>/`, and a **per-case OG image**. Generate these at build with `next/og` (`ImageResponse`) rather than designing twelve PNGs by hand: monogram, case name, deck, per-case accent. This is what makes a proposal link unfurl impressively in Upwork chat, WhatsApp, and LinkedIn.

### 4.3 Structured data (JSON-LD)
Two scripts, both cheap and both real ranking signals:
- **Person** in the root layout: name, jobTitle, url, email, `sameAs` (LinkedIn, GitHub, Upwork), `knowsAbout` (rostering, workforce management, React Native, PostgreSQL), `address` Pune, India.
- **CreativeWork** (or `SoftwareApplication` for RosterBay) on each case page: name, description, author reference, `dateCreated`, `url`.

### 4.4 Sitemap and robots
`app/sitemap.ts` — every route with `lastModified` from the case file's mtime; `app/robots.ts` — allow all, point at `https://rajanna.dev/sitemap.xml`. Both static-export safely.

### 4.5 On-page fundamentals
One `<h1>` per page (the hero headline on home, the case title on case pages). Descriptive `alt` on every screenshot — pull from `images.json`, that's what the field is for. Semantic landmarks (`<main>`, `<nav>`, `<footer>`). Descriptive link text — `Read the WhiteFleet case` beats `Read more`. Explicit `lang="en"`.

### 4.6 Submit and monitor
1. **Google Search Console** → add property → choose **Domain** → it gives a TXT record → add in Cloudflare DNS → verify. Submit `https://rajanna.dev/sitemap.xml`. Request indexing for `/` and each case URL.
2. **Bing Webmaster Tools** → import from GSC (one click).
3. **Analytics:** Cloudflare Web Analytics — free, privacy-friendly, no cookie banner needed, one script tag. Turn it on in the same dashboard.
4. Add the site to your LinkedIn profile, your GitHub profile link, and your Upwork profile. Those three backlinks are the only link-building a portfolio needs.

**Realistic expectation:** you will not rank for "workforce software developer" and shouldn't try. The SEO goal here is narrow — that **"Rajanna Adeli" returns your site first**, that every shared link unfurls beautifully, and that pages load instantly. Ranking for your own name is the whole game when the traffic arrives from proposals and resumes.

---

## 5. Launch checklist

- [ ] `npm run build` exports cleanly to `out/`
- [ ] Deployed; `rajanna.dev` and `www` resolve; one canonical, other redirects
- [ ] `pages.dev` returns `X-Robots-Tag: noindex`; apex does not
- [ ] Email routing live: send a test to `hello@rajanna.dev` from an outside address
- [ ] Gmail "send as" working: reply to that test and confirm the From header
- [ ] Contact form sends, honeypot silently rejects, success and error states both display
- [ ] `RESEND_API_KEY` set in Cloudflare, absent from the repo
- [ ] OG images render — test with a link-preview checker and by pasting into WhatsApp
- [ ] JSON-LD validates in Google's Rich Results Test
- [ ] Sitemap reachable; submitted to GSC; Bing imported
- [ ] Cloudflare Web Analytics recording
- [ ] Lighthouse ≥ 95 on `/`, `/work`, and one case page, run against the **live** URL
- [ ] Mobile pass on a real phone: nav, form, images, motion
- [ ] Resume PDF downloads correctly
- [ ] RosterBay links from the portfolio all work; portfolio link added to RosterBay's footer
- [ ] Site URL added to LinkedIn, GitHub, Upwork profiles

---

## 6. Ongoing cost

Domain renewals only — `rajanna.dev` and `rosterbay.com`, roughly ₹2,000/year combined. Hosting, email, forms, analytics, and SSL are ₹0 and stay ₹0 at any traffic level this site will ever see.