"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MetaLabel } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { SITE } from "@/lib/site";

/*
  ContactForm — posts to /api/contact, which the Cloudflare Worker relays to
  Resend.

  Four states, each with its own job:

    idle        the form
    submitting  the button is disabled, so nothing double-sends
    sent        confirmation, addressed to the person by name
    undelivered the transport failed — the typed message is still in the inputs
                and an escape hatch mails it directly

  The last one is the point. A contact form that loses what someone wrote is
  worse than no form at all, so a delivery failure never clears the fields and
  never leaves the visitor without a way through.
*/

type Status = "idle" | "submitting" | "sent" | "undelivered";

const field =
  "rounded-sm border border-border bg-surface-1 px-4 py-3 font-body text-text outline-none " +
  "transition-colors focus:border-border-hover disabled:opacity-60";

interface Payload {
  name: string;
  email: string;
  message: string;
}

/*
  Mirrors the Worker's validate() exactly. The server stays authoritative — this
  only avoids a pointless round trip on an obviously empty form, and lets the
  first bad field take focus straight away.
*/
function validate(p: Payload): Record<string, string> {
  const errors: Record<string, string> = {};
  if (p.name.trim().length < 2) errors.name = "Please add your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errors.email = "A valid email, please.";
  if (p.message.trim().length < 10) errors.message = "A little more detail helps.";
  return errors;
}

