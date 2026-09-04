# rajanna.dev — Deployment, Domain & Email

Follow this top to bottom. The order matters and is not the order you'd guess:
**everything downstream depends on DNS**, and DNS depends on the domain being
active on Cloudflare. Resend cannot be set up first, even though it feels like
the starting point — it verifies by reading DNS records that don't exist yet.

**Total time:** about 90 minutes, most of it waiting for DNS.

---

## What changed since `DEPLOYMENT_PLAN.MD` was written

That plan said "use Cloudflare Pages." Cloudflare's own recommendation has since
moved.

| Then | Now |
|---|---|
| Pages was the way to host static sites | **Workers with static assets** is the recommended path for new projects. Pages isn't deprecated and existing sites keep working, but new features land on Workers |
| Pages Functions for the API | The same Worker that serves your files handles `/api/contact` |
| `@cloudflare/next-on-pages` for Next.js | Deprecated. Cloudflare now points at **vinext**, with **OpenNext** as the fallback |

**You do not need vinext or OpenNext.** Those exist to run a *Next.js server* on
Cloudflare. This site doesn't need a server — it is 10 HTML files, some images,
and one form endpoint. Running a Next.js runtime to serve static files would add
moving parts, compatibility risk, and cold starts, and buy you nothing.

So: **static export + one tiny Worker for the form.** Simplest thing that works,
and it happens to be exactly what Cloudflare now recommends.

---

## Step 0 — What I already changed in the repo

Done, committed, verified locally. Listed so you know what you're deploying.

**`next.config.ts`** — `output: "export"` and `images.unoptimized`. `next build`
now writes an `out/` directory of plain files.

**`app/api/contact/route.ts` → `worker/index.ts`.** A static export can't include
a POST handler. The logic moved to a Worker with an **identical JSON contract**,
so `ContactForm.tsx` needed no changes. Validation, the honeypot, and every
status code behave the same.

**`wrangler.jsonc`** — tells Cloudflare to serve `./out` as files and to invoke
the Worker only for `/api/*`. Your entire site therefore costs **zero Worker
requests**; only form submissions count.

**`export const dynamic = "force-static"`** on the OG image, icon, sitemap,
robots and manifest routes. Required by `output: "export"`, and correct anyway —
none of them depend on the request.

**`public/_headers`** — and here is the one that would have quietly cost you
something. Next exports OG images to **extensionless paths** (`out/opengraph-image`,
not `opengraph-image.png`). Cloudflare infers MIME type from the file extension,
so without an explicit rule every card ships as `application/octet-stream` and
**every link preview on WhatsApp, LinkedIn, Slack and X silently breaks** — no
error, just a blank card. `_headers` now forces `Content-Type: image/png` on all
14 generated images. Verified with `wrangler dev`.

Two new scripts:

```bash
pnpm preview   # build + serve through the real Cloudflare asset router
pnpm deploy    # build + deploy (after step 2)
```

`pnpm preview` is worth knowing about: it runs your actual `_headers` and
`_redirects` rules, so what you see locally is what production does.

---

## Step 1 — Push to GitHub (5 min)

```bash
git checkout -b deploy
git add -A
git commit -m "Static export + Cloudflare Workers deployment"
git push -u origin deploy
```

Merge to `main` when you're happy. Cloudflare will watch `main`.

> Nothing secret is in the repo. `RESEND_API_KEY` is set in the Cloudflare
> dashboard in step 6 and never committed.

---

## Step 2 — Deploy to Cloudflare Workers (15 min)

1. Cloudflare dashboard → **Compute (Workers)** → **Create** → **Import a repository**.
2. Authorise GitHub, pick the portfolio repo.
3. Build settings — most are detected, confirm these exactly:

   | Field | Value |
   |---|---|
   | Project name | `rajanna-dev` |
   | Production branch | `main` |
   | Build command | `pnpm build` |
   | Deploy command | `npx wrangler deploy` |
   | Path / root directory | *(leave blank)* |

4. **Environment variables** → add `NODE_VERSION` = `22`.
5. **Save and Deploy.** First build takes 2–4 minutes.

You now have `https://rajanna-dev.<your-subdomain>.workers.dev`. Open it — the
whole site should work except the contact form, which correctly returns *"Email
isn't configured yet"* because `RESEND_API_KEY` isn't set. That is the expected
state at this point, not a bug.

**Verify before moving on:**

```bash
W=https://rajanna-dev.<your-subdomain>.workers.dev
curl -sI $W/opengraph-image | grep -i content-type   # must say image/png
curl -s  $W/robots.txt | head -3
curl -sI $W/ | grep -i x-robots-tag                  # must say noindex
```

That last one matters: `_headers` noindexes the `workers.dev` host so it never
competes with your real domain in search results.

---

## Step 3 — Add the domain (10 min + DNS wait)

`rajanna.dev` is already on Cloudflare, so this is quick.

1. Your Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**.
2. Enter `rajanna.dev`. Add it.
3. Repeat for `www.rajanna.dev`.

Cloudflare creates the DNS records and issues the certificate automatically —
usually under two minutes, occasionally up to fifteen. You do not touch DNS
manually and you do not need a CNAME.

