import { SITE } from "../lib/site";

/*
  The one dynamic route on rajanna.dev.

  Everything else is a static file in ./out, served directly by Cloudflare's
  asset layer without invoking this Worker at all (see `run_worker_first` in
  wrangler.jsonc). This handles POST /api/contact and nothing more.

  The JSON contract is identical to the Next.js route handler it replaces, so
  components/sections/ContactForm.tsx needs no changes:
    200 { ok: true }                     — sent (or honeypot silently swallowed)
    400 { ok: false, error }             — unparseable body
    422 { ok: false, errors: {field:msg} } — validation, rendered inline
    503 { ok: false, error }             — RESEND_API_KEY not set
    502 { ok: false, error }             — Resend refused
*/

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

interface Body {
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot — must stay empty
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function validate(b: Body): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!b.name || b.name.trim().length < 2) errors.name = "Please add your name.";
  if (!b.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))
    errors.email = "A valid email, please.";
  if (!b.message || b.message.trim().length < 10) errors.message = "A little more detail helps.";
  return errors;
}

/*
  GET /api/contact is a config probe, not part of the form flow.

  It answers the only question worth asking when the form says "not configured":
  is RESEND_API_KEY actually visible in `env` at runtime? Cloudflare has two
  separate variable stores — "Build variables and secrets" (scoped to the build
  container) and runtime variables/secrets — and a key placed in the first never
  reaches `env`. This reports a boolean, never the key itself.

    curl -s https://rajanna.dev/api/contact
*/
function probe(env: Env): Response {
  return json({
    endpoint: "contact",
    resendKeyPresent: Boolean(env.RESEND_API_KEY),
    to: env.CONTACT_TO ?? SITE.email,
    from: env.CONTACT_FROM ?? `Portfolio <${SITE.email}>`,
  });
}

async function contact(request: Request, env: Env): Promise<Response> {
  if (request.method === "GET") return probe(env);
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ ok: false, error: "Bad request." }, 400);
  }

  // A filled `company` field means a bot filled a hidden input. Report success
  // so the bot does not learn anything, and send nothing.
  if (body.company) return json({ ok: true });

  const errors = validate(body);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422);

  if (!env.RESEND_API_KEY) {
    // Honest failure beats a fake success: the visitor is told to email directly
    // rather than believing a message was delivered into a void.
    console.error(
      "RESEND_API_KEY missing from runtime env. It must be a runtime secret " +
        "(wrangler secret put RESEND_API_KEY), not a Workers Builds build variable.",
    );
    return json(
      { ok: false, error: "Email isn't configured yet. Please email me directly for now." },
      503,
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM ?? `Portfolio <${SITE.email}>`,
      to: env.CONTACT_TO ?? SITE.email,
      reply_to: body.email,
      subject: `New enquiry from ${body.name}`,
      text: `From: ${body.name} <${body.email}>\n\n${body.message}`,
    }),
  });

  if (!res.ok) {
    // The visitor gets a plain message; the real reason (unverified domain,
    // bad key, malformed from-address) goes to the Worker log, where
    // `wrangler tail` can read it. Swallowing it silently is what makes this
    // class of failure take an afternoon to diagnose.
    const detail = await res.text().catch(() => "");
    console.error(`Resend ${res.status}: ${detail}`);
    return json({ ok: false, error: "Could not send. Try email instead." }, 502);
  }
  return json({ ok: true });
}

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/contact") return contact(request, env);
    // Anything else that reaches the Worker falls through to the static files.
    return env.ASSETS.fetch(request);
  },
};

export default handler;