const FIELD_ORDER: (keyof Payload)[] = ["name", "email", "message"];

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  // The last payload submitted, whatever its outcome. Both the confirmation and
  // the failure panel read from this rather than from the DOM: during the render
  // that introduces the panel, the inputs still carry the previous commit's
  // `disabled` attribute, and disabled controls are omitted from FormData.
  const [attempt, setAttempt] = useState<Payload | null>(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Move focus to the first field the server or the client rejected.
  useEffect(() => {
    const first = FIELD_ORDER.find((f) => errors[f]);
    if (!first || !formRef.current) return;
    formRef.current.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [errors]);

  async function send(payload: Payload) {
    setStatus("submitting");
    setAttempt(payload);
    setErrors({});
    setReason("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok && body.ok) {
        setStatus("sent");
        formRef.current?.reset();
        return;
      }
      if (body.errors) {
        setErrors(body.errors);
        setStatus("idle");
        return;
      }
      setReason(body.error ?? "The server refused the message.");
      setStatus("undelivered");
    } catch {
      setReason("The request never reached the server.");
      setStatus("undelivered");
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Read the form BEFORE any await. React nulls out `currentTarget` once the
    // synchronous handler returns, so touching it after an await throws — which
    // is exactly how a successful send once reported itself as a network error.
    const data = new FormData(e.currentTarget);
    if (data.get("company")) return; // honeypot: a bot filled the hidden input

    const payload: Payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    const local = validate(payload);
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }
    void send(payload);
  }

  function reset() {
    setAttempt(null);
    setErrors({});
    setReason("");
    setCopied(false);
    setStatus("idle");
  }

  /* ── Sent ──────────────────────────────────────────────────────────────── */
  if (status === "sent" && attempt) {
    const firstName = attempt.name.trim().split(/\s+/)[0];
    return (
      <div
        className="rounded-card border border-border bg-surface-1 p-8 sm:p-10"
        role="status"
        aria-live="polite"
      >
        <svg
          className="rise-in"
          width="56"
          height="56"
          viewBox="0 0 52 52"
          fill="none"
          aria-hidden
        >
          <circle
            className="draw-stroke"
            style={{ "--len": 151, "--delay": "0s" } as React.CSSProperties}
            cx="26"
            cy="26"
            r="24"
            stroke="var(--color-accent-lime)"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <path
            className="draw-stroke"
            style={{ "--len": 36, "--delay": "0.32s" } as React.CSSProperties}
            d="M15 26.5 L23 34 L37 19"
            stroke="var(--color-accent-lime)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p
          className="rise-in mt-6 font-display text-h2 text-text"
          style={{ "--delay": "0.1s" } as React.CSSProperties}
        >
          Got it, {firstName}.
        </p>
        <p
          className="rise-in mt-3 max-w-[46ch] font-body text-body-lg text-muted"
          style={{ "--delay": "0.16s" } as React.CSSProperties}
        >
          Your message is with me. I&rsquo;ll reply to{" "}
          <span className="text-text">{attempt.email}</span> within a day, usually sooner.
        </p>

        <div
          className="rise-in mt-8 border-t border-border pt-6"
          style={{ "--delay": "0.22s" } as React.CSSProperties}
        >
          <MetaLabel>What happens next</MetaLabel>
          <ol className="mt-4 flex flex-col gap-3">
            {[
              "I read it properly and come back with questions.",
              "You get a scope and a fixed price, or a paid discovery session if the shape isn't clear yet.",
            ].map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="shrink-0 font-mono text-meta text-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-body text-body text-muted">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div
          className="rise-in mt-8 flex flex-wrap gap-3"
          style={{ "--delay": "0.28s" } as React.CSSProperties}
        >
          <Button href={SITE.links.rosterbay} external>
            Open the live demo ↗
          </Button>
          <Button variant="secondary" onClick={reset}>
            Send another
          </Button>
        </div>
      </div>
    );
  }

  /* ── Idle / submitting / undelivered ───────────────────────────────────── */
  const busy = status === "submitting";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      {(
        [
          { name: "name", label: "Name", type: "text", autoComplete: "name" },
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
        ] as const
      ).map((f) => (
        <label key={f.name} className="flex flex-col gap-2">
          <MetaLabel>{f.label}</MetaLabel>
          <input
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            disabled={busy}
            aria-invalid={Boolean(errors[f.name])}
            aria-describedby={errors[f.name] ? `err-${f.name}` : undefined}
            className={cn(field, errors[f.name] && "border-accent-orange")}
          />
          {errors[f.name] ? (
            <span id={`err-${f.name}`} className="font-body text-[13px] text-accent-orange">
              {errors[f.name]}
            </span>
          ) : null}
        </label>
      ))}

      <label className="flex flex-col gap-2">
        <MetaLabel>What are you building?</MetaLabel>
        <textarea
          name="message"
          rows={5}
          disabled={busy}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "err-message" : undefined}
          className={cn(field, errors.message && "border-accent-orange")}
        />
        {errors.message ? (
          <span id="err-message" className="font-body text-[13px] text-accent-orange">
            {errors.message}
          </span>
        ) : null}
      </label>

      {/* Delivery failed. The fields above still hold everything they typed. */}
      {status === "undelivered" && attempt ? (
        <UndeliveredPanel
          reason={reason}
          payload={attempt}
          copied={copied}
          onCopy={async () => {
            try {
              await navigator.clipboard.writeText(
                `From: ${attempt.name} <${attempt.email}>\n\n${attempt.message}`,
              );
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        />
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : status === "undelivered" ? "Try again" : "Send"}
        </Button>
        <span className="sr-only" role="status" aria-live="polite">
          {busy ? "Sending your message" : ""}
        </span>
      </div>
    </form>
  );
}

function UndeliveredPanel({
  reason,
  payload,
  copied,
  onCopy,
}: {
  reason: string;
  payload: Payload;
  copied: boolean;
  onCopy: () => void;
}) {
  const subject = `Portfolio enquiry — ${payload.name}`;
  const body = `${payload.message}\n\n— ${payload.name} (${payload.email})`;
  const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div
      role="alert"
      className="rise-in rounded-card border border-accent-orange/40 bg-surface-1 p-6"
    >
      <div className="flex items-start gap-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="mt-0.5 shrink-0">
          <circle
            className="draw-stroke"
            style={{ "--len": 66 } as React.CSSProperties}
            cx="12"
            cy="12"
            r="10.5"
            stroke="var(--color-accent-orange)"
            strokeWidth="1.5"
          />
          <path
            d="M12 7v6"
            stroke="var(--color-accent-orange)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16.5" r="1.15" fill="var(--color-accent-orange)" />
        </svg>
        <div>
          <p className="font-display text-h3 text-text">That didn&rsquo;t send.</p>
          <p className="mt-2 font-body text-body text-muted">
            {reason} Nothing is lost, though. Your message is still in the fields above, so you can
            try again or send it straight to my inbox.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={mailto}
          className="inline-flex items-center rounded-pill border border-border-hover px-5 py-2.5 font-mono text-meta uppercase text-text transition-colors hover:bg-surface-2"
        >
          Email it to me instead ↗
        </a>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center rounded-pill px-5 py-2.5 font-mono text-meta uppercase text-muted transition-colors hover:text-text"
        >
          {copied ? "Copied ✓" : "Copy message"}
        </button>
      </div>
    </div>
  );
}