---

## Step 4 — Pick one canonical host (5 min)

`rajanna.dev` and `www.rajanna.dev` now both serve the site. **Leaving it that
way is the duplicate-content mistake you already fixed once on RosterBay** —
Google indexes both and splits the ranking signal between them.

Every canonical URL the site emits is the bare apex (`https://rajanna.dev/work`),
so **apex wins and www redirects to it**.

Dashboard → `rajanna.dev` → **Rules** → **Redirect Rules** → **Create rule**:

- Name: `www to apex`
- If — custom filter expression: `Hostname equals www.rajanna.dev`
- Then: **Dynamic redirect**, expression
  `concat("https://rajanna.dev", http.request.uri.path)`
- Status: **301**, and tick **preserve query string**

I did not put this in `_redirects` on purpose: a cross-hostname redirect belongs
at the edge, where it runs before the Worker and keeps working no matter how the
site is later deployed.

**Verify:**

```bash
curl -sI https://www.rajanna.dev/work | grep -i '^location'
# expect: location: https://rajanna.dev/work
```

---

## Step 5 — Email routing: `hello@rajanna.dev` → your Gmail (10 min)

Now DNS exists, so email can be set up. This is the free half — receiving.

1. Dashboard → `rajanna.dev` → **Email** → **Email Routing** → **Get started**.
2. Cloudflare adds the MX and SPF records for you. Accept them.
3. **Destination addresses** → add `rajannaadeli@gmail.com` → Cloudflare emails
   you a confirmation link → click it. **This step is required**; routing stays
   inactive until the destination is verified.
4. **Routing rules** → **Create address**:
   - Custom address: `hello@rajanna.dev`
   - Action: **Send to an email** → `rajannaadeli@gmail.com`
5. **Catch-all** → enable → same destination. Now `anything@rajanna.dev` reaches
   you and nothing ever bounces — useful when a client mistypes the address.

**Verify:** from a phone or a non-Gmail account, email `hello@rajanna.dev`. It
should land in your Gmail inbox within a minute.

### 5b — Reply *as* hello@rajanna.dev (10 min, do not skip)

Cloudflare Email Routing forwards but **cannot send**. Without this step, a
client emails `hello@rajanna.dev` and gets a reply from
`rajannaadeli@gmail.com` — which undercuts the whole impression the site is
built to create.

1. Google Account → **Security** → 2-Step Verification must be **on** → **App
   passwords** → create one named `rajanna.dev`. Copy the 16 characters.
2. Gmail → ⚙️ → **See all settings** → **Accounts and Import** → **Send mail as**
   → **Add another email address**.
3. Name `Rajanna Adeli`, Email `hello@rajanna.dev`, **untick "Treat as an alias"**.
4. SMTP server `smtp.gmail.com`, Port `587`, Username your full Gmail address,
   Password the **app password** from step 1, **TLS**.
5. Google sends a confirmation to `hello@rajanna.dev`, which routes back to your
   inbox. Click the link.
6. Back in **Accounts and Import** → set `hello@rajanna.dev` as the **default**
   From address, and select **"Reply from the same address the message was sent
   to."**

**Verify:** reply to your own test from step 5 and check the From header reads
`hello@rajanna.dev`.

---

## Step 6 — Resend, for the contact form (15 min)

Cloudflare Email Routing handles mail *sent to you by humans*. The contact form
is different: your Worker has to *send* an email programmatically. That's Resend.

Free tier is 3,000 emails/month and 100/day — a portfolio form will use maybe
ten.

### 6a — Verify the domain

1. https://resend.com → sign up (use your Gmail).
2. **Domains** → **Add Domain** → `rajanna.dev` → pick the region closest to your
   clients (`ap-southeast-1` or `us-east-1`; it only affects sending latency).
3. Resend shows a set of DNS records. Add each in Cloudflare → `rajanna.dev` →
   **DNS** → **Add record**. Typically:

   | Type | Name | Value | Notes |
   |---|---|---|---|
   | MX | `send` | `feedback-smtp.<region>.amazonses.com` | Priority `10` |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` | SPF |
   | TXT | `resend._domainkey` | *(long key from Resend)* | DKIM |

   **Two things that trip people up:**
   - Enter the name as **`send`**, not `send.rajanna.dev`. Cloudflare appends the
     domain, and pasting the full name gives you `send.rajanna.dev.rajanna.dev`.
   - Set proxy status to **DNS only** (grey cloud, not orange) on every record.
     A proxied record is the usual cause of verification never completing.

4. Add a DMARC record too — not required by Resend, but it materially improves
   deliverability and stops your enquiries landing in spam:

   | Type | Name | Value |
   |---|---|---|
   | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@rajanna.dev` |

5. Back in Resend → **Verify DNS Records**. Usually minutes; officially up to 72
   hours.

> **The MX record is on the `send` subdomain, so it does not conflict with
> Cloudflare Email Routing's MX on the root.** Both coexist. Do not delete
> Cloudflare's MX records to "make room" — that would break `hello@rajanna.dev`
> receiving.

### 6b — API key and wiring

