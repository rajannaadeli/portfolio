import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";

/*
  Contact endpoint — serverless, Resend, no database (brief §8). Calls the Resend
  REST API directly (no SDK dependency). Honeypot + basic validation. Requires
  env: RESEND_API_KEY, and optionally CONTACT_TO (defaults to SITE.email) and
  CONTACT_FROM (a verified Resend sender).
*/

export const runtime = "nodejs";

interface Body {
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot — must stay empty
}

function valid(b: Body) {
  const errors: Record<string, string> = {};
  if (!b.name || b.name.trim().length < 2) errors.name = "Please add your name.";
  if (!b.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) errors.email = "A valid email, please.";
  if (!b.message || b.message.trim().length < 10) errors.message = "A little more detail helps.";
  return errors;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  // Honeypot: a filled `company` field means a bot. Pretend success.
  if (body.company) return NextResponse.json({ ok: true });

  const errors = valid(body);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured yet — surface a clear, honest error instead of pretending.
    return NextResponse.json(
      { ok: false, error: "Email isn't configured yet. Please email me directly for now." },
      { status: 503 },
    );
  }

  const to = process.env.CONTACT_TO ?? SITE.email;
  const from = process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      reply_to: body.email,
      subject: `New enquiry from ${body.name}`,
      text: `From: ${body.name} <${body.email}>\n\n${body.message}`,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: "Could not send. Try email instead." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
