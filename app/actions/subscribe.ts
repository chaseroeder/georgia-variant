"use server";

/**
 * Newsletter signup (a "Server Action").
 *
 * The signup form calls this function directly; it runs on the server,
 * so your Resend API key never reaches the browser.
 *
 * Steps: validate the email → add it to the Resend segment → send a
 * short welcome email. If Resend isn't configured yet, development mode
 * pretends it worked (and logs it) so you can test the form.
 */
import { z } from "zod";
import { buildWelcomeEmail, emailConfig, getResend, missingEmailSettings } from "@/lib/email";

export interface SubscribeState {
  status: "idle" | "success" | "error";
  message: string;
  /** What the reader typed, so the form can refill it after an error */
  email?: string;
}

const emailSchema = z.email({ message: "Please enter a valid email address." }).max(320);

export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  // Honeypot: a hidden field real people never fill in. Bots usually do.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { status: "success", message: "Thanks! You're subscribed." };
  }

  const typed = String(formData.get("email") ?? "").trim();
  const parsed = emailSchema.safeParse(typed.toLowerCase());
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please enter a valid email address.", email: typed };
  }
  const email = parsed.data;

  // Not configured yet?
  const missing = missingEmailSettings();
  if (missing.length > 0) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[subscribe] Dev mode: would subscribe ${email}. Missing settings: ${missing.join(", ")}`);
      return { status: "success", message: "Dev mode: the form works, but nothing was saved (Resend isn't set up yet)." };
    }
    console.error(`[subscribe] Can't subscribe: missing ${missing.join(", ")}`);
    return { status: "error", message: "Signups aren't open yet. Please check back soon." };
  }

  const resend = getResend();
  const { segmentId, from, replyTo } = emailConfig();

  // 1. Add to the subscriber list
  const { error } = await resend.contacts.create({ email, unsubscribed: false, segments: [{ id: segmentId }] });
  if (error) {
    // Someone signing up twice isn't a problem worth showing as an error
    if (/already exists|duplicate/i.test(error.message)) {
      return { status: "success", message: "You're already subscribed. See you tomorrow morning." };
    }
    console.error("[subscribe] Resend error:", error);
    return { status: "error", message: "Something went wrong on our end. Please try again in a minute.", email };
  }

  // 2. Welcome email (if this fails, the signup still counts)
  try {
    const welcome = await buildWelcomeEmail();
    await resend.emails.send({ from, to: email, replyTo, ...welcome });
  } catch (err) {
    console.warn("[subscribe] Welcome email failed:", err);
  }

  return { status: "success", message: "You're in! Check your inbox for a welcome email." };
}
