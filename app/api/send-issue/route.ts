/**
 * Sends the weekly letter to subscribers (Mondays, 7 a.m. New York time).
 *
 * Two ways in:
 *
 *  1. MANUAL (what you'll use at first): `npm run send-issue`
 *     The script calls POST /api/send-issue with your CRON_SECRET.
 *     ?mode=dry-run   build the email and report what WOULD be sent (default)
 *     ?mode=test&to=you@emory.edu   send one copy to yourself
 *     ?mode=send      send to every subscriber
 *     &force=1        send even if the issue isn't dated today / was already sent
 *
 *  2. AUTOMATIC: Vercel Cron calls GET /api/send-issue (see vercel.json).
 *     It does nothing unless CRON_ENABLED=true, and it only sends at
 *     7 a.m. New York time on Mondays.
 *
 * Every request must include `Authorization: Bearer <CRON_SECRET>`.
 * Vercel adds this header to cron requests automatically.
 */
import { NextResponse, type NextRequest } from "next/server";
import { buildIssueEmail, emailConfig, getResend, missingEmailSettings } from "@/lib/email";
import { newYorkClock, todayInNewYork } from "@/lib/marketHours";

type Mode = "dry-run" | "test" | "send";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
}

/* ───────────── Vercel Cron (GET) ───────────── */

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // The off switch. Flip CRON_ENABLED to "true" in Vercel when you're ready.
  if (process.env.CRON_ENABLED !== "true") {
    return NextResponse.json({ skipped: "Cron is disabled (set CRON_ENABLED=true to turn it on)." });
  }

  // vercel.json schedules two runs (11:00 and 12:00 UTC) because 7 a.m. New York
  // is 11:00 UTC in summer and 12:00 UTC in winter. Only the one at 7 a.m. sends.
  const { hour, weekday } = newYorkClock();
  if (hour !== 7 || weekday !== "Mon") {
    return NextResponse.json({ skipped: `Not 7 a.m. on a Monday in New York (it's ${weekday} ${hour}:00).` });
  }

  return run("send", { force: false });
}

/* ───────────── Manual trigger (POST) ───────────── */

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const mode = (params.get("mode") ?? "dry-run") as Mode;
  if (!["dry-run", "test", "send"].includes(mode)) {
    return NextResponse.json({ error: `Unknown mode "${mode}". Use dry-run, test, or send.` }, { status: 400 });
  }
  return run(mode, { force: params.get("force") === "1", to: params.get("to") ?? undefined });
}

/* ───────────── Shared logic ───────────── */

async function run(mode: Mode, opts: { force: boolean; to?: string }) {
  const email = await buildIssueEmail();
  const today = todayInNewYork();
  const summary = {
    mode,
    issueDate: email.issueDate,
    subject: email.subject,
    previewText: email.previewText,
    sampleData: email.isSampleData,
    sizeKb: Math.round(email.html.length / 1024),
  };

  // Safety checks before anything goes to real people
  const problems: string[] = [];
  if (email.isDraft) problems.push("The latest issue is still a draft (or there are no issue files).");
  if (email.issueDate !== today) problems.push(`The latest issue is dated ${email.issueDate}, not today (${today}).`);

  if (mode === "dry-run") {
    return NextResponse.json({ ...summary, wouldBlockSend: problems, missingSettings: missingEmailSettings() });
  }

  const missing = missingEmailSettings();
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing settings: ${missing.join(", ")}` }, { status: 500 });
  }

  const resend = getResend();
  const { from, replyTo, segmentId } = emailConfig();

  // Test: one copy to one address. Drafts and old issues are fine here.
  if (mode === "test") {
    if (!opts.to) return NextResponse.json({ error: "Add &to=you@example.com for a test send." }, { status: 400 });
    // Real unsubscribe links only exist in broadcasts, so point test copies at the site
    const testEmail = await buildIssueEmail(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com");
    const { data, error } = await resend.emails.send({
      from,
      to: opts.to,
      replyTo,
      subject: `[TEST] ${testEmail.subject}`,
      html: testEmail.html,
      text: testEmail.text,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 502 });
    return NextResponse.json({ ...summary, sentTo: opts.to, id: data?.id });
  }

  // Send to everyone
  if (problems.length > 0 && !opts.force) {
    return NextResponse.json({ error: "Not sending.", problems, hint: "Fix the issue file, or add force=1 if you're sure." }, { status: 409 });
  }

  // Don't send the same day's issue twice (e.g. if the cron retries)
  const broadcastName = `issue-${email.issueDate}`;
  if (!opts.force) {
    const { data: existing } = await resend.broadcasts.list({ limit: 20 });
    if (existing?.data.some((b) => b.name === broadcastName && b.status !== "draft")) {
      return NextResponse.json({ skipped: `Already sent ${broadcastName}.` });
    }
  }

  const { data, error } = await resend.broadcasts.create({
    name: broadcastName,
    segmentId,
    from,
    replyTo,
    subject: email.subject,
    previewText: email.previewText,
    html: email.html,
    text: email.text,
    send: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });
  return NextResponse.json({ ...summary, broadcastId: data?.id, status: "sent" });
}