1. Resend → **API Keys** → **Create** → name `rajanna-dev-contact`, permission
   **Sending access**. Copy it now; it is shown once.
2. Cloudflare → your Worker → **Settings** → **Variables and Secrets** → **Add**:

   | Name | Value | Type |
   |---|---|---|
   | `RESEND_API_KEY` | the key | **Secret** (encrypted) |
   | `CONTACT_TO` | `hello@rajanna.dev` | Text |
   | `CONTACT_FROM` | `Portfolio <hello@rajanna.dev>` | Text |

   `CONTACT_TO` and `CONTACT_FROM` are optional — the Worker defaults to
   `hello@rajanna.dev` for both. Set them anyway so a future change needs no
   redeploy.

3. **Redeploy** (Deployments → Retry, or push a commit). Secrets are only picked
   up by a new deployment.

**Verify:** submit the form on the live site. You should get *"Got it."* on
screen and an email at `hello@rajanna.dev` → forwarded to Gmail → with the
sender's address in **Reply-To**, so replying goes straight back to them.

The full flow, once it's all wired:

```
visitor fills form
  → POST /api/contact              (your Worker)
  → Resend API                     (sends as hello@rajanna.dev)
  → hello@rajanna.dev              (Cloudflare Email Routing)
  → rajannaadeli@gmail.com         (your inbox)
  → you hit reply                  (Gmail "send as" → from hello@rajanna.dev)
  → straight to the client
```

---

## Step 7 — Analytics (3 min)

Dashboard → **Analytics & Logs** → **Web Analytics** → **Add a site** →
`rajanna.dev` → copy the token.

Worker → Settings → Variables → add `NEXT_PUBLIC_CF_BEACON_TOKEN` = the token →
redeploy. Free, cookieless, **no consent banner needed**, and it doesn't touch
your Lighthouse score.

---

## Step 8 — Search Console (15 min) — the SEO payoff

All the SEO work is inert until Google is told the site exists.

1. https://search.google.com/search-console → **Add property** → **Domain**
   (not URL prefix — Domain covers apex, www, http and https in one).
2. It gives a TXT record → Cloudflare → DNS → TXT, name `@`, paste → **Verify**.
3. **Sitemaps** → submit `sitemap.xml`.
4. **URL Inspection** → paste each of the 8 URLs → **Request indexing**. Do this
   manually, once. It's the difference between indexed this week and next month.

```
https://rajanna.dev
https://rajanna.dev/work
https://rajanna.dev/work/rosterbay
https://rajanna.dev/work/whitefleet
https://rajanna.dev/work/gad
https://rajanna.dev/work/docfort
https://rajanna.dev/work/planit
https://rajanna.dev/work/dilpos
```

5. **Bing Webmaster Tools** → *Import from Google Search Console* → one click.
   Bing feeds DuckDuckGo and ChatGPT's web results.

---

## Step 9 — Final verification

```bash
pnpm seo:check https://rajanna.dev        # expect: 0 failures
```

Then by hand:

- [ ] `https://rajanna.dev` loads; `www` 301s to apex
- [ ] `workers.dev` host returns `X-Robots-Tag: noindex`; apex does **not**
- [ ] `curl -sI https://rajanna.dev/opengraph-image | grep -i content-type` → `image/png`
- [ ] Paste a case URL into **WhatsApp** — the truest OG test, and it caches hard,
      so get it right before you share it widely
- [ ] https://search.google.com/test/rich-results on a case URL → Person,
      SoftwareApplication, Article, BreadcrumbList all detected
- [ ] Email an outside address → `hello@rajanna.dev` → arrives in Gmail
- [ ] Reply → From header reads `hello@rajanna.dev`
- [ ] Contact form → success state → email arrives with correct Reply-To
- [ ] `/cv` downloads the résumé PDF
- [ ] Lighthouse against the **live** URL, not localhost
- [ ] Real phone: nav, form, images, motion
- [ ] Site URL added to LinkedIn, GitHub and Upwork profiles

---

## Ongoing cost

₹0. Workers free tier is 100,000 requests/day and static assets don't count
against it; Email Routing, Web Analytics and SSL are free; Resend's free tier is
300× what this form will use. **Domain renewals only** — `rajanna.dev` and
`rosterbay.com`, roughly ₹2,000/year combined.

---

## If something breaks

| Symptom | Cause | Fix |
|---|---|---|
| Link previews show a blank card | `Content-Type` on OG images | Check `public/_headers` shipped; `curl -sI .../opengraph-image` |
| Resend won't verify | Record proxied, or name entered as `send.rajanna.dev` | Grey-cloud the record; the name is just `send` |
| `hello@` stopped receiving | Cloudflare MX deleted while adding Resend's | Email Routing → re-add records |
| Form returns 503 | `RESEND_API_KEY` unset, or set but not redeployed | Add the secret, then redeploy |
| Form returns 502 | Resend rejected it — usually domain not verified, or `CONTACT_FROM` on an unverified domain | Check Resend → Logs |
| Both hosts in Google | Redirect rule missing | Step 4 |
| Build fails on Cloudflare | Node version | Set `NODE_VERSION` = `22` |
