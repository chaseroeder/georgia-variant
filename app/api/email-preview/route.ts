/**
 * Shows today's newsletter email in your browser, exactly as it will be sent.
 *
 *   Local:      http://localhost:3000/api/email-preview
 *   Plain text: http://localhost:3000/api/email-preview?format=text
 *   Live site:  /api/email-preview?secret=<CRON_SECRET>  (locked so the public can't see drafts)
 */
import { type NextRequest } from "next/server";
import { buildIssueEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  const secret = process.env.CRON_SECRET;
  if (!isDev && (!secret || req.nextUrl.searchParams.get("secret") !== secret)) {
    return new Response("Not found", { status: 404 });
  }

  const email = await buildIssueEmail("#unsubscribe-link-goes-here");

  if (req.nextUrl.searchParams.get("format") === "text") {
    return new Response(`Subject: ${email.subject}\n\n${email.text}`, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(email.html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
