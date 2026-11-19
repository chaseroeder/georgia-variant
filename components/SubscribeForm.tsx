"use client";

import { useActionState, useId } from "react";
import { subscribe, type SubscribeState } from "@/app/actions/subscribe";

/**
 * Email signup form. `tone="navy"` is for dark navy backgrounds.
 *
 * useActionState wires the form to the `subscribe` Server Action and
 * gives us its result (success/error message) plus a pending flag.
 */
const initial: SubscribeState = { status: "idle", message: "" };

export function SubscribeForm({ tone = "light" }: { tone?: "light" | "navy" }) {
  const [state, formAction, pending] = useActionState(subscribe, initial);
  const id = useId();
  const onNavy = tone === "navy";

  if (state.status === "success") {
    return (
      <p
        role="status"
        className={`rounded-2xl px-5 py-4 text-base font-medium ${
          onNavy ? "bg-white/10 text-white" : "band-alt text-ink-strong"
        }`}
      >
        ✓ {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="w-full" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@emory.edu"
          // React resets forms after submitting; refill what they typed if there was an error
          key={state.email ?? "empty"}
          defaultValue={state.email}
          aria-invalid={state.status === "error" || undefined}
          aria-describedby={state.status === "error" ? `${id}-msg` : undefined}
          className={`min-w-0 flex-1 rounded-full border px-5 py-3 text-base outline-none transition-colors ${
            onNavy
              ? "border-white/25 bg-white/10 text-white placeholder:text-white/60 focus:border-light-blue"
              : "border-rule bg-surface text-ink placeholder:text-ink-muted focus:border-navy dark:focus:border-light-blue"
          }`}
        />
        {/* Honeypot: hidden from people and screen readers; bots fill it in */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button
          type="submit"
          disabled={pending}
          className={`rounded-full px-6 py-3 text-base font-semibold shadow-card transition-all hover:-translate-y-px hover:shadow-card-hover disabled:translate-y-0 disabled:opacity-70 ${
            onNavy ? "bg-light-blue text-navy" : "bg-navy text-white dark:bg-light-blue dark:text-navy"
          }`}
        >
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {state.status === "error" ? (
        <p id={`${id}-msg`} role="alert" className={`mt-2 px-2 text-sm ${onNavy ? "text-loss-on-navy" : "text-loss"}`}>
          {state.message}
        </p>
      ) : (
        <p className={`mt-2 px-2 text-xs ${onNavy ? "text-white/70" : "text-ink-muted"}`}>
          Free, every Monday before the bell. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
