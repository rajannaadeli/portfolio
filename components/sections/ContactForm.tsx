"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MetaLabel } from "@/components/ui/typography";

/*
  ContactForm — posts to /api/contact (Resend). Inline validation, submitting /
  success / error states, and a honeypot (`company`) hidden from humans.
*/

type Status = "idle" | "submitting" | "success" | "error";

const field =
  "rounded-sm border border-border bg-surface-1 px-4 py-3 font-body text-text outline-none transition-colors focus:border-border-hover";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrors({});
    setMessage("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStatus("success");
        e.currentTarget.reset();
      } else if (json.errors) {
        setErrors(json.errors);
        setStatus("error");
      } else {
        setMessage(json.error ?? "Something went wrong.");
        setStatus("error");
      }
    } catch {
      setMessage("Network error. Please email me directly.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-card border border-border bg-surface-1 p-8">
        <p className="font-display text-h3 text-text">Got it.</p>
        <p className="mt-2 font-body text-body text-muted">
          Thanks for reaching out. I&rsquo;ll reply within a day, usually sooner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      <label className="flex flex-col gap-2">
        <MetaLabel>Name</MetaLabel>
        <input name="name" type="text" autoComplete="name" className={field} />
        {errors.name ? <span className="font-body text-[13px] text-accent-orange">{errors.name}</span> : null}
      </label>
      <label className="flex flex-col gap-2">
        <MetaLabel>Email</MetaLabel>
        <input name="email" type="email" autoComplete="email" className={field} />
        {errors.email ? <span className="font-body text-[13px] text-accent-orange">{errors.email}</span> : null}
      </label>
      <label className="flex flex-col gap-2">
        <MetaLabel>What are you building?</MetaLabel>
        <textarea name="message" rows={5} className={field} />
        {errors.message ? (
          <span className="font-body text-[13px] text-accent-orange">{errors.message}</span>
        ) : null}
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit">{status === "submitting" ? "Sending…" : "Send"}</Button>
        {status === "error" && message ? (
          <span className="font-body text-[13px] text-accent-orange">{message}</span>
        ) : null}
      </div>
    </form>
  );
}
